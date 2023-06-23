package store

import (
	"math/rand"
)

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

func getStartPos(start string) Pos {
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
	return startPos
}

func CreateReplay(levelId int, start string, dest string) Replay {
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

	return Replay{
		LevelID:    levelId,
		Trajectory: trajectory,
		StartPos:   getStartPos(start),
	}
}

func CreateReplaysPreference(levelId int, dest string) []Replay {
	var starts []string
	if dest == "A" { // top left corner
		starts = []string{"right", "bottom"}
	} else { // bottom right corner
		starts = []string{"left", "top"}
	}

	var replays []Replay
	for _, start := range starts {
		replays = append(replays, CreateReplay(levelId, start, dest))
	}

	// shuffle replays
	rand.Shuffle(len(replays), func(i, j int) {
		replays[i], replays[j] = replays[j], replays[i]
	})

	return replays
}

func CreateReplaysNoPreference(levelId int) []Replay {
	start1 := SampleFromSliceString([]string{"left", "top"}, 1)[0]
	start2 := SampleFromSliceString([]string{"right", "bottom"}, 1)[0]

	replays := []Replay{
		CreateReplay(levelId, start1, "A"),
		CreateReplay(levelId, start2, "B"),
	}

	// shuffle replays
	rand.Shuffle(len(replays), func(i, j int) {
		replays[i], replays[j] = replays[j], replays[i]
	})

	return replays
}

func CreatePhase(name string, levelIDs []int, interactive bool, objectsHidden bool, multipleStarts bool) Phase {
	levels := []Level{}
	for _, levelID := range levelIDs {
		startPositions := []Pos{
			getStartPos("center"),
		}
		if multipleStarts {
			startPositions = append(startPositions, getStartPos("left"))
			startPositions = append(startPositions, getStartPos("right"))
		}

		rand.Shuffle(len(startPositions), func(i, j int) {
			startPositions[i], startPositions[j] = startPositions[j], startPositions[i]
		})

		for _, startPos := range startPositions {
			levels = append(levels, Level{ID: levelID, StartPos: startPos})
		}
	}

	return Phase{
		Name:          name,
		Levels:        levels,
		Interactive:   interactive,
		ObjectsHidden: objectsHidden,
	}
}
