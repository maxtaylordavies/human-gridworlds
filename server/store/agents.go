package store

type ThetaType []float64

type PhiType []float64

type GroupParams struct {
	MuTheta     []float64
	SigmaTheta  []float64
	MuPhiPos    float64
	SigmaPhiPos float64
}

type Agent struct {
	Z     int       `json:"z"`
	Phi   PhiType   `json:"phi"`
	Theta ThetaType `json:"theta"`
	Name  string    `json:"name"`
}

func SampleTheta(muColor float64, muShape float64, sigmaColor float64, sigmaShape float64) ThetaType {
	colorPref := Gaussian(muColor, sigmaColor)
	shapePref := Gaussian(muShape, sigmaShape)
	theta := []float64{
		colorPref + shapePref,             // yellow circle
		colorPref + (1 - shapePref),       // yellow triangle
		(1 - colorPref) + shapePref,       // green circle
		(1 - colorPref) + (1 - shapePref), // green triangle
	}
	return Normalise(theta)
}

func PhiPosToPhi(phiPos float64) PhiType {
	return PhiType{1.0 - phiPos, 0.0, phiPos}
}

func SampleAgents(numPerGroup int, groups []GroupParams, names []string) []Agent {
	agents := []Agent{}
	for k, group := range groups {
		phiVals := GetValuesBetweenQuantiles(
			group.MuPhiPos,
			group.SigmaPhiPos,
			0.25,
			0.75,
			numPerGroup,
		)
		for i := 0; i < numPerGroup; i++ {
			theta := SampleTheta(group.MuTheta[0], group.MuTheta[1], group.SigmaTheta[0], group.SigmaTheta[1])
			phi := PhiPosToPhi(phiVals[i])
			agents = append(agents, Agent{Z: k, Phi: phi, Theta: theta, Name: names[k*numPerGroup+i]})
		}
	}

	return agents
}
