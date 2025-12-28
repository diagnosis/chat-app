package ws

import (
	"encoding/json"
	"time"

	"github.com/diagnosis/chat-app-v1/internal/logger"
)

type ServerMessageType int

const (
	UserJoined ServerMessageType = iota
	UserLeft
	UserChat
)

type Hub struct {
	Clients        map[*Client]bool
	Register       chan *Client
	Unregister     chan *Client
	Broadcast      chan *BroadcastMessage
	MessageHistory [][]byte
}

func NewHub() *Hub {
	return &Hub{
		Clients:        make(map[*Client]bool),
		Register:       make(chan *Client, 10),
		Unregister:     make(chan *Client, 10),
		Broadcast:      make(chan *BroadcastMessage, 100),
		MessageHistory: make([][]byte, 0),
	}
}
func (h *Hub) getOnlineUsers() []string {
	onlineUsers := make([]string, 0, len(h.Clients))
	for client := range h.Clients {
		onlineUsers = append(onlineUsers, client.Username)
	}
	return onlineUsers
}

func (h *Hub) getServerMessageJson(messageType ServerMessageType, username, msgContent string) []byte {
	serverMsg := ServerMessage{
		MessageType: messageType,
		Sender:      username,
		Content:     msgContent,
		Timestamp:   time.Now().Format("15:05:05"),
		OnlineUsers: h.getOnlineUsers(),
	}
	serverMsgJson, err := json.Marshal(serverMsg)
	if err != nil {
		logger.Error("failed to marshal server message", "err:", err)
	}
	if messageType == UserChat {
		h.MessageHistory = append(h.MessageHistory, serverMsgJson)
		if len(h.MessageHistory) > 20 {
			h.MessageHistory = h.MessageHistory[1:]
		}
	}
	return serverMsgJson
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			//first add to map
			h.Clients[client] = true
			//second reload message history
			for _, msgJson := range h.MessageHistory {
				client.Send <- msgJson
			}
			//form serverMsg and broadcast
			registerMsg := h.getServerMessageJson(UserJoined, client.Username, "user joined")
			h.Broadcast <- &BroadcastMessage{registerMsg}
		case client := <-h.Unregister:
			//first check if client in map then remove and close send channel
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)
			}
			//form serverMsg and broadcast
			unregisterMsg := h.getServerMessageJson(UserLeft, client.Username, "user left")
			h.Broadcast <- &BroadcastMessage{unregisterMsg}
		case msg := <-h.Broadcast:
			for client := range h.Clients {
				select {
				case client.Send <- msg.Data:
				default:
					close(client.Send)
					delete(h.Clients, client)
				}
			}
		}

	}
}
