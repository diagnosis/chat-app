package app

import (
	"github.com/diagnosis/chat-app-v1/internal/handler"
	"github.com/diagnosis/chat-app-v1/internal/logger"
	"github.com/diagnosis/chat-app-v1/internal/ws"
)

type Application struct {
	WSHandler   *handler.WSHandler
	HomeHandler *handler.HomeHandler
}

func NewApplication() *Application {
	logger.Init(true)
	hub := ws.NewHub()
	wsHandler := handler.NewWSHandler(hub)
	fileDir := "./chat-frontend"
	fileName := "./chat-frontend/index.html"
	homeHandler := handler.NewHomeHandler(fileName, fileDir)

	return &Application{WSHandler: wsHandler, HomeHandler: homeHandler}
}
