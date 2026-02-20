package server

import (
	"net/http"
)

func NewHTTPServer(address string) *http.Server {
	mux := http.NewServeMux()

	return &http.Server{
		Addr:    address,
		Handler: mux,
	}
}
