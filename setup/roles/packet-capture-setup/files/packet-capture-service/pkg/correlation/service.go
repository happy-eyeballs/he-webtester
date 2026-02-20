package correlation

import (
	"fmt"
	"log/slog"
	"packet-capture-service/pkg/capture"
	"packet-capture-service/pkg/netpacket"
)

type CorrelationService struct {
	packetCaptureChannel <-chan netpacket.Packet
}

func NewCorrelationService(packetCapturePipePath string) (*CorrelationService, error) {
	channel, err := capture.StartReadingFromPacketCapturePipe(packetCapturePipePath)
	if err != nil {
		return nil, err
	}

	s := &CorrelationService{
		packetCaptureChannel: channel,
	}

	go s.start()

	return s, nil
}

func (s *CorrelationService) start() {
	for packet := range s.packetCaptureChannel {
		slog.Info("packet captured", "packet", fmt.Sprintf("%+v", packet))
	}
}
