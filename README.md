# Real-Time Chat App

A simple WebSocket-based chat application.

## Features

- Real-time messaging
- Online users tracking
- Message history (last 20 messages)
- Join/leave notifications

## Tech Stack

**Backend:** Go, Gorilla WebSocket  
**Frontend:** Vanilla JavaScript, Tailwind CSS

## Run Locally
```bash
go run cmd/server/main.go
```

Open `http://localhost:8080`

## Project Structure
```
├── cmd/server/          # Entry point
├── internal/
│   ├── app/            # Application setup
│   ├── handler/        # HTTP & WebSocket handlers
│   ├── logger/         # Logging utility
│   └── ws/             # WebSocket logic (Hub, Client)
└── chat-frontend/       # SPA frontend
```

## How It Works

- Hub pattern manages all client connections
- Go channels handle concurrency safely
- Single-page application with custom router
- WebSocket for real-time bidirectional communication
