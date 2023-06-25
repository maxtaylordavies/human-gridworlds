package store

type Agent struct {
	Name   string  `json:"name"`
	Thetas [][]int `json:"thetas"`
	Phi    int     `json:"phi"`
}
