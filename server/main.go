package main

import (
	"log"
)

func main() {
	s := CreateServer()
	log.Fatal(s.ListenAndServe())
}
