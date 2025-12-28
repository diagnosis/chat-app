package handler

import (
	"net/http"

	"github.com/diagnosis/chat-app-v1/internal/logger"
	"github.com/diagnosis/chat-app-v1/internal/ws"
	"github.com/gorilla/websocket"
)

type WSHandler struct {
	Hub *ws.Hub
}

func NewWSHandler(hub *ws.Hub) *WSHandler {
	go hub.Run()
	return &WSHandler{Hub: hub}
}

var upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool {
	return true
}}

func (h *WSHandler) HandleWs(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "username is required", 400)
		return
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "websocket connection error", 500)
		logger.Error("websocket connection error", "err", err)
		return
	}
	client := &ws.Client{
		Username: username,
		Conn:     conn,
		Send:     make(chan []byte),
		Hub:      h.Hub,
	}
	h.Hub.Register <- client

	go client.ReadPump()
	go client.WritePump()

}
