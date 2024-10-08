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

func SampleAgents(zs []int, groups []GroupParams) []Agent {
	agents := []Agent{}
	for _, z := range zs {
		theta := SampleTheta(groups[z].MuTheta[0], groups[z].MuTheta[1], groups[z].SigmaTheta[0], groups[z].SigmaTheta[1])
		phiPos := Gaussian(groups[z].MuPhiPos, groups[z].SigmaPhiPos)
		phi := []float64{1.0 - phiPos, 0.0, phiPos}
		agents = append(agents, Agent{Z: z, Phi: phi, Theta: theta})
	}
	return agents
}
