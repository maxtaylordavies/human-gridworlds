package store

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

func RNG() *rand.Rand {
	return rand.New(rand.NewSource(time.Now().UnixNano()))
}

func Sum(s []float64) float64 {
	sum := 0.0
	for _, v := range s {
		sum += v
	}
	return sum
}

func Normalise(s []float64) []float64 {
	var out []float64
	sum := Sum(s)
	for _, v := range s {
		out = append(out, v/sum)
	}
	return out
}

func SampleFromSliceInt(s []int, n int) []int {
	perm, res := RNG().Perm(len(s)), []int{}

	for i := 0; i < n; i++ {
		res = append(res, s[perm[i]])
	}

	return res
}

func Gaussian(mu float64, sigma float64) float64 {
	return RNG().NormFloat64()*sigma + mu
}

func Clip(x float64, low float64, high float64) float64 {
	if x < low {
		return low
	} else if x > high {
		return high
	}
	return x
}

func SampleFromSliceString(s []string, n int) []string {
	perm, res := RNG().Perm(len(s)), []string{}

	for i := 0; i < n; i++ {
		res = append(res, s[perm[i]])
	}

	return res
}

func BinaryChoice(a int, b int) int {
	if RNG().Float64() < 0.5 {
		return a
	}
	return b
}

func SampleFromRange(low int, high int, n int) []int {
	all := makeRange(low, high)
	if n >= len(all) {
		return all
	}

	perm, res := RNG().Perm(len(all)), []int{}

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
