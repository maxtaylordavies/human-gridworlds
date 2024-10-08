package store

var MU_PHI_POS = []float64{0.2, 0.8}

var MU_THETA_YELLOW = []float64{0.8, 0.5}
var MU_THETA_GREEN = []float64{0.2, 0.5}
var MU_THETA_CIRCLE = []float64{0.5, 0.8}
var MU_THETA_TRIANGLE = []float64{0.5, 0.2}

var MU_THETA_COLORS = [][]float64{MU_THETA_YELLOW, MU_THETA_GREEN}
var MU_THETA_SHAPES = [][]float64{MU_THETA_CIRCLE, MU_THETA_TRIANGLE}

var NEUTRAL_PHI = []float64{0.5, 0.0, 0.5}
var RED_PHI = []float64{1 - MU_PHI_POS[0], 0.0, MU_PHI_POS[0]}
var BLUE_PHI = []float64{1 - MU_PHI_POS[1], 0.0, MU_PHI_POS[1]}
