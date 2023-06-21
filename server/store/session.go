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
		"phi": SampleFromSliceInt([]int{-1, 0}, 1)[0],
		// "correlation": SampleFromSliceInt([]int{0, 1}, 1)[0],
		"correlation": 0,
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
		AgentName: "Alice",
	}
	ar.Replays = append(ar.Replays, CreateEvidenceReplays(4, []string{"A", "A", "A", "A"})...)
	ar.Replays = append(ar.Replays, CreateEvidenceReplays(7, []string{"B", "B", "B", "B"})...)
	ar.Replays = append(ar.Replays, CreateEvidenceReplays(8, []string{"A", "B", "A", "B"})...)
	ar.Replays = append(ar.Replays, CreateEvidenceReplays(10, []string{"A", "B", "A", "B"})...)
	phase.AgentReplays = append(phase.AgentReplays, ar)

	ar = AgentReplays{
		AgentPhi:  -1,
		AgentName: "Bob",
	}
	ar.Replays = append(ar.Replays, CreateEvidenceReplays(4, []string{"B", "B", "B", "B"})...)
	ar.Replays = append(ar.Replays, CreateEvidenceReplays(7, []string{"A", "A", "A", "A"})...)
	ar.Replays = append(ar.Replays, CreateEvidenceReplays(8, []string{"A", "B", "A", "B"})...)
	ar.Replays = append(ar.Replays, CreateEvidenceReplays(10, []string{"A", "B", "A", "B"})...)
	phase.AgentReplays = append(phase.AgentReplays, ar)
	phases = append(phases, phase)

	// test phase 1
	phase = CreatePhase("test 1", []int{4}, true, true)
	phase.AgentReplays = []AgentReplays{
		{
			AgentPhi:  -1,
			AgentName: "Alice",
			Replays: []Replay{
				CreateReplay(4, "right", "A"),
			},
		},
		{
			AgentPhi:  -1,
			AgentName: "Bob",
			Replays: []Replay{
				CreateReplay(4, "left", "B"),
			},
		},
	}
	phases = append(phases, phase)

	// evidence phase 2
	phase = CreatePhase("evidence 2", []int{4, 6, 8, 10}, false, false)
	var replaysC []Replay
	var replaysD []Replay
	if conditions["correlation"].(int) == 0 {
		// phi correlates to item color, not shape. so we will have C prefer yellow,
		// D prefer green and both be indifferent to shape
		replaysC = append(replaysC, CreateEvidenceReplays(4, []string{"A", "A", "A", "A"})...)
		replaysC = append(replaysC, CreateEvidenceReplays(7, []string{"B", "B", "B", "B"})...)
		replaysC = append(replaysC, CreateEvidenceReplays(8, []string{"A", "B", "A", "B"})...)
		replaysC = append(replaysC, CreateEvidenceReplays(10, []string{"A", "B", "A", "B"})...)
		replaysD = append(replaysD, CreateEvidenceReplays(4, []string{"B", "B", "B", "B"})...)
		replaysD = append(replaysD, CreateEvidenceReplays(7, []string{"A", "A", "A", "A"})...)
		replaysD = append(replaysD, CreateEvidenceReplays(8, []string{"A", "B", "A", "B"})...)
		replaysD = append(replaysD, CreateEvidenceReplays(10, []string{"A", "B", "A", "B"})...)
	} else {
		// phi correlates to item shape, not color. so we will have C prefer circle,
		// D prefer triangle and both be indifferent to color
		replaysC = append(replaysC, CreateEvidenceReplays(4, []string{"A", "B", "A", "B"})...)
		replaysC = append(replaysC, CreateEvidenceReplays(7, []string{"A", "B", "A", "B"})...)
		replaysC = append(replaysC, CreateEvidenceReplays(8, []string{"A", "A", "A", "A"})...)
		replaysC = append(replaysC, CreateEvidenceReplays(10, []string{"B", "B", "B", "B"})...)
		replaysD = append(replaysD, CreateEvidenceReplays(4, []string{"A", "B", "A", "B"})...)
		replaysD = append(replaysD, CreateEvidenceReplays(7, []string{"A", "B", "A", "B"})...)
		replaysD = append(replaysD, CreateEvidenceReplays(8, []string{"B", "B", "B", "B"})...)
		replaysD = append(replaysD, CreateEvidenceReplays(10, []string{"A", "A", "A", "A"})...)
	}
	phase.AgentReplays = []AgentReplays{
		{
			AgentPhi:  0,
			AgentName: "Carol",
			Replays:   replaysC,
		},
		{
			AgentPhi:  1,
			AgentName: "Dan",
			Replays:   replaysD,
		},
		{
			AgentPhi:  0,
			AgentName: "Erin",
			Replays:   replaysC,
		},
		{
			AgentPhi:  1,
			AgentName: "Frank",
			Replays:   replaysD,
		},
	}
	phases = append(phases, phase)

	// test phase 2
	phase = CreatePhase("test 2", []int{4}, true, true)
	phase.AgentReplays = []AgentReplays{
		{
			AgentPhi:  0,
			AgentName: "Grace",
			Replays: []Replay{
				CreateReplay(4, "left", "B"),
			},
		},
		{
			AgentPhi:  1,
			AgentName: "Henry",
			Replays: []Replay{
				CreateReplay(4, "right", "A"),
			},
		},
	}
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
