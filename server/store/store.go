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

func (s Store) UpdateSession(sess Session) error {
	return WriteStructToJSON(sess, s.DataPath+"sessions/"+sess.ID+".json")
}
