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

	phases := []Phase{
		CreatePhase("exploration", []int{0, 1, 2, 3, 4, 6, 8, 10}, true, false),
		CreatePhase("evidence", []int{4, 5, 6, 7, 8, 9, 10, 11}, false, false),
		CreatePhase("test", []int{4}, true, true),
	}

	leftRight := []Replay{
		CreateReplay(0, "max", "top-left"),
		CreateReplay(1, "kate", "bottom-right"),
	}
	rightLeft := []Replay{
		CreateReplay(0, "max", "bottom-right"),
		CreateReplay(1, "kate", "top-left"),
	}

	phases[1].Levels[0].Replays = leftRight
	phases[1].Levels[1].Replays = rightLeft

	phases[1].Levels[2].Replays = rightLeft
	phases[1].Levels[3].Replays = leftRight

	phases[1].Levels[4].Replays = leftRight
	phases[1].Levels[5].Replays = rightLeft

	phases[1].Levels[6].Replays = rightLeft
	phases[1].Levels[7].Replays = leftRight

	phases[2].Levels[0].Replays = leftRight

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
