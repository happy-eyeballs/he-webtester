package netpacket

import (
	"encoding/json"
	"net/netip"
	"time"
)

type Packet struct {
	Timestamp  time.Time
	SourceIP   netip.Addr
	SourcePort int
	Protocol   string
	SNI        string
}

func (p *Packet) MarshalJSON() ([]byte, error) {
	ipVersion := "IPv4"
	if p.SourceIP.Is6() {
		ipVersion = "IPv6"
	}

	return json.Marshal(&struct {
		Timestamp int64  `json:"timestamp"`
		IPVersion string `json:"ip_version"`
		Protocol  string `json:"protocol"`
	}{
		Timestamp: p.Timestamp.UnixMilli(),
		IPVersion: ipVersion,
		Protocol:  p.Protocol,
	})
}

var _ json.Marshaler = (*Packet)(nil)
