package ws

import (
	"encoding/json"

	"github.com/diagnosis/chat-app-v1/internal/logger"
	"github.com/gorilla/websocket"
)

type Client struct {
	Username string
	Conn     *websocket.Conn
	Send     chan []byte
	Hub      *Hub
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, msg, err := c.Conn.ReadMessage()
		if err != nil {
			logger.Error("readpump error", "err", err)
			break
		}
		var clientMessage ClientMessage
		if err = json.Unmarshal(msg, &clientMessage); err != nil {
			logger.Error("unmarshalling error", "err", err)
			continue
		}
		serverMsg := c.Hub.getServerMessageJson(
			UserChat,
			c.Username,
			clientMessage.Content,
		)
		c.Hub.Broadcast <- &BroadcastMessage{Data: serverMsg}

	}
}

func (c *Client) WritePump() {
	defer c.Conn.Close()

	for msg := range c.Send {
		err := c.Conn.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			logger.Error("write pump error", "err", err)
			break
		}
	}
}
