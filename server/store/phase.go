package store

import "math/rand"

type Pos struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type Level struct {
	ID             int   `json:"id"`
	StartPositions []Pos `json:"startPositions"`
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
		var startPositions []Pos
		if starts != nil {
			for _, start := range starts {
				startPositions = append(startPositions, COORDS[levelID][start])
			}
		}
		rand.Shuffle(len(startPositions), func(i, j int) {
			startPositions[i], startPositions[j] = startPositions[j], startPositions[i]
		})
		levels = append(levels, Level{ID: levelID, StartPositions: startPositions})
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
