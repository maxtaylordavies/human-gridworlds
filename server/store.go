package main

import (
	"io/ioutil"
	"strings"
	"time"
)

type Session struct {
	ID           string   `json:"id"`
	ExperimentID string   `json:"experiment_id"`
	CreatedAt    int64    `json:"created_at"` // unix timestamp
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

type SetOfLevelPaths struct {
	AgentIDs []string         `json:"agent_ids"`
	Paths    map[int][]string `json:"paths"` // maps level index to array of paths (path for each agent in agent_ids)
}

type Store struct {
	DataPath string
}

func (s Store) GetGameSpecFilePath(id string) string {
	return s.DataPath + "games/" + id + ".yaml"
}

func (s Store) GetSessionFilePath(id string) string {
	return s.DataPath + "sessions/" + id + ".json"
}

func (s Store) GetTrajectoryFilePath(id string) string {
	return s.DataPath + "trajectories/" + id + ".json"
}

func (s Store) CreateSession(experimentID string, isTest bool, context string) (Session, error) {
	var sess Session

	// choose random agent ids
	allAgents, err := s.GetAllAgentIDsForGame("sokoban")
	if err != nil {
		return sess, err
	}
	agents := SampleFromSliceString(allAgents, 3)

	// choose random level ids
	numLevels := 6
	levels := SampleFromRange(0, numLevels-1, 3)

	// create session
	sess = Session{
		ID:           GenerateID("s-"),
		ExperimentID: experimentID,
		CreatedAt:    time.Now().Unix(),
		IsTest:       isTest,
		Context:      context,
		GameID:       "sokoban",
		HumanID:      GenerateID("h-"),
		AgentIDs:     agents,
		Levels:       levels,
	}

	// save session to file and return
	err = WriteStructToJSON(sess, s.DataPath+"sessions/"+sess.ID+".json")
	return sess, err
}

func (s Store) GetAllAgentIDsForGame(gameID string) ([]string, error) {
	var agentIDs []string

	files, err := ioutil.ReadDir(s.DataPath + "trajectories/")
	if err != nil {
		return agentIDs, err
	}

	for _, f := range files {
		fn := f.Name()
		if strings.HasSuffix(fn, ".json") {
			tmp := strings.Split(strings.TrimSuffix(fn, ".json"), "_")
			if tmp[0] == gameID && strings.HasPrefix(tmp[1], "a-") {
				agentIDs = append(agentIDs, tmp[1])
			}
		}
	}

	return agentIDs, nil
}

func (s Store) GetLevelPaths(gameID string, agentIDs []string, levels []int) (SetOfLevelPaths, error) {
	return SetOfLevelPaths{}, nil
}

func (s Store) StoreTrajectory(gameID string, agentID string, paths map[int]string, context string) error {
	// create trajectory object
	traj := Trajectory{
		ID:      gameID + "_" + agentID,
		Context: context,
		GameID:  gameID,
		AgentID: agentID,
		Paths:   paths,
	}

	// save session to file and return
	return WriteStructToJSON(traj, s.DataPath+"trajectories/"+traj.ID+".json")
}
