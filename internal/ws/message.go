package ws

type BroadcastMessage struct {
	Data []byte
}

type ServerMessage struct {
	MessageType ServerMessageType `json:"message_type"`
	Sender      string            `json:"sender"`
	Content     string            `json:"content"`
	Timestamp   string            `json:"timestamp"`
	OnlineUsers []string          `json:"online_users,omitempty"`
}

type ClientMessage struct {
	Action  string `json:"action"`
	Content string `json:"content"`
}
