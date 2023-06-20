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
