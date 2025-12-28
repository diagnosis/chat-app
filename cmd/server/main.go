package main

import (
	"net/http"

	"github.com/diagnosis/chat-app-v1/internal/app"
	"github.com/diagnosis/chat-app-v1/internal/logger"
)

func main() {
	appl := app.NewApplication()

	http.HandleFunc("/", appl.HomeHandler.HandleHome)
	http.HandleFunc("/ws", appl.WSHandler.HandleWs)

	logger.Info("starting the app on localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		logger.Fatal("failed to start server", err)
	}
}
