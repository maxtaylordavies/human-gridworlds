package store

var MU_PHI_POS = []float64{0.05, 0.95}

var MU_THETA_YELLOW = []float64{0.9, 0.5}
var MU_THETA_GREEN = []float64{0.1, 0.5}
var MU_THETA_CIRCLE = []float64{0.5, 0.9}
var MU_THETA_TRIANGLE = []float64{0.5, 0.1}

var MU_THETA_COLORS = [][]float64{MU_THETA_YELLOW, MU_THETA_GREEN}
var MU_THETA_SHAPES = [][]float64{MU_THETA_CIRCLE, MU_THETA_TRIANGLE}

var GREY_PHI = []float64{0.5, 0.5, 0.5}

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
}
