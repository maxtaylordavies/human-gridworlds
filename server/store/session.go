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

func CreateSession(experimentID string, isTest bool, context interface{}) Session {
	conditions := Conditions{
		"phi": SampleFromSliceInt([]int{-1, 0}, 1)[0],
		// "correlation": SampleFromSliceInt([]int{0, 1}, 1)[0],
		"correlation": 1,
		"thetas": [][]int{
			{10, 0},
			{10, 10},
		},
	}

	var phases []Phase

	// exploration phase
	phase := CreatePhase("exploration", []int{0, 1, 2, 3, 4, 6, 8, 10}, true, false, false)
	phases = append(phases, phase)

	// // evidence phase 1
	// phase = CreatePhase("evidence 1", []int{4, 6, 8, 10}, false, false, false)

	// ar := AgentReplays{
	// 	AgentPhi:  -1,
	// 	AgentName: "Alice",
	// }
	// ar.Replays = append(ar.Replays, CreateReplaysPreference(4, "A")...)
	// ar.Replays = append(ar.Replays, CreateReplaysPreference(7, "B")...)
	// ar.Replays = append(ar.Replays, CreateReplaysNoPreference(8)...)
	// ar.Replays = append(ar.Replays, CreateReplaysNoPreference(10)...)
	// phase.AgentReplays = append(phase.AgentReplays, ar)

	// ar = AgentReplays{
	// 	AgentPhi:  -1,
	// 	AgentName: "Bob",
	// }
	// ar.Replays = append(ar.Replays, CreateReplaysPreference(4, "B")...)
	// ar.Replays = append(ar.Replays, CreateReplaysPreference(7, "A")...)
	// ar.Replays = append(ar.Replays, CreateReplaysNoPreference(8)...)
	// ar.Replays = append(ar.Replays, CreateReplaysNoPreference(10)...)
	// phase.AgentReplays = append(phase.AgentReplays, ar)

	// shuffleAgentReplays(phase.AgentReplays)
	// phases = append(phases, phase)

	// // test phase 1
	// phase = CreatePhase("test 1", []int{4}, true, true, true)
	// phase.AgentReplays = []AgentReplays{
	// 	{
	// 		AgentPhi:  -1,
	// 		AgentName: "Alice",
	// 		Replays:   CreateReplaysPreference(4, "A"),
	// 	},
	// 	{
	// 		AgentPhi:  -1,
	// 		AgentName: "Bob",
	// 		Replays:   CreateReplaysPreference(4, "B"),
	// 	},
	// }

	// shuffleAgentReplays(phase.AgentReplays)
	// phases = append(phases, phase)

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
	// 	replaysC = append(replaysC, CreateReplaysPreference(10, "B")...)
	// 	replaysD = append(replaysD, CreateReplaysNoPreference(4)...)
	// 	replaysD = append(replaysD, CreateReplaysNoPreference(7)...)
	// 	replaysD = append(replaysD, CreateReplaysPreference(8, "B")...)
	// 	replaysD = append(replaysD, CreateReplaysPreference(10, "A")...)
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
