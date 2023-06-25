package main

import (
	"log"
)

func main() {
	s := CreateServer(8100)
	log.Fatal(s.ListenAndServe())
}
