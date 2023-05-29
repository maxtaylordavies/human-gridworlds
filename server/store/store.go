package store

type SetOfLevelPaths struct {
	AgentIDs []string         `json:"agentIds"`
	Paths    map[int][]string `json:"paths"` // maps level index to array of paths (path for each agent in agent_ids)
}

type Store struct {
	DataPath      string
	ResourcesPath string
}

func (s Store) GetGameSpecFilePath(id string) string {
	return s.ResourcesPath + "games/" + id + ".yaml"
}

func (s Store) GetSessionFilePath(id string) string {
	return s.DataPath + "sessions/" + id + ".json"
}

func (s Store) CreateSession(experimentID string, isTest bool, context interface{}) (Session, error) {
	// create session
	sess := CreateSession(experimentID, isTest, context)

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
	sess.TextResponses = append(sess.TextResponses, response)

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
