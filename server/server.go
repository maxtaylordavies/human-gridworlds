package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

type Server struct {
	Router *mux.Router
	Port   string
}

const (
	distPath         = "ui/dist"
	indexPath        = distPath + "/index.html"
	faviconPath      = distPath + "/favicon.ico"
	dataPath         = "data"
	gamesPath        = dataPath + "/games"
	trajectoriesPath = dataPath + "/trajectories"
)

func fileHandler(filePath string) http.HandlerFunc {
	log.Println(filePath)
	return func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filePath)
	}
}

func respond(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func CreateServer() Server {
	s := Server{
		Port: ":8100",
	}
	s.registerRoutes()
	return s
}

func (s *Server) registerRoutes() {
	s.Router = mux.NewRouter()

	// for uptime checker
	s.Router.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		payload := struct {
			Status string `json:"status"`
		}{
			Status: "ok",
		}
		respond(w, payload)
	})

	// api routes
	s.Router.HandleFunc("/api/game", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not supported", http.StatusBadRequest)
			return
		}

		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, "'id' query param is required", http.StatusBadRequest)
			return
		}

		http.ServeFile(w, r, gamesPath+"/"+id+".yaml")
	})

	// for serving ui
	s.Router.PathPrefix("/").Handler(http.FileServer(http.Dir(distPath)))
}

func (s Server) ListenAndServe() error {
	srv := http.Server{
		Addr:         s.Port,
		Handler:      s.Router,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	return srv.ListenAndServe()
}
