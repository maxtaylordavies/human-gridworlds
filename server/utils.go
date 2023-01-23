package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"time"

	"github.com/google/uuid"
)

func GenerateID(prefix string) string {
	return fmt.Sprintf("%s%s", prefix, uuid.NewString()[:8])
}

func SampleFromSliceString(s []string, n int) []string {
	r := rand.New(rand.NewSource(time.Now().Unix()))
	perm, res := r.Perm(len(s)), []string{}

	for i := 0; i < n; i++ {
		res = append(res, s[perm[i]])
	}

	return res
}

func BinaryChoice(a int, b int) int {
	r := rand.New(rand.NewSource(time.Now().Unix()))
	if r.Float64() < 0.5 {
		return a
	}
	return b
}

func SampleFromSliceInt(s []int, n int) []int {
	r := rand.New(rand.NewSource(time.Now().Unix()))
	perm, res := r.Perm(len(s)), []int{}

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

func ReadStructFromJSON(s interface{}, fp string) error {
	data, err := ioutil.ReadFile(fp)
	if err != nil {
		return err
	}

	return json.Unmarshal(data, s)
}

func WriteStructToJSON(s interface{}, fp string) error {
	// save session to file and return
	serialised, err := json.MarshalIndent(s, "", " ")
	if err != nil {
		return err
	}
	return ioutil.WriteFile(fp, serialised, 0644)
}
