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
	Store  Store
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

func CreateServer() Server {
	s := Server{
		Store: Store{
			DataPath: "data/",
		},
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
				ExperimentID string `json:"experiment_id"`
				IsTest       bool   `json:"is_test"`
				Context      string `json:"context"`
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
