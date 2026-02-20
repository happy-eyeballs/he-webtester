package server

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"packet-capture-service/pkg/correlation"
)

func NewHTTPServer(address string, correlationService *correlation.CorrelationService) *http.Server {
	mux := http.NewServeMux()

	mux.Handle("/", connectionAttemptInfoHandler(correlationService))

	return &http.Server{
		Addr:    address,
		Handler: mux,
	}
}

func connectionAttemptInfoHandler(correlationService *correlation.CorrelationService) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		host := request.Header.Get("X-SNI")
		if host == "" {
			http.Error(writer, "X-SNI header is missing", http.StatusBadRequest)
			return
		}

		correlatingPackets := correlationService.GetCorrelatingPacketsForSNI(host)

		err := json.NewEncoder(writer).Encode(correlatingPackets)
		if err != nil {
			slog.Error("error encoding response", "error", err)
			http.Error(writer, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}
	})
}
