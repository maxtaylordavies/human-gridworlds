package store

import (
	"encoding/json"
	"errors"
	"log"
	"os"
	"time"
)

type Condition struct {
	PhisRelevant       bool   `json:"phisRelevant"`
	ParticipantPhiType string `json:"participantPhiType"` // "neutral", "arbitrary", "matched", "mismatched"
}

type QuizResponse []int

type Trajectories map[int]map[int]map[int]string // maps phase index, level index, start pos index to trajectory

type Session struct {
	ID              string                    `json:"id"`
	ExperimentID    string                    `json:"experimentId"`
	CreatedAt       int64                     `json:"createdAt"` // unix timestamp
	IsTest          bool                      `json:"isTest"`
	GriddlySpecName string                    `json:"griddlySpecName"`
	Phases          []Phase                   `json:"phases"`
	Condition       Condition                 `json:"condition"`
	Theta           ThetaType                 `json:"theta"`
	Phi             PhiType                   `json:"phi"`
	Context         interface{}               `json:"context"`
	Trajectories    map[string]Trajectories   `json:"trajectories"` // maps agent name (or 'participant') to trajectories
	QuizResponses   map[string][]QuizResponse `json:"quizResponses"`
	FinalScore      int                       `json:"finalScore"`
	TextResponses   []string                  `json:"textResponses"`
}

func CreateSession(experimentID string, isTest bool, condition Condition, context interface{}) (Session, error) {
	sess := Session{
		ID:              GenerateID("s-"),
		ExperimentID:    experimentID,
		CreatedAt:       time.Now().Unix(),
		IsTest:          isTest,
		GriddlySpecName: "journal",
		Condition:       condition,
		Context:         context,
	}

	// load agent colour spectrum from json
	var colourSpectrum [][]float64
	f, _ := os.ReadFile("agent_colours.json")
	var colourData struct {
		Colours [][]float64 `json:"colours"`
	}
	err := json.Unmarshal(f, &colourData)
	if err != nil {
		log.Fatal(err)
		return sess, err
	}
	colourSpectrum = colourData.Colours

	// first, sample the participant's utility function
	participantDim := SampleFromSliceString([]string{"color", "shape"}, 1)[0]
	if participantDim == "color" {
		sess.Theta = SampleTheta(0.9, 0.5, 0.01, 0.01)
	} else {
		sess.Theta = SampleTheta(0.5, 0.9, 0.01, 0.01)
	}

	// then, sample the participant's phi based on the condition
	if condition.ParticipantPhiType == "neutral" {
		sess.Phi = PhiPosToPhi(0.5, colourSpectrum)
	} else if condition.PhisRelevant && condition.ParticipantPhiType == "matched" {
		sess.Phi = PhiPosToPhi(MU_PHI_POS[0], colourSpectrum)
	} else if condition.PhisRelevant && condition.ParticipantPhiType == "mismatched" {
		sess.Phi = PhiPosToPhi(MU_PHI_POS[1], colourSpectrum)
	} else if !condition.PhisRelevant && condition.ParticipantPhiType == "arbitrary" {
		if RNG().Float64() < 0.5 {
			sess.Phi = PhiPosToPhi(MU_PHI_POS[0], colourSpectrum)
		} else {
			sess.Phi = PhiPosToPhi(MU_PHI_POS[1], colourSpectrum)
		}
	} else {
		return Session{}, errors.New("condition invalid")
	}

	// create the agents
	baselineParams := GroupParams{
		MuTheta:     []float64{0.5, 0.5},
		SigmaTheta:  []float64{0.01, 0.01},
		MuPhiPos:    0.5,
		SigmaPhiPos: 0.01,
	}

	var knownAgentParams []GroupParams
	for k := 0; k < 2; k++ {
		tmp := baselineParams
		if participantDim == "color" {
			tmp.MuTheta = MU_THETA_COLORS[k]
		} else {
			tmp.MuTheta = MU_THETA_SHAPES[k]
		}
		knownAgentParams = append(knownAgentParams, tmp)
	}

	knownAgents := SampleAgents(1, knownAgentParams, AGENT_NAMES[:2], false, colourSpectrum)

	var groupDim string
	if condition.PhisRelevant {
		groupDim = participantDim
	} else if participantDim == "color" {
		groupDim = "shape"
	} else {
		groupDim = "color"
	}
	var groupParams []GroupParams
	for i := 0; i < 2; i++ {
		tmp := baselineParams
		tmp.MuPhiPos = MU_PHI_POS[i]
		if groupDim == "color" {
			tmp.MuTheta = MU_THETA_COLORS[i]
		} else {
			tmp.MuTheta = MU_THETA_SHAPES[i]
		}
		groupParams = append(groupParams, tmp)
	}
	groupAgents := SampleAgents(3, groupParams, AGENT_NAMES[2:8], true, colourSpectrum)

	var evidenceGroupAgents []Agent
	for _, i := range []int{0, 1, 3, 4} {
		evidenceGroupAgents = append(evidenceGroupAgents, groupAgents[i])
	}

	var testGroupAgents []Agent
	for _, i := range []int{2, 5} {
		testGroupAgents = append(testGroupAgents, groupAgents[i])
	}

	var testLevels []int
	if participantDim == "color" {
		testLevels = []int{13, 14}
	} else {
		testLevels = []int{9, 10}
	}

	// finally, create the phases
	evidenceStartLocs := []string{"NW", "NE", "SW", "SE"}
	sess.Phases = []Phase{
		CreatePhase("exploration", []int{0, 1, 2, 3, 4, 5, 6, 7}, true, false, nil, []Agent{}),
		CreatePhase("evidence 1", []int{8}, false, false, evidenceStartLocs, knownAgents),
		CreatePhase("test 1", []int{testLevels[0]}, true, true, []string{"C", "C", "W", "E"}, knownAgents),
		CreatePhase("evidence 2", []int{8}, false, false, evidenceStartLocs, evidenceGroupAgents),
		CreatePhase("test 2", []int{testLevels[1]}, true, true, []string{"C", "C", "N", "S"}, testGroupAgents),
	}

	return sess, nil
}
