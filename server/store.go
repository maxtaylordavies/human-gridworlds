package main

type Session struct {
	ID           string   `json:"id"`
	ExperimentID string   `json:"experiment_id"`
	CreatedAt    int      `json:"created_at"` // unix timestamp
	IsTest       bool     `json:"is_test"`
	Context      string   `json:"context"`
	GameID       string   `json:"game_id"`
	HumanID      string   `json:"human_id"`
	AgentIDs     []string `json:"agent_ids"`
	Levels       []int    `json:"levels"`
}

type Trajectory struct {
	ID      string         `json:"id"`
	Context string         `json:"context"`
	GameID  string         `json:"game_id"`
	AgentID string         `json:"agent_id"` // could be prerecorded agent OR human participant
	Paths   map[int]string `json:"paths"`    // maps level index to recorded path
}

type Store struct {
	DataPath string
}
