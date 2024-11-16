package store

import (
	"encoding/json"
	"errors"
	"log"
	"os"
	"time"
)

type Condition struct {
	ParticipantPhiType string `json:"participantPhiType"` // "neutral", "group"
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

	// load agent colours from json
	f, _ := os.ReadFile("agent_colours.json")
	var colourData struct {
		Colours [][]float64 `json:"colours"`
	}
	err := json.Unmarshal(f, &colourData)
	if err != nil {
		log.Fatal(err)
		return sess, err
	}
	colourSpectrum := colourData.Colours

	// first, set up group parameters
	var groupParams []GroupParams
	groupThetaMus := [][]float64{
		MU_THETA_YELLOW_CIRCLE,
		MU_THETA_GREEN_TRIANGLE,
	}
	for k := 0; k < 2; k++ {
		groupParams = append(groupParams, GroupParams{
			MuTheta:     groupThetaMus[k],
			SigmaTheta:  []float64{0.01, 0.01},
			MuPhiPos:    MU_PHI_POS[k],
			SigmaPhiPos: 0.05,
		})
	}

	// next, sample the participant's utility function
	var muTheta []float64
	tmp := BinaryChoice(0, 1)
	if tmp == 0 {
		muTheta = MU_THETA_YELLOW_TRIANGLE
	} else {
		muTheta = MU_THETA_GREEN_CIRCLE
	}
	sess.Theta = SampleTheta(muTheta[0], muTheta[1], 0.01, 0.01)

	// assign participant phi
	if condition.ParticipantPhiType == "neutral" {
		sess.Phi = GREY_PHI
	} else if condition.ParticipantPhiType == "group" {
		if RNG().Float64() < 0.5 {
			sess.Phi = PhiPosToPhi(MU_PHI_POS[0], colourSpectrum)
		} else {
			sess.Phi = PhiPosToPhi(MU_PHI_POS[1], colourSpectrum)
		}
	} else {
		return Session{}, errors.New("condition invalid or not allowed")
	}

	// create the agents
	agents := SampleAgents(3, groupParams, AGENT_NAMES[:6], colourData.Colours)
	evidenceAgents := []Agent{
		agents[0],
		agents[1],
		agents[3],
		agents[4],
	}
	testAgents := []Agent{agents[2], agents[5]}

	// finally, create the phases
	sess.Phases = []Phase{
		CreatePhase("exploration", []int{0, 1, 2, 3}, true, false, nil, []Agent{}, false),
		CreatePhase("evidence", []int{6, 4, 7, 5, 6}, true, false, []string{"CNW", "CSE"}, evidenceAgents, true),
		CreatePhase("test", []int{9, 13}, true, true, []string{"C", "W", "E"}, testAgents, false),
	}

	return sess, nil
}
