package main

import (
	"log"
)

func main() {
	// r := mux.NewRouter()
	// r.PathPrefix("/").Handler(http.FileServer(http.Dir(distPath)))

	// server := http.Server{
	// 	Addr:         ":8100",
	// 	Handler:      r,
	// 	ReadTimeout:  5 * time.Second,
	// 	WriteTimeout: 5 * time.Second,
	// 	IdleTimeout:  120 * time.Second,
	// }

	// log.Fatal(server.ListenAndServe())
	s := CreateServer()
	log.Fatal(s.ListenAndServe())
}
