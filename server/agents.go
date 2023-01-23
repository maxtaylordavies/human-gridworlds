package main

// key:
// 		1: left
// 		2: up
// 		3: right
// 		4: down

var AgentIDs = []string{"a-0001", "a-0002", "a-0003", "a-0004"}
var AgentTrajectories = map[string]Trajectories{
	"a-0001": {
		0: "1,1,1,1,1,1,1,1,1,1,1,1",
		1: "3,3,3,3,3,3,3,3,3,3,3,3",
		2: "2,2,2,2,2,2,2,2,2,2,2,2",
		3: "4,4,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2",
		4: "4,4,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2",
		5: "1,1,1,1,1,1,1,1,1,1,1,1",
		6: "3,3,3,3,3,3,3,3,3,3,3,3",
		7: "4,4,4,4,4,4,4,4,4,4,4",
		8: "3,3,3,3,3,3,3,3,3,3,3,3,3,3,3",
	},
	"a-0002": {
		0: "2,2,2,2,2,2,2,2,2,2,2,2",
		1: "1,1,1,1,1,1,1,1,1,1,1,1",
		2: "3,3,3,3,3,3,3,3,3,3,3,3",
		3: "4,4,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2",
		4: "4,4,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2",
		5: "3,3,3,3,3,3,3,3,3,3,3,3",
		6: "1,1,1,1,1,1,1,1,1,1,1,1",
		7: "3,3,3,3,3,3,3,3,3,3,3,3,3,3,3",
		8: "4,4,4,4,4,4,4,4,4,4,4",
	},
	"a-0003": {
		7:  "4,4,4,4,4,4,4,4,4,4,4",
		8:  "3,3,3,3,3,3,3,3,3,3,3,3,3,3,3",
		9:  "1,1,1,1,1,1,1,1,1,1,1,1",
		10: "3,3,3,3,3,3,3,3,3,3,3,3",
	},
	"a-0004": {
		7:  "3,3,3,3,3,3,3,3,3,3,3,3,3,3,3",
		8:  "4,4,4,4,4,4,4,4,4,4,4",
		9:  "3,3,3,3,3,3,3,3,3,3,3,3",
		10: "1,1,1,1,1,1,1,1,1,1,1,1",
	},
}
