package store

var MU_PHI_POS = []float64{0.2, 0.8}

var strong = 0.9
var weak = 0.6

var MU_THETA_YELLOW_STRONG = []float64{strong, 0.5}
var MU_THETA_YELLOW_WEAK = []float64{weak, 0.5}
var MU_THETA_GREEN_STRONG = []float64{1.0 - strong, 0.5}
var MU_THETA_GREEN_WEAK = []float64{1.0 - weak, 0.5}
var MU_THETA_CIRCLE_STRONG = []float64{0.5, strong}
var MU_THETA_CIRCLE_WEAK = []float64{0.5, weak}
var MU_THETA_TRIANGLE_STRONG = []float64{0.5, 1.0 - strong}
var MU_THETA_TRIANGLE_WEAK = []float64{0.5, 1.0 - weak}

var MU_THETA_COLORS_STRONG = [][]float64{MU_THETA_YELLOW_STRONG, MU_THETA_GREEN_STRONG}
var MU_THETA_COLORS_WEAK = [][]float64{MU_THETA_YELLOW_WEAK, MU_THETA_GREEN_WEAK}
var MU_THETA_SHAPES_STRONG = [][]float64{MU_THETA_CIRCLE_STRONG, MU_THETA_TRIANGLE_STRONG}
var MU_THETA_SHAPES_WEAK = [][]float64{MU_THETA_CIRCLE_WEAK, MU_THETA_TRIANGLE_WEAK}

var NEUTRAL_PHI = []float64{0.5, 0.0, 0.5}
var RED_PHI = []float64{1 - MU_PHI_POS[0], 0.0, MU_PHI_POS[0]}
var BLUE_PHI = []float64{1 - MU_PHI_POS[1], 0.0, MU_PHI_POS[1]}

var AGENT_NAMES = []string{
	"Alex",
	"Bob",
	"Charlie",
	"David",
	"Edward",
	"Frank",
	"George",
	"Harry",
	"Ian",
	"John",
}

var COORDS = map[int]map[string]Pos{
	8: {
		"N":  {X: 3, Y: 0},
		"S":  {X: 3, Y: 6},
		"W":  {X: 0, Y: 3},
		"E":  {X: 6, Y: 3},
		"NW": {X: 1, Y: 1},
		"NE": {X: 5, Y: 1},
		"SW": {X: 1, Y: 5},
		"SE": {X: 5, Y: 5},
	},
	9: {
		"C": {X: 5, Y: 0},
		"W": {X: 3, Y: 0},
		"E": {X: 7, Y: 0},
	},
	10: {
		"C": {X: 0, Y: 4},
		"N": {X: 0, Y: 3},
		"S": {X: 0, Y: 5},
	},
}
