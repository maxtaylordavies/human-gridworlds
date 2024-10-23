package store

var MU_PHI_POS = []float64{0.25, 0.75}

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

var MU_THETA_YELLOW_CIRCLE = []float64{strong, strong}
var MU_THETA_YELLOW_TRIANGLE = []float64{strong, 1.0 - strong}
var MU_THETA_GREEN_CIRCLE = []float64{1.0 - strong, strong}
var MU_THETA_GREEN_TRIANGLE = []float64{1.0 - strong, 1.0 - strong}

var MU_THETA_COLORS_STRONG = [][]float64{MU_THETA_YELLOW_STRONG, MU_THETA_GREEN_STRONG}
var MU_THETA_COLORS_WEAK = [][]float64{MU_THETA_YELLOW_WEAK, MU_THETA_GREEN_WEAK}
var MU_THETA_SHAPES_STRONG = [][]float64{MU_THETA_CIRCLE_STRONG, MU_THETA_TRIANGLE_STRONG}
var MU_THETA_SHAPES_WEAK = [][]float64{MU_THETA_CIRCLE_WEAK, MU_THETA_TRIANGLE_WEAK}

var NEUTRAL_PHI = []float64{0.5, 0.0, 0.5}
var RED_PHI = []float64{1 - MU_PHI_POS[0], 0.0, MU_PHI_POS[0]}
var BLUE_PHI = []float64{1 - MU_PHI_POS[1], 0.0, MU_PHI_POS[1]}

var STANDARD_NORMAL_QUANTILES = map[float64]float64{
	0.05: -1.6448536269514729,
	0.10: -1.2815515655446004,
	0.15: -1.0364333894937896,
	0.20: -0.8416212335729142,
	0.25: -0.6744897501960817,
	0.30: -0.5244005127080409,
	0.35: -0.38532046640756773,
	0.40: -0.2533471031357997,
	0.45: -0.12566134685507402,
	0.50: 0.0,
	0.55: 0.12566134685507402,
	0.60: 0.2533471031357997,
	0.65: 0.38532046640756773,
	0.70: 0.5244005127080407,
	0.75: 0.6744897501960817,
	0.80: 0.8416212335729143,
	0.85: 1.0364333894937896,
	0.90: 1.2815515655446004,
	0.95: 1.6448536269514729,
}

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

var COORDS = map[string]map[string]Pos{
	"square": {
		"C":   {X: 3, Y: 3},
		"N":   {X: 3, Y: 0},
		"S":   {X: 3, Y: 6},
		"W":   {X: 0, Y: 3},
		"E":   {X: 6, Y: 3},
		"NW":  {X: 1, Y: 1},
		"NE":  {X: 5, Y: 1},
		"SW":  {X: 1, Y: 5},
		"SE":  {X: 5, Y: 5},
		"CNW": {X: 2, Y: 2},
		"CSE": {X: 4, Y: 4},
	},
	"horizontal": {
		"C": {X: 5, Y: 0},
		"W": {X: 3, Y: 0},
		"E": {X: 7, Y: 0},
	},
	"vertical": {
		"C": {X: 0, Y: 4},
		"N": {X: 0, Y: 2},
		"S": {X: 0, Y: 6},
	},
}
var LEVEL_TYPES = map[int]string{
	4:  "square",
	5:  "square",
	6:  "square",
	7:  "square",
	8:  "square",
	9:  "horizontal",
	10: "vertical",
	11: "horizontal",
	12: "vertical",
	13: "horizontal",
	14: "vertical",
	15: "horizontal",
	16: "vertical",
}
