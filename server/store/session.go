package store

import "time"

type Trajectories map[int]string // maps level index to recorded path

type Conditions map[string]interface{}

type Session struct {
	ID              string       `json:"id"`
	ExperimentID    string       `json:"experimentId"`
	CreatedAt       int64        `json:"createdAt"` // unix timestamp
	IsTest          bool         `json:"isTest"`
	GriddlySpecName string       `json:"griddlySpecName"`
	Phases          []Phase      `json:"phases"`
	Conditions      Conditions   `json:"conditions"`
	Context         interface{}  `json:"context"`
	Trajectories    Trajectories `json:"trajectories"`
	FinalScore      int          `json:"finalScore"`
	TextResponses   []string     `json:"textResponses"`
}

func CreateSession(experimentID string, isTest bool, context interface{}) Session {
	conditions := Conditions{
		"group":         SampleFromSliceString([]string{"A", "B"}, 1)[0],
		"groupsVisible": SampleFromSliceString([]string{"none", "self", "agents", "all"}, 1)[0],
		"thetas": [][]int{
			{10, 0},
			{10, 10},
		},
	}

	// replay templates
	leftRight := []Replay{
		CreateReplay(0, "max", "top-left"),
		CreateReplay(1, "kate", "bottom-right"),
	}
	rightLeft := []Replay{
		CreateReplay(0, "max", "bottom-right"),
		CreateReplay(1, "kate", "top-left"),
	}

	var phases []Phase

	// phases := []Phase{
	// 	CreatePhase("exploration", []int{0}, true, false),
	// 	CreatePhase("evidence 1", []int{4, 5, 6, 7, 8, 9, 10, 11}, false, false),
	// 	CreatePhase("test 1", []int{4}, true, true),
	// 	CreatePhase("evidence 2", []int{12, 13, 14, 15, 16, 17, 18, 19}, false, false),
	// 	CreatePhase("test 2", []int{12}, true, true),
	// }

	// exploration phase
	phase := CreatePhase("exploration", []int{0}, true, false)
	phases = append(phases, phase)

	// evidence phase 1
	phase = CreatePhase("evidence 1", []int{4, 6, 8, 10}, false, false)
	phase.Levels[0].Replays = leftRight
	phase.Levels[1].Replays = rightLeft
	phase.Levels[2].Replays = leftRight
	phase.Levels[3].Replays = rightLeft
	phases = append(phases, phase)

	// test phase 1
	phase = CreatePhase("test 1", []int{4}, true, true)
	phase.Levels[0].Replays = leftRight
	phases = append(phases, phase)

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
