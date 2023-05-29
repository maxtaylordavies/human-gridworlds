package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"

	"human-gridworlds/store"
)

type Server struct {
	Router *mux.Router
	Store  store.Store
	Port   string
}

const (
	distPath    = "ui/dist"
	indexPath   = distPath + "/index.html"
	faviconPath = distPath + "/favicon.ico"
)

func fileHandler(filePath string) http.HandlerFunc {
	log.Println(filePath)
	return func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filePath)
	}
}

func decodePostRequest(r *http.Request, data interface{}) error {
	decoder := json.NewDecoder(r.Body)
	return decoder.Decode(&data)
}

func respond(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func CreateServer(port int) Server {
	s := Server{
		Store: store.Store{
			DataPath:      "data/",
			ResourcesPath: "resources/",
		},
		Port: fmt.Sprintf(":%d", port),
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

	// participant information sheet pdf
	s.Router.HandleFunc("/pis", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "PIS.pdf")
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

		http.ServeFile(w, r, s.Store.GetGameSpecFilePath(id))
	})

	s.Router.HandleFunc("/api/session", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			id := r.URL.Query().Get("id")
			if id == "" {
				http.Error(w, "'id' query param is required", http.StatusBadRequest)
				return
			}

			http.ServeFile(w, r, s.Store.GetSessionFilePath(id))
		} else if r.Method == http.MethodPost {
			var data struct {
				ExperimentID string      `json:"experimentId"`
				HumanID      string      `json:"humanId"`
				IsTest       bool        `json:"isTest"`
				Context      interface{} `json:"context"`
			}

			err := decodePostRequest(r, &data)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			sess, err := s.Store.CreateSession(data.ExperimentID, data.IsTest, data.Context)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			respond(w, sess)
		}
	})

	s.Router.HandleFunc("/api/trajectories", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not supported", http.StatusBadRequest)
			return
		}

		var data struct {
			SessionID    string             `json:"session_id"`
			Trajectories store.Trajectories `json:"trajectories"`
		}

		err := decodePostRequest(r, &data)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		err = s.Store.StoreTrajectories(data.SessionID, data.Trajectories)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

	})

	s.Router.HandleFunc("/api/paths", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not supported", http.StatusBadRequest)
			return
		}

		gameID := r.URL.Query().Get("game_id")
		agentIDsStr := r.URL.Query().Get("agent_ids")
		levelsStr := r.URL.Query().Get("levels")
		if gameID == "" || agentIDsStr == "" || levelsStr == "" {
			http.Error(w, "'game_id', 'agent_ids' and 'levels' params are required", http.StatusBadRequest)
			return
		}

		agentIDs, tmp := strings.Split(agentIDsStr, ","), strings.Split(levelsStr, ",")
		levels := make([]int, len(tmp))
		for i, s := range tmp {
			l, err := strconv.Atoi(s)
			if err != nil {
				http.Error(w, "'levels' param formatted incorrectly", http.StatusBadRequest)
				return
			}
			levels[i] = l
		}

		paths := s.Store.GetLevelPaths(gameID, agentIDs, levels)
		respond(w, paths)
	})

	s.Router.HandleFunc("/api/finalScore", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not supported", http.StatusBadRequest)
			return
		}

		var data struct {
			SessionID string `json:"session_id"`
			Score     int    `json:"score"`
		}

		err := decodePostRequest(r, &data)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		err = s.Store.StoreFinalScore(data.SessionID, data.Score)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	})

	s.Router.HandleFunc("/api/freeTextResponse", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not supported", http.StatusBadRequest)
			return
		}

		var data struct {
			SessionID string `json:"session_id"`
			Response  string `json:"response"`
		}

		err := decodePostRequest(r, &data)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		err = s.Store.StoreFreeTextResponse(data.SessionID, data.Response)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
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
