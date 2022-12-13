package main

import (
	"encoding/json"
	"io/ioutil"
	"strings"
	"time"
)

type Session struct {
	ID               string            `json:"id"`
	ExperimentID     string            `json:"experimentId"`
	CreatedAt        int64             `json:"createdAt"` // unix timestamp
	IsTest           bool              `json:"isTest"`
	GameID           string            `json:"gameId"`
	HumanID          string            `json:"humanId"`
	AgentIDs         []string          `json:"agentIds"`
	AgentAvatars     map[string]string `json:"agentAvatars"`
	Levels           []int             `json:"levels"`
	OcclusionWindows []int             `json:"occlusionWindows"`
	Utility          Utility           `json:"utility"`
	Context          interface{}       `json:"context"`
}

type Utility struct {
	Terrains []int `json:"terrains"`
	Goals    []int `json:"goals"`
}

type Trajectory struct {
	ID      string         `json:"id"`
	Context interface{}    `json:"context"`
	GameID  string         `json:"gameId"`
	AgentID string         `json:"agentId"` // could be prerecorded agent OR human participant
	Paths   map[int]string `json:"paths"`   // maps level index to recorded path
}

type SetOfLevelPaths struct {
	AgentIDs []string         `json:"agentIds"`
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

func (s Store) CreateSession(experimentID string, humanID string, isTest bool, context interface{}) (Session, error) {
	var sess Session

	// generate new human id if none passed
	if humanID == "" {
		humanID = GenerateID("h-")
	}

	// choose random agent ids
	allAgents, err := s.GetAllAgentIDsForGame("multijewel")
	if err != nil {
		return sess, err
	}
	agentIds := SampleFromSliceString(allAgents, 2)

	// choose random goal values
	ABValues := SampleFromSliceInt([]int{50, 20}, 2)
	DEValues := SampleFromSliceInt([]int{30, 60}, 2)
	CValue := 5
	goalValues := append(append(ABValues, CValue), DEValues...)

	// create session
	sess = Session{
		ID:           GenerateID("s-"),
		ExperimentID: experimentID,
		CreatedAt:    time.Now().Unix(),
		IsTest:       isTest,
		GameID:       "multijewel",
		HumanID:      humanID,
		AgentIDs:     agentIds,
		AgentAvatars: map[string]string{
			"a-0001": "custom/redsquare.png",
			"a-0002": "custom/bluecircle.png",
			"a-0003": "custom/yellowtriangle.png",
		},
		Levels:           []int{0, 1, 2, 3, 4, 5, 6},
		OcclusionWindows: []int{-1, -1, -1, 5, 5, -1, -1},
		Utility: Utility{
			Terrains: []int{-1},
			Goals:    goalValues,
		},
		Context: context,
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

func (s Store) GetLevelPaths(gameID string, agentIDs []string, levels []int) SetOfLevelPaths {
	// initialise set of paths object
	set := SetOfLevelPaths{
		AgentIDs: []string{},
		Paths:    make(map[int][]string),
	}
	for _, l := range levels {
		set.Paths[l] = []string{}
	}

	// iterate through requested agents
	for _, aid := range agentIDs {
		// for each agent, attempt to find + parse their trajectory file (for the given gameID)
		f, err := ioutil.ReadFile(s.GetTrajectoryFilePath(gameID + "_" + aid))
		if err != nil {
			continue
		}

		var t Trajectory
		err = json.Unmarshal(f, &t)
		if err != nil {
			continue
		}

		// if we successfully loaded the agent's trajectory file, then add the agentID to set.AgentIDs
		set.AgentIDs = append(set.AgentIDs, aid)

		// now we iterate through the requested levels
		for _, l := range levels {
			// for each level, if the agent has trajectory data for level l,
			// we add it to set.Paths[l] - otherwise, we add an empty string
			path := ""
			if p, ok := t.Paths[l]; ok {
				path = p
			}
			set.Paths[l] = append(set.Paths[l], path)
		}
	}

	return set
}

func (s Store) StoreTrajectory(gameID string, agentID string, paths map[int]string, context interface{}) error {
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
