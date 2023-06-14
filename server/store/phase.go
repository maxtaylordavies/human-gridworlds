package store

type Replay struct {
	AgentPhi   int    `json:"agentPhi"`
	AgentName  string `json:"agentName"`
	Trajectory string `json:"trajectory"`
}

type Level struct {
	ID            int      `json:"id"`
	ObjectsHidden bool     `json:"objectsHidden"`
	Replays       []Replay `json:"replays"`
}

type Phase struct {
	Name        string  `json:"name"`
	Levels      []Level `json:"levels"`
	Interactive bool    `json:"interactive"`
}

func CreatePhase(name string, levelIDs []int, interactive bool, objectsHidden bool) Phase {
	levels := []Level{}
	for _, levelID := range levelIDs {
		levels = append(levels, Level{ID: levelID, ObjectsHidden: objectsHidden, Replays: []Replay{}})
	}

	levels[0].Replays = append(levels[0].Replays, Replay{
		AgentPhi:   0,
		AgentName:  "max",
		Trajectory: "1,1,1,2,2,2",
	})
	levels[1].Replays = append(levels[1].Replays, Replay{
		AgentPhi:   1,
		AgentName:  "kate",
		Trajectory: "3,3,3,4,4,4",
	})

	return Phase{
		Name:        name,
		Levels:      levels,
		Interactive: false,
	}
}
