package logger

import (
	"log/slog"
	"os"
)

var log *slog.Logger

func Init(dev bool) {
	var level slog.Level
	if dev {
		level = slog.LevelDebug
	} else {
		level = slog.LevelInfo
	}
	opts := &slog.HandlerOptions{
		Level: level,
	}

	var handler slog.Handler

	if dev {
		handler = slog.NewTextHandler(os.Stdout, opts)
	} else {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	}
	log = slog.New(handler)
}

func Info(msg string, args ...any) {
	log.Info(msg, args...)
}

func Debug(msg string, args ...any) {
	log.Debug(msg, args...)
}

func Warn(msg string, args ...any) {
	log.Warn(msg, args...)
}

func Error(msg string, args ...any) {
	log.Error(msg, args...)
}

func Fatal(msg string, args ...any) {
	log.Error(msg, args...)
	os.Exit(1)
}

func With(args ...any) *slog.Logger {
	return log.With(args...)
}
