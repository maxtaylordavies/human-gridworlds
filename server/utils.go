package main

import (
	"math/rand"
	"time"
)

func SampleFromSliceString(s []string, n int) []string {
	if n >= len(s) {
		return s
	}

	r := rand.New(rand.NewSource(time.Now().Unix()))
	perm, res := r.Perm(len(s)), []string{}

	for i := 0; i < n; i++ {
		res = append(res, s[perm[i]])
	}

	return res
}

func SampleFromRange(low int, high int, n int) []int {
	all := makeRange(low, high)
	if n >= len(all) {
		return all
	}

	r := rand.New(rand.NewSource(time.Now().Unix()))
	perm, res := r.Perm(len(all)), []int{}

	for i := 0; i < n; i++ {
		res = append(res, all[perm[i]])
	}

	return res
}

func makeRange(min, max int) []int {
	a := make([]int, max-min+1)
	for i := range a {
		a[i] = min + i
	}
	return a
}
