package store

import (
	"time"
)

type Trajectories map[int]map[int]string // maps phase index and level index to trajectory

type Conditions map[string]interface{}

type Thetas [][]int

type QuizResponse []int

type Session struct {
	ID              string                    `json:"id"`
	ExperimentID    string                    `json:"experimentId"`
	CreatedAt       int64                     `json:"createdAt"` // unix timestamp
	IsTest          bool                      `json:"isTest"`
	GriddlySpecName string                    `json:"griddlySpecName"`
	Phases          []Phase                   `json:"phases"`
	Conditions      Conditions                `json:"conditions"`
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

func CreateSession(experimentID string, isTest bool, context interface{}) Session {
	conditions := Conditions{
		// "phi":         SampleFromSliceInt([]int{-1, 0}, 1)[0],
		"phi": -1,
		// "correlation": SampleFromSliceInt([]int{0, 1}, 1)[0],
		"correlation": 0,
		"thetas":      YellowThetas,
	}

	// set preferences for the two agent groups
	colorPrefs := []string{"", ""}
	shapePrefs := []string{"", ""}
	var thetas []Thetas

	if conditions["correlation"].(int) == 0 {
		colorPrefs[0], colorPrefs[1] = "yellow", "green"
		thetas = []Thetas{YellowThetas, GreenThetas}
	} else {
		shapePrefs[0], shapePrefs[1] = "circle", "triangle"
		thetas = []Thetas{CircleThetas, TriangleThetas}
	}

	var phases []Phase

	// exploration phase
	phase := CreatePhase("exploration", []int{0, 1, 2, 3, 4, 5, 6, 7}, true, false, nil)
	phases = append(phases, phase)

	// evidence phase 1
	phase = CreatePhase("evidence 1", []int{8}, false, false, nil)
	phase.AgentReplays = []AgentReplays{
		{
			AgentPhi:    -1,
			AgentThetas: YellowThetas,
			AgentName:   "Alex",
			Replays:     CreateEvidenceReplays("yellow", "", 2),
		},
		{
			AgentPhi:    -1,
			AgentThetas: GreenThetas,
			AgentName:   "Bob",
			Replays:     CreateEvidenceReplays("green", "", 2),
		},
	}
	phases = append(phases, phase)

	// test phase 1
	phase = CreatePhase("test 1", []int{9}, true, true, []string{"centre_horizontal", "centre_horizontal", "W", "E"})
	phase.AgentReplays = []AgentReplays{
		{
			AgentPhi:    -1,
			AgentThetas: YellowThetas,
			AgentName:   "Alex",
			Replays:     CreateTestReplays("horizontal", "yellow", "", 1),
		},
		{
			AgentPhi:    -1,
			AgentThetas: GreenThetas,
			AgentName:   "Bob",
			Replays:     CreateTestReplays("horizontal", "green", "", 1),
		},
	}
	phases = append(phases, phase)

	// evidence phase 2
	phase = CreatePhase("evidence 2", []int{8}, false, false, nil)
	phase.AgentReplays = []AgentReplays{
		{AgentPhi: 0, AgentName: "Carl"},
		{AgentPhi: 1, AgentName: "Dan"},
		{AgentPhi: 0, AgentName: "Eric"},
		{AgentPhi: 1, AgentName: "Frank"},
	}
	for i, ar := range phase.AgentReplays {
		phase.AgentReplays[i].AgentThetas = thetas[ar.AgentPhi]
		phase.AgentReplays[i].Replays = CreateEvidenceReplays(colorPrefs[ar.AgentPhi], shapePrefs[ar.AgentPhi], 2)
	}
	phases = append(phases, phase)

	// test phase 2
	phase = CreatePhase("test 2", []int{10}, true, true, []string{"centre_vertical", "centre_vertical", "N", "S"})
	phase.AgentReplays = []AgentReplays{
		{
			AgentPhi:    0,
			AgentName:   "George",
			AgentThetas: thetas[0],
			Replays:     CreateTestReplays("vertical", colorPrefs[0], shapePrefs[0], 1),
		},
		{
			AgentPhi:    1,
			AgentName:   "Henry",
			AgentThetas: thetas[1],
			Replays:     CreateTestReplays("vertical", colorPrefs[1], shapePrefs[1], 1),
		},
	}
	phases = append(phases, phase)

	// shuffle replays
	for i := range phases {
		shuffleAgentReplays(phases[i].AgentReplays)
	}

	return Session{
		ID:              GenerateID("s-"),
		ExperimentID:    experimentID,
		CreatedAt:       time.Now().Unix(),
		IsTest:          isTest,
		GriddlySpecName: "journal",
		Phases:          phases,
		Conditions:      conditions,
		Context:         context,
	}
}

func shuffleAgentReplays(agentReplays []AgentReplays) {
	RNG().Shuffle(len(agentReplays), func(i, j int) {
		agentReplays[i], agentReplays[j] = agentReplays[j], agentReplays[i]
	})
}
