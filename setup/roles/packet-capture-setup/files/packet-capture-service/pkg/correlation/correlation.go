package correlation

import "packet-capture-service/pkg/netpacket"

type packetCorrelation struct {
	packets []*netpacket.Packet
}

func (c *packetCorrelation) doesPacketCorrelate(packet *netpacket.Packet) bool {
	for _, correlatedPacket := range c.packets {
		if correlatedPacket.SourceIP.Compare(packet.SourceIP) == 0 {
			return true
		}
	}

	return false
}
