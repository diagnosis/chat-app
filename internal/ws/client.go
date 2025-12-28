package ws

import (
	"encoding/json"
	"time"

	"github.com/diagnosis/chat-app-v1/internal/logger"
	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
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
		c.Conn.Close() // Only place we close the connection
	}()

	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, msg, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				logger.Info("client disconnected normally", "username", c.Username)
			} else {
				logger.Debug("read error", "err", err, "username", c.Username)
			}
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
	ticker := time.NewTicker(pingPeriod)
	defer ticker.Stop()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			err := c.Conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				logger.Debug("write error", "err", err, "username", c.Username)
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
