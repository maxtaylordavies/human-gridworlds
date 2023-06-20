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

	var phases []Phase

	// exploration phase
	phase := CreatePhase("exploration", []int{0, 1, 2, 3}, true, false)
	phases = append(phases, phase)

	// evidence phase 1
	phase = CreatePhase("evidence 1", []int{4, 6, 8, 10}, false, false)

	ar := AgentReplays{
		AgentPhi:  -1,
		AgentName: "max",
	}
	ar.Replays = append(ar.Replays, CreateReplays(4, []string{"A", "A", "A", "A"})...)
	ar.Replays = append(ar.Replays, CreateReplays(7, []string{"B", "B", "B", "B"})...)
	ar.Replays = append(ar.Replays, CreateReplays(8, []string{"A", "B", "A", "B"})...)
	ar.Replays = append(ar.Replays, CreateReplays(10, []string{"A", "B", "A", "B"})...)
	phase.AgentReplays = append(phase.AgentReplays, ar)

	ar = AgentReplays{
		AgentPhi:  -1,
		AgentName: "kate",
	}
	ar.Replays = append(ar.Replays, CreateReplays(4, []string{"B", "B", "B", "B"})...)
	ar.Replays = append(ar.Replays, CreateReplays(7, []string{"A", "A", "A", "A"})...)
	ar.Replays = append(ar.Replays, CreateReplays(8, []string{"A", "B", "A", "B"})...)
	ar.Replays = append(ar.Replays, CreateReplays(10, []string{"A", "B", "A", "B"})...)
	phase.AgentReplays = append(phase.AgentReplays, ar)

	phases = append(phases, phase)

	// test phase 1
	phase = CreatePhase("test 1", []int{4}, true, true)
	// phase.Levels[0].Replays = leftRight
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
