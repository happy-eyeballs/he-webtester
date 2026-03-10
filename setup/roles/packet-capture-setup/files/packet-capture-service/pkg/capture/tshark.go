package capture

import (
	"bufio"
	"log/slog"
	"os"
	"strings"

	"packet-capture-service/pkg/netpacket"
)

func StartReadingFromPacketCapturePipe(pipePath string) (<-chan netpacket.Packet, error) {
	file, err := os.Open(pipePath)
	if err != nil {
		return nil, err
	}

	channel := make(chan netpacket.Packet, 10000)

	go func() {
		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := scanner.Text()

			if strings.HasPrefix(line, `{"index"`) {
				continue
			}

			packet, err := netpacket.ParsePacketFromTShark(line)
			if err != nil {
				slog.Error("failed to parse packet from tshark", "error", err, "line", line)
				continue
			}

			channel <- packet
		}
	}()

	return channel, nil
}
