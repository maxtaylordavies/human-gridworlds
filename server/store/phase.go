package store

type Pos struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type Replay struct {
	LevelID      int    `json:"levelId"`
	Trajectory   string `json:"trajectory"`
	StepInterval int    `json:"stepInterval"`
	StartPos     Pos    `json:"startPos"`
}

type AgentReplays struct {
	AgentPhi  int      `json:"agentPhi"`
	AgentName string   `json:"agentName"`
	Replays   []Replay `json:"replays"`
}

type Level struct {
	ID       int `json:"id"`
	StartPos Pos `json:"startPos"`
}

type Phase struct {
	Name          string         `json:"name"`
	AgentReplays  []AgentReplays `json:"agentReplays"`
	Levels        []Level        `json:"levels"`
	Interactive   bool           `json:"interactive"`
	ObjectsHidden bool           `json:"objectsHidden"`
}

func createReplay(levelId int, start string, dest string) Replay {
	trajectory := ""
	if dest == "A" { // top left corner
		if start == "left" {
			trajectory = "1,2,2,2"
		} else if start == "right" {
			trajectory = "1,1,1,1,1,2,2,2"
		} else if start == "top" {
			trajectory = "2,1,1,1"
		} else if start == "bottom" {
			trajectory = "2,2,2,2,2,1,1,1"
		}
	} else if dest == "B" { // bottom right corner
		if start == "left" {
			trajectory = "3,3,3,3,3,4,4,4"
		} else if start == "right" {
			trajectory = "3,4,4,4"
		} else if start == "top" {
			trajectory = "4,4,4,4,4,3,3,3"
		} else if start == "bottom" {
			trajectory = "4,3,3,3"
		}
	}

	startPos := Pos{X: 3, Y: 3}
	if start == "left" {
		startPos.X = 1
	} else if start == "right" {
		startPos.X = 5
	} else if start == "top" {
		startPos.Y = 1
	} else if start == "bottom" {
		startPos.Y = 5
	}

	return Replay{
		LevelID:      levelId,
		Trajectory:   trajectory,
		StepInterval: 200,
		StartPos:     startPos,
	}
}

func CreateReplays(levelId int, dests []string) []Replay {
	return []Replay{
		createReplay(levelId, "left", dests[0]),
		createReplay(levelId, "right", dests[1]),
		createReplay(levelId, "top", dests[2]),
		createReplay(levelId, "bottom", dests[3]),
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
