package store

import (
	"errors"
	"time"
)

type Condition struct {
	PhisRelevant       bool   `json:"phisRelevant"`
	ParticipantPhiType string `json:"participantPhiType"` // "neutral", "arbitrary", "matched", "mismatched"
}

type QuizResponse []int

type Trajectories map[int]map[int]string // maps phase index and level index to trajectory

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
	Trajectories    Trajectories              `json:"trajectories"`
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

	// first, sample the participant's utility function
	participantDim := SampleFromSliceString([]string{"color", "shape"}, 1)[0]
	if participantDim == "color" {
		sess.Theta = SampleTheta(0.9, 0.5, 0.01, 0.01)
	} else {
		sess.Theta = SampleTheta(0.5, 0.9, 0.01, 0.01)
	}

	// then, sample the participant's phi based on the condition
	if condition.ParticipantPhiType == "neutral" {
		sess.Phi = NEUTRAL_PHI
	} else if condition.PhisRelevant && condition.ParticipantPhiType == "matched" {
		sess.Phi = RED_PHI
	} else if condition.PhisRelevant && condition.ParticipantPhiType == "mismatched" {
		sess.Phi = BLUE_PHI
	} else if !condition.PhisRelevant && condition.ParticipantPhiType == "arbitrary" {
		if RNG().Float64() < 0.5 {
			sess.Phi = RED_PHI
		} else {
			sess.Phi = BLUE_PHI
		}
	} else {
		return Session{}, errors.New("condition invalid or not allowed")
	}

	// create the agents
	baselineParams := GroupParams{
		MuTheta:     []float64{0.5, 0.5},
		SigmaTheta:  []float64{0.1, 0.1},
		MuPhiPos:    0.5,
		SigmaPhiPos: 0.1,
	}

	var knownAgentParams []GroupParams
	for i := 0; i < 2; i++ {
		tmp := baselineParams
		if participantDim == "color" {
			tmp.MuTheta = MU_THETA_COLORS[i]
		} else {
			tmp.MuTheta = MU_THETA_SHAPES[i]
		}
		knownAgentParams = append(knownAgentParams, tmp)
	}
	knownAgents := SampleAgents([]int{0, 1}, knownAgentParams)

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
	groupAgents := SampleAgents([]int{0, 1, 0, 1, 0, 1}, groupParams)

	// finally, create the phases
	sess.Phases = []Phase{
		CreatePhase("exploration", []int{0, 1, 2, 3, 4, 5, 6, 7}, true, false, nil, []Agent{}),
		CreatePhase("evidence 1", []int{8}, false, false, nil, knownAgents),
		CreatePhase("test 1", []int{9}, true, true, []string{"centre_horizontal", "centre_horizontal", "W", "E"}, knownAgents),
		CreatePhase("evidence 2", []int{10}, false, false, nil, groupAgents[0:4]),
		CreatePhase("test 2", []int{11}, true, true, []string{"centre_horizontal", "centre_horizontal", "W", "E"}, groupAgents[4:6]),
	}

	return sess, nil
}
