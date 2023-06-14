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
	StartPos      []int    `json:"startPos"`
}

type Phase struct {
	Name        string  `json:"name"`
	Levels      []Level `json:"levels"`
	Interactive bool    `json:"interactive"`
}

func CreateReplay(agentPhi int, agentName string, dest string) Replay {
	trajectory := ""
	if dest == "top-left" {
		trajectory = "1,1,1,2,2,2"
	} else if dest == "top-right" {
		trajectory = "3,3,3,2,2,2"
	} else if dest == "bottom-left" {
		trajectory = "1,1,1,4,4,4"
	} else if dest == "bottom-right" {
		trajectory = "3,3,3,4,4,4"
	}

	return Replay{
		AgentPhi:   agentPhi,
		AgentName:  agentName,
		Trajectory: trajectory,
	}
}

func CreatePhase(name string, levelIDs []int, interactive bool, objectsHidden bool) Phase {
	levels := []Level{}
	for _, levelID := range levelIDs {
		levels = append(levels, Level{ID: levelID, ObjectsHidden: objectsHidden, Replays: []Replay{}})
	}

	return Phase{
		Name:        name,
		Levels:      levels,
		Interactive: interactive,
	}
}
