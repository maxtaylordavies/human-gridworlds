package store

import (
	"errors"
	"time"
)

type Condition struct {
	ParticipantPrefStrength string `json:"participantPrefStrength"` // "strong", "weak"
	GroupPrefStrength       string `json:"groupPrefStrength"`       // "strong", "weak"
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
	var muTheta []float64

	if participantDim == "color" && condition.ParticipantPrefStrength == "strong" {
		muTheta = MU_THETA_YELLOW_STRONG
	} else if participantDim == "color" && condition.ParticipantPrefStrength == "weak" {
		muTheta = MU_THETA_YELLOW_WEAK
	} else if participantDim == "shape" && condition.ParticipantPrefStrength == "strong" {
		muTheta = MU_THETA_CIRCLE_STRONG
	} else if participantDim == "shape" && condition.ParticipantPrefStrength == "weak" {
		muTheta = MU_THETA_CIRCLE_WEAK
	} else {
		return Session{}, errors.New("condition invalid or not allowed")
	}

	sess.Theta = SampleTheta(muTheta[0], muTheta[1], 0.01, 0.01)
	sess.Phi = RED_PHI

	// create the agents
	var groupThetaMus [][]float64
	if participantDim == "color" && condition.GroupPrefStrength == "strong" {
		groupThetaMus = MU_THETA_COLORS_STRONG
	} else if participantDim == "color" && condition.GroupPrefStrength == "weak" {
		groupThetaMus = MU_THETA_COLORS_WEAK
	} else if participantDim == "shape" && condition.GroupPrefStrength == "strong" {
		groupThetaMus = MU_THETA_SHAPES_STRONG
	} else if participantDim == "shape" && condition.GroupPrefStrength == "weak" {
		groupThetaMus = MU_THETA_SHAPES_WEAK
	} else {
		return Session{}, errors.New("condition invalid or not allowed")
	}

	baselineParams := GroupParams{
		MuTheta:     []float64{0.5, 0.5},
		SigmaTheta:  []float64{0.01, 0.01},
		MuPhiPos:    0.5,
		SigmaPhiPos: 0.01,
	}

	var groupParams []GroupParams
	for k := 0; k < 2; k++ {
		tmp := baselineParams
		tmp.MuTheta = groupThetaMus[k]
		tmp.MuPhiPos = MU_PHI_POS[k]
		groupParams = append(groupParams, tmp)
	}

	knownAgents := SampleAgents([]int{0, 1}, groupParams, AGENT_NAMES[:2])
	groupAgents := SampleAgents([]int{0, 1, 0, 1, 0, 1}, groupParams, AGENT_NAMES[2:8])

	// finally, create the phases
	sess.Phases = []Phase{
		CreatePhase("exploration", []int{0, 1, 2, 3, 4, 5, 6, 7}, true, false, nil, []Agent{}),
		CreatePhase("evidence 1", []int{8}, false, false, []string{"NW", "NE", "SW", "SE"}, knownAgents),
		CreatePhase("test 1", []int{9}, true, true, []string{"centre_horizontal", "centre_horizontal", "W", "E"}, knownAgents),
		CreatePhase("evidence 2", []int{8}, false, false, []string{"NW", "NE", "SW", "SE"}, groupAgents[0:4]),
		CreatePhase("test 2", []int{10}, true, true, []string{"centre_vertical", "centre_vertical", "N", "S"}, groupAgents[4:6]),
	}

	return sess, nil
}
