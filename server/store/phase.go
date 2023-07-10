package store

import "math/rand"

type Pos struct {
	X int `json:"x"`
	Y int `json:"y"`
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

func CreatePhase(name string, levelIDs []int, interactive bool, objectsHidden bool, starts []string) Phase {
	levels := []Level{}
	for _, levelID := range levelIDs {
		if starts == nil {
			levels = append(levels, Level{ID: levelID, StartPos: Pos{X: -1, Y: -1}})
			continue
		}

		rand.Shuffle(len(starts), func(i, j int) {
			starts[i], starts[j] = starts[j], starts[i]
		})
		for _, start := range starts {
			levels = append(levels, Level{ID: levelID, StartPos: Coords[start]})
		}
	}

	return Phase{
		Name:          name,
		Levels:        levels,
		Interactive:   interactive,
		ObjectsHidden: objectsHidden,
	}
}
