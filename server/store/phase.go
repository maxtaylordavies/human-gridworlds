package store

type Replay struct {
	LevelID    int    `json:"levelId"`
	Trajectory string `json:"trajectory"`
}

type AgentReplays struct {
	AgentPhi  int      `json:"agentPhi"`
	AgentName string   `json:"agentName"`
	Replays   []Replay `json:"replays"`
}

type Level struct {
	ID       int   `json:"id"`
	StartPos []int `json:"startPos"`
}

type Phase struct {
	Name          string         `json:"name"`
	AgentReplays  []AgentReplays `json:"agentReplays"`
	Levels        []Level        `json:"levels"`
	Interactive   bool           `json:"interactive"`
	ObjectsHidden bool           `json:"objectsHidden"`
}

func CreateReplay(levelId int, dest string) Replay {
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
		LevelID:    levelId,
		Trajectory: trajectory,
	}
}

func CreatePhase(name string, levelIDs []int, interactive bool, objectsHidden bool) Phase {
	levels := []Level{}
	for _, levelID := range levelIDs {
		levels = append(levels, Level{ID: levelID})
	}

	return Phase{
		Name:          name,
		Levels:        levels,
		Interactive:   interactive,
		ObjectsHidden: objectsHidden,
	}
}
