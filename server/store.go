package main

import (
	"time"
)

type Trajectories map[int]string // maps level index to recorded path

type Utility struct {
	Terrains []int `json:"terrains"`
	Goals    []int `json:"goals"`
}

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
	Trajectories     Trajectories      `json:"trajectories"`
	FinalScore       int               `json:"finalScore"`
	FreeTextResponse string            `json:"freeTextResponse"`
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

func (s Store) CreateSession(experimentID string, humanID string, isTest bool, context interface{}) (Session, error) {
	var sess Session

	// generate new human id if none passed
	if humanID == "" {
		humanID = GenerateID("h-")
	}

	// choose random agent ids
	agentIds := SampleFromSliceString(AgentIDs, 2)

	// set goal values. first set (A,B) randomly to either (50,20) or (20,50)
	// then pairs (D,E) and (F,G) are the same as (A,B). C is always 5.
	ABValues := SampleFromSliceInt([]int{50, 20}, 2)
	CValue := 5
	goalValues := append(append(append(ABValues, CValue), ABValues...), ABValues...)

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
		Levels:           []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		OcclusionWindows: []int{-1, -1, -1, 5, 5, -1, -1, -1, -1, -1, -1},
		Utility: Utility{
			Terrains: []int{-1},
			Goals:    goalValues,
		},
		Context: context,
	}

	// save session to file and return
	err := WriteStructToJSON(sess, s.DataPath+"sessions/"+sess.ID+".json")
	return sess, err
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
		// retrieve paths for agent - if not present, then skip to next agent
		traj, ok := AgentTrajectories[aid]
		if !ok {
			continue
		}

		// add the agentID to set.AgentIDs
		set.AgentIDs = append(set.AgentIDs, aid)

		// now we iterate through the requested levels
		for _, l := range levels {
			// for each level, if the agent has trajectory data for level l,
			// we add it to set.Paths[l] - otherwise, we add an empty string
			path := ""
			if p, ok := traj[l]; ok {
				path = p
			}
			set.Paths[l] = append(set.Paths[l], path)
		}
	}

	return set
}

func (s Store) StoreTrajectories(sessionID string, trajectories Trajectories) error {
	// load session file
	fp := s.GetSessionFilePath(sessionID)
	var sess Session

	err := ReadStructFromJSON(&sess, fp)
	if err != nil {
		return err
	}

	// write free text response
	sess.Trajectories = trajectories
	// re-save session file
	return WriteStructToJSON(sess, fp)
}

func (s Store) StoreFreeTextResponse(sessionID string, response string) error {
	// load session file
	fp := s.GetSessionFilePath(sessionID)
	var sess Session

	err := ReadStructFromJSON(&sess, fp)
	if err != nil {
		return err
	}

	// write free text response
	sess.FreeTextResponse = response

	// re-save session file
	return WriteStructToJSON(sess, fp)
}

func (s Store) StoreFinalScore(sessionID string, score int) error {
	// load session file
	fp := s.GetSessionFilePath(sessionID)
	var sess Session

	err := ReadStructFromJSON(&sess, fp)
	if err != nil {
		return err
	}

	// write free text response
	sess.FinalScore = score

	// re-save session file
	return WriteStructToJSON(sess, fp)
}
