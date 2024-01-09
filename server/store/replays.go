package store

import (
	"math/rand"
)

type Replay struct {
	LevelID      int    `json:"levelId"`
	Trajectory   string `json:"trajectory"`
	StepInterval int    `json:"stepInterval"`
	StartPos     Pos    `json:"startPos"`
}

type AgentReplays struct {
	AgentPhi    int      `json:"agentPhi"`
	AgentThetas Thetas   `json:"agentThetas"`
	AgentName   string   `json:"agentName"`
	Replays     []Replay `json:"replays"`
}

// maps start position + dest position to trajectory
// 1 = left, 2 = up, 3 = right, 4 = down
var EvidenceTrajectoryTemplates = map[string]map[string]string{
	"NW": {
		"NW": "1,2",
		"NE": "2,3,3,3,3,3",
		"SW": "1,4,4,4,4,4",
	},
	"NE": {
		"NW": "2,1,1,1,1,1",
		"NE": "3,2",
		"SE": "3,4,4,4,4,4",
	},
	"SW": {
		"NW": "1,2,2,2,2,2",
		"SW": "4,1",
		"SE": "4,3,3,3,3,3",
	},
	"SE": {
		"NE": "3,2,2,2,2,2",
		"SW": "4,1,1,1,1,1",
		"SE": "4,3",
	},
}

// maps start position + dest position to trajectory
// 1 = left, 2 = up, 3 = right, 4 = down
var TestTrajectoryTemplates = map[string]map[string]string{
	"centre_horizontal": {
		"E": "3,3,3,3,3",
		"W": "1,1,1,1,1",
	},
	"centre_vertical": {
		"N": "2,2,2,2,2",
		"S": "4,4,4,4,4",
	},
	"N": {
		"N": "2,2,2",
		"S": "4,4,4,4,4,4,4",
	},
	"S": {
		"N": "2,2,2,2,2,2,2",
		"S": "4,4,4",
	},
	"E": {
		"E": "3,3,3",
		"W": "1,1,1,1,1,1,1",
	},
	"W": {
		"E": "3,3,3,3,3,3,3",
		"W": "1,1,1",
	},
}

var Coords = map[string]Pos{
	"centre_horizontal": {X: 5, Y: 0},
	"centre_vertical":   {X: 0, Y: 4},
	"N":                 {X: 0, Y: 3},
	"S":                 {X: 0, Y: 5},
	"W":                 {X: 3, Y: 0},
	"E":                 {X: 7, Y: 0},
	"NW":                {X: 1, Y: 1},
	"NE":                {X: 5, Y: 1},
	"SW":                {X: 1, Y: 5},
	"SE":                {X: 5, Y: 5},
}

func CreateEvidenceReplays(colorPref string, shapePref string, repeats int) []Replay {
	var replays []Replay
	starts := []string{"NW", "NE", "SW", "SE"}
	var dests []string

	if colorPref == "yellow" {
		dests = []string{"NW", "NE", "NW", "NE"}
	} else if colorPref == "green" {
		dests = []string{"SW", "SE", "SW", "SE"}
	} else if shapePref == "circle" {
		dests = []string{"NW", "NW", "SW", "SW"}
	} else if shapePref == "triangle" {
		dests = []string{"NE", "NE", "SE", "SE"}
	}

	for rep := 0; rep < repeats; rep++ {
		for i, start := range starts {
			replays = append(replays, Replay{
				LevelID:    8,
				Trajectory: EvidenceTrajectoryTemplates[start][dests[i]],
				StartPos:   Coords[start],
			})
		}
	}

	// shuffle replays
	rand.Shuffle(len(replays), func(i, j int) {
		replays[i], replays[j] = replays[j], replays[i]
	})

	return replays
}

func CreateTestReplays(orientation string, colorPref string, shapePref string, repeats int) []Replay {
	lvl, a, b, c := 9, "W", "E", "centre_horizontal"
	if orientation == "vertical" {
		lvl, a, b, c = 10, "N", "S", "centre_vertical"
	}

	var replays []Replay

	starts := []string{c, c, a, b}
	var dests []string

	if colorPref == "yellow" {
		dests = []string{a, a, a, a}
	} else if colorPref == "green" {
		dests = []string{b, b, b, b}
	} else {
		dests = []string{a, b, a, b}
	}

	for rep := 0; rep < repeats; rep++ {
		for i, start := range starts {
			replays = append(replays, Replay{
				LevelID:    lvl,
				Trajectory: TestTrajectoryTemplates[start][dests[i]],
				StartPos:   Coords[start],
			})
		}
	}

	// shuffle replays
	rand.Shuffle(len(replays), func(i, j int) {
		replays[i], replays[j] = replays[j], replays[i]
	})

	return replays
}
