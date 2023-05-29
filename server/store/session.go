package store

import "time"

type Trajectories map[int]string // maps level index to recorded path

type Conditions map[string]interface{}

type Session struct {
	ID            string       `json:"id"`
	ExperimentID  string       `json:"experimentId"`
	CreatedAt     int64        `json:"createdAt"` // unix timestamp
	IsTest        bool         `json:"isTest"`
	Conditions    Conditions   `json:"conditions"`
	Thetas        [][]int      `json:"thetas"`
	Context       interface{}  `json:"context"`
	Trajectories  Trajectories `json:"trajectories"`
	FinalScore    int          `json:"finalScore"`
	TextResponses []string     `json:"textResponses"`
}

func CreateSession(experimentID string, isTest bool, context interface{}) Session {
	conditions := Conditions{
		"group":         SampleFromSliceString([]string{"A", "B"}, 1)[0],
		"groupsVisible": SampleFromSliceString([]string{"none", "self", "agents", "all"}, 1)[0],
		"thetas": [][]int{
			{0, 0},
			{0, 0},
		},
	}

	return Session{
		ID:           GenerateID("s-"),
		ExperimentID: experimentID,
		CreatedAt:    time.Now().Unix(),
		IsTest:       isTest,
		Conditions:   conditions,
		Context:      context,
	}
}
