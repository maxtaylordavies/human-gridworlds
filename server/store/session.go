package store

import (
	"math/rand"
	"time"
)

type Trajectories map[int]map[int]string // maps phase index and level index to trajectory

type Conditions map[string]interface{}

type Session struct {
	ID              string           `json:"id"`
	ExperimentID    string           `json:"experimentId"`
	CreatedAt       int64            `json:"createdAt"` // unix timestamp
	IsTest          bool             `json:"isTest"`
	GriddlySpecName string           `json:"griddlySpecName"`
	Phases          []Phase          `json:"phases"`
	Conditions      Conditions       `json:"conditions"`
	Context         interface{}      `json:"context"`
	Trajectories    Trajectories     `json:"trajectories"`
	QuizResponses   map[string][]int `json:"quizResponses"`
	FinalScore      int              `json:"finalScore"`
	TextResponses   []string         `json:"textResponses"`
}

type Thetas [][]int

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
		"phi":         -1,
		"correlation": SampleFromSliceInt([]int{0, 1}, 1)[0],
		"thetas":      YellowThetas,
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
			AgentName:   "Alice",
			Replays:     CreateEvidenceReplays("yellow", "", 2),
		},
		{
			AgentPhi:    -1,
			AgentThetas: GreenThetas,
			AgentName:   "Bob",
			Replays:     CreateEvidenceReplays("green", "", 2),
		},
	}
	shuffleAgentReplays(phase.AgentReplays)
	phases = append(phases, phase)

	// test phase 1
	phase = CreatePhase("test 1", []int{9}, true, true, []string{"centre", "W", "E"})
	phase.AgentReplays = []AgentReplays{
		{
			AgentPhi:    -1,
			AgentThetas: YellowThetas,
			AgentName:   "Alice",
			Replays:     CreateTestReplays("yellow", "", 1),
		},
		{
			AgentPhi:    -1,
			AgentThetas: GreenThetas,
			AgentName:   "Bob",
			Replays:     CreateTestReplays("green", "", 1),
		},
	}
	shuffleAgentReplays(phase.AgentReplays)
	phases = append(phases, phase)

	// // evidence phase 2
	// phase = CreatePhase("evidence 2", []int{4, 6, 8, 10}, false, false, false)

	// var replaysC []Replay
	// var replaysD []Replay
	// if conditions["correlation"].(int) == 0 {
	// 	// phi correlates to item color, not shape. so we will have C prefer yellow,
	// 	// D prefer green and both be indifferent to shape
	// 	replaysC = append(replaysC, CreateReplaysPreference(4, "A")...)
	// 	replaysC = append(replaysC, CreateReplaysPreference(7, "B")...)
	// 	replaysC = append(replaysC, CreateReplaysNoPreference(8)...)
	// 	replaysC = append(replaysC, CreateReplaysNoPreference(10)...)
	// 	replaysD = append(replaysD, CreateReplaysPreference(4, "B")...)
	// 	replaysD = append(replaysD, CreateReplaysPreference(7, "A")...)
	// 	replaysD = append(replaysD, CreateReplaysNoPreference(8)...)
	// 	replaysD = append(replaysD, CreateReplaysNoPreference(10)...)
	// } else {
	// 	// phi correlates to item shape, not color. so we will have C prefer circle,
	// 	// D prefer triangle and both be indifferent to color
	// 	replaysC = append(replaysC, CreateReplaysNoPreference(4)...)
	// 	replaysC = append(replaysC, CreateReplaysNoPreference(7)...)
	// 	replaysC = append(replaysC, CreateReplaysPreference(8, "A")...)
	// 	replaysC = append(replaysC, CreateReplaysPreference(11, "B")...)
	// 	replaysD = append(replaysD, CreateReplaysNoPreference(4)...)
	// 	replaysD = append(replaysD, CreateReplaysNoPreference(7)...)
	// 	replaysD = append(replaysD, CreateReplaysPreference(8, "B")...)
	// 	replaysD = append(replaysD, CreateReplaysPreference(11, "A")...)
	// }

	// phase.AgentReplays = []AgentReplays{
	// 	{
	// 		AgentPhi:  0,
	// 		AgentName: "Carol",
	// 		Replays:   replaysC,
	// 	},
	// 	{
	// 		AgentPhi:  1,
	// 		AgentName: "Dan",
	// 		Replays:   replaysD,
	// 	},
	// 	{
	// 		AgentPhi:  0,
	// 		AgentName: "Erin",
	// 		Replays:   replaysC,
	// 	},
	// 	{
	// 		AgentPhi:  1,
	// 		AgentName: "Frank",
	// 		Replays:   replaysD,
	// 	},
	// }

	// shuffleAgentReplays(phase.AgentReplays)
	// phases = append(phases, phase)

	// // test phase 2
	// phase = CreatePhase("test 2", []int{4}, true, true, true)
	// phase.AgentReplays = []AgentReplays{
	// 	{
	// 		AgentPhi:  0,
	// 		AgentName: "Grace",
	// 		Replays:   CreateReplaysPreference(4, "B"),
	// 	},
	// 	{
	// 		AgentPhi:  1,
	// 		AgentName: "Henry",
	// 		Replays:   CreateReplaysPreference(4, "A"),
	// 	},
	// }

	// shuffleAgentReplays(phase.AgentReplays)
	// phases = append(phases, phase)

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
	rand.Shuffle(len(agentReplays), func(i, j int) {
		agentReplays[i], agentReplays[j] = agentReplays[j], agentReplays[i]
	})
}
