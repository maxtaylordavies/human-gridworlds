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
	Name          string  `json:"name"`
	Levels        []Level `json:"levels"`
	Agents        []Agent `json:"agents"`
	Interactive   bool    `json:"interactive"`
	ObjectsHidden bool    `json:"objectsHidden"`
}

func CreatePhase(name string, levelIDs []int, interactive bool, objectsHidden bool, starts []string, agents []Agent) Phase {
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

	// shuffle the agents
	agentsCopy := make([]Agent, len(agents))
	copy(agentsCopy, agents)
	rand.Shuffle(len(agentsCopy), func(i, j int) {
		agentsCopy[i], agentsCopy[j] = agentsCopy[j], agentsCopy[i]
	})

	return Phase{
		Name:          name,
		Levels:        levels,
		Agents:        agentsCopy,
		Interactive:   interactive,
		ObjectsHidden: objectsHidden,
	}
}
