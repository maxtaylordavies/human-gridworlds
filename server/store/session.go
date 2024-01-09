package store

import (
	"errors"
	"time"
)

type Condition struct {
	PhisRelevant       bool   `json:"phisRelevant"`
	ParticipantPhiType string `json:"participantPhiType"` // "none", "random", "matched", "mismatched"
}

type Thetas [][]int

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
	Thetas          Thetas                    `json:"thetas"`
	Phi             int                       `json:"phi"`
	Context         interface{}               `json:"context"`
	Trajectories    Trajectories              `json:"trajectories"`
	QuizResponses   map[string][]QuizResponse `json:"quizResponses"`
	FinalScore      int                       `json:"finalScore"`
	TextResponses   []string                  `json:"textResponses"`
}

var YellowThetas = Thetas{
	{10, 0},
	{10, 10},
}

var GreenThetas = Thetas{
	{0, 10},
	{10, 10},
}

var CircleThetas = Thetas{
	{10, 10},
	{10, 0},
}

var TriangleThetas = Thetas{
	{10, 10},
	{0, 10},
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

	// first, randomly assign the participant to care about either color or shape
	participantDimension := SampleFromSliceString([]string{"color", "shape"}, 1)[0]
	if participantDimension == "color" {
		sess.Thetas = YellowThetas
	} else {
		sess.Thetas = CircleThetas
	}

	// then, set the participant's phi depending on both factors
	if condition.ParticipantPhiType == "none" {
		sess.Phi = -1
	} else if condition.PhisRelevant && condition.ParticipantPhiType == "matched" {
		sess.Phi = 0
	} else if condition.PhisRelevant && condition.ParticipantPhiType == "mismatched" {
		sess.Phi = 1
	} else if !condition.PhisRelevant && condition.ParticipantPhiType == "random" {
		sess.Phi = SampleFromSliceInt([]int{0, 1}, 1)[0]
	} else {
		return Session{}, errors.New("condition invalid or not allowed")
	}

	// the known (non-group) agents will always care about the same dimension as the participant
	knownAgentColorPrefs := []string{"", ""}
	knownAgentShapePrefs := []string{"", ""}
	var knownAgentThetas []Thetas
	if participantDimension == "color" {
		knownAgentColorPrefs[0], knownAgentColorPrefs[1] = "yellow", "green"
		knownAgentThetas = []Thetas{YellowThetas, GreenThetas}
	} else {
		knownAgentShapePrefs[0], knownAgentShapePrefs[1] = "circle", "triangle"
		knownAgentThetas = []Thetas{CircleThetas, TriangleThetas}
	}

	// then, set up the two agent groups depending on factor 1 and the participant's dimension
	groupColorPrefs := []string{"", ""}
	groupShapePrefs := []string{"", ""}
	var groupThetas []Thetas
	var agentGroupDimension string

	if participantDimension == "color" && condition.PhisRelevant {
		agentGroupDimension = "color"
	} else if participantDimension == "color" && !condition.PhisRelevant {
		agentGroupDimension = "shape"
	} else if participantDimension == "shape" && condition.PhisRelevant {
		agentGroupDimension = "shape"
	} else if participantDimension == "shape" && !condition.PhisRelevant {
		agentGroupDimension = "color"
	}

	if agentGroupDimension == "color" {
		groupColorPrefs[0], groupColorPrefs[1] = "yellow", "green"
		groupThetas = []Thetas{YellowThetas, GreenThetas}
	} else {
		groupShapePrefs[0], groupShapePrefs[1] = "circle", "triangle"
		groupThetas = []Thetas{CircleThetas, TriangleThetas}
	}

	// now, create the phases
	// exploration phase
	phase := CreatePhase("exploration", []int{0, 1, 2, 3, 4, 5, 6, 7}, true, false, nil)
	sess.Phases = append(sess.Phases, phase)

	// known agents phase - evidence
	phase = CreatePhase("evidence 1", []int{8}, false, false, nil)
	phase.AgentReplays = []AgentReplays{
		{
			AgentPhi:    -1,
			AgentThetas: knownAgentThetas[0],
			AgentName:   "Alex",
			Replays:     CreateEvidenceReplays(knownAgentColorPrefs[0], knownAgentShapePrefs[0], 2),
		},
		{
			AgentPhi:    -1,
			AgentThetas: knownAgentThetas[1],
			AgentName:   "Bob",
			Replays:     CreateEvidenceReplays(knownAgentColorPrefs[1], knownAgentShapePrefs[1], 2),
		},
	}
	sess.Phases = append(sess.Phases, phase)

	// known agents phase - test
	phase = CreatePhase("test 1", []int{9}, true, true, []string{"centre_horizontal", "centre_horizontal", "W", "E"})
	phase.AgentReplays = []AgentReplays{
		{
			AgentPhi:    -1,
			AgentThetas: knownAgentThetas[0],
			AgentName:   "Alex",
			Replays:     CreateTestReplays("horizontal", knownAgentColorPrefs[0], knownAgentShapePrefs[0], 1),
		},
		{
			AgentPhi:    -1,
			AgentThetas: knownAgentThetas[1],
			AgentName:   "Bob",
			Replays:     CreateTestReplays("horizontal", knownAgentColorPrefs[1], knownAgentShapePrefs[1], 1),
		},
	}
	sess.Phases = append(sess.Phases, phase)

	// unknown agents phase - evidence
	phase = CreatePhase("evidence 2", []int{8}, false, false, nil)
	phase.AgentReplays = []AgentReplays{
		{AgentPhi: 0, AgentName: "Carl"},
		{AgentPhi: 1, AgentName: "Dan"},
		{AgentPhi: 0, AgentName: "Eric"},
		{AgentPhi: 1, AgentName: "Frank"},
	}
	for i, ar := range phase.AgentReplays {
		phase.AgentReplays[i].AgentThetas = groupThetas[ar.AgentPhi]
		phase.AgentReplays[i].Replays = CreateEvidenceReplays(groupColorPrefs[ar.AgentPhi], groupShapePrefs[ar.AgentPhi], 2)
	}
	sess.Phases = append(sess.Phases, phase)

	// unknown agents phase - test
	phase = CreatePhase("test 2", []int{10}, true, true, []string{"centre_vertical", "centre_vertical", "N", "S"})
	phase.AgentReplays = []AgentReplays{
		{
			AgentPhi:    0,
			AgentName:   "George",
			AgentThetas: groupThetas[0],
			Replays:     CreateTestReplays("vertical", groupColorPrefs[0], groupShapePrefs[0], 1),
		},
		{
			AgentPhi:    1,
			AgentName:   "Henry",
			AgentThetas: groupThetas[1],
			Replays:     CreateTestReplays("vertical", groupColorPrefs[1], groupShapePrefs[1], 1),
		},
	}
	sess.Phases = append(sess.Phases, phase)

	// shuffle replays
	for i := range sess.Phases {
		shuffleAgentReplays(sess.Phases[i].AgentReplays)
	}

	return sess, nil
}

func shuffleAgentReplays(agentReplays []AgentReplays) {
	RNG().Shuffle(len(agentReplays), func(i, j int) {
		agentReplays[i], agentReplays[j] = agentReplays[j], agentReplays[i]
	})
}
