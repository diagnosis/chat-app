ARG GO_VERSION=1
FROM golang:${GO_VERSION}-bookworm as builder

WORKDIR /usr/src/app
COPY go.mod go.sum ./
RUN go mod download && go mod verify
COPY . .

# Fix: Build from cmd/server, not root
RUN go build -v -o /run-app ./cmd/server  # ✅ Changed this line

FROM debian:bookworm

WORKDIR /app

COPY --from=builder /run-app /usr/local/bin/

# Also copy frontend!
COPY --from=builder /usr/src/app/chat-frontend ./chat-frontend

CMD ["run-app"]