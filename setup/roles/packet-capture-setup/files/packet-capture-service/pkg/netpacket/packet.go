package netpacket

import (
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
