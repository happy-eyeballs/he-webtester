package correlation

import (
	"fmt"
	"log/slog"
	"slices"

	"packet-capture-service/pkg/capture"
	"packet-capture-service/pkg/netpacket"
)

type CorrelationService struct {
	packetCaptureChannel <-chan netpacket.Packet

	uncorrelatedPackets []*netpacket.Packet
	correlationsBySNI   map[string]*packetCorrelation
}

func NewCorrelationService(packetCapturePipePath string) (*CorrelationService, error) {
	channel, err := capture.StartReadingFromPacketCapturePipe(packetCapturePipePath)
	if err != nil {
		return nil, err
	}

	s := &CorrelationService{
		packetCaptureChannel: channel,
		uncorrelatedPackets:  make([]*netpacket.Packet, 0, 1000),
		correlationsBySNI:    make(map[string]*packetCorrelation),
	}

	go s.start()

	return s, nil
}

func (s *CorrelationService) GetCorrelatingPacketsForSNI(sni string) []*netpacket.Packet {
	correlation, ok := s.correlationsBySNI[sni]
	if !ok {
		return []*netpacket.Packet{}
	}

	return correlation.packets
}

func (s *CorrelationService) start() {
	for packet := range s.packetCaptureChannel {
		slog.Info("packet captured", "packet", fmt.Sprintf("%+v", packet))

		s.processPacket(&packet)
	}
}

func (s *CorrelationService) processPacket(packet *netpacket.Packet) {
	// search all correlations for packets with the same IP address
	// (e.g., an IPv6 TCP SYN packet following an IPv6 QUIC packet)
	for _, correlation := range s.correlationsBySNI {
		if correlation.doesPacketCorrelate(packet) {
			correlation.packets = append(correlation.packets, packet)
			s.moveAllUncorrelatedPacketsToCorrelation(correlation)
			return
		}
	}

	// if there was no matching correlation and the packet has no SNI, we cannot correlate it yet
	// (e.g., an IPv4 TCP SYN packet)
	if packet.SNI == "" {
		s.uncorrelatedPackets = append(s.uncorrelatedPackets, packet)
		return
	}

	// if there is already a correlation for this SNI, add the packet to it
	// (e.g., a TLS packet with the same SNI as a previous QUIC packet)
	correlation, ok := s.correlationsBySNI[packet.SNI]
	if ok {
		correlation.packets = append(correlation.packets, packet)
		s.moveAllUncorrelatedPacketsToCorrelation(correlation)
		return
	}

	// create a new correlation for this SNI
	// (e.g., the first QUIC packet)
	correlation = &packetCorrelation{packets: []*netpacket.Packet{packet}}
	s.moveAllUncorrelatedPacketsToCorrelation(correlation)
	s.correlationsBySNI[packet.SNI] = correlation
}

func (s *CorrelationService) moveAllUncorrelatedPacketsToCorrelation(correlation *packetCorrelation) {
	for {
		success := s.moveOneUncorrelatedPacketToCorrelation(correlation)
		if !success {
			break
		}
	}
}

func (s *CorrelationService) moveOneUncorrelatedPacketToCorrelation(correlation *packetCorrelation) bool {
	for i := 0; i < len(s.uncorrelatedPackets); i++ {
		uncorrelatedPacket := s.uncorrelatedPackets[i]

		for _, correlatedPacket := range correlation.packets {
			// TODO: check that the timestamp is reasonable to fit in correlation

			if uncorrelatedPacket.SourceIP.Compare(correlatedPacket.SourceIP) == 0 {
				// add the uncorrelated packet to the correlation
				correlation.packets = append(correlation.packets, s.uncorrelatedPackets[i])

				// sort the correlation by time
				slices.SortFunc(correlation.packets, func(a, b *netpacket.Packet) int {
					return a.Timestamp.Compare(b.Timestamp)
				})

				// remove uncorrelated packet from the list of uncorrelated packets
				s.uncorrelatedPackets = append(s.uncorrelatedPackets[:i], s.uncorrelatedPackets[i+1:]...)

				return true
			}
		}
	}

	return false
}
