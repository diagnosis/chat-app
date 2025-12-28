package handler

import (
	"net/http"
	"strings"
)

type HomeHandler struct {
	fileName    string
	fileDir     string
	fileHandler http.Handler
}

func NewHomeHandler(fileName string, fileDir string) *HomeHandler {
	fileHandler := http.FileServer(http.Dir(fileDir))
	return &HomeHandler{fileName: fileName, fileDir: fileDir, fileHandler: fileHandler}
}

func (h *HomeHandler) HandleHome(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if strings.Contains(path, ".") {
		h.fileHandler.ServeHTTP(w, r)
	} else {
		http.ServeFile(w, r, h.fileName)
	}
}
