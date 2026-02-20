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

//func StartPacketCapture(networkInterface string) (<-chan netpacket.Packet, error) {
//	cmd := exec.Command("tshark",
//		"-l",
//		"-i", networkInterface,
//		"-f", "dst port 443",
//		"-Y", "tls.handshake.extensions_server_name or (tcp.flags.syn == 1 and tcp.flags.ack == 0)",
//		"-T", "ek",
//		"-e", "frame.time_epoch",
//		"-e", "_ws.col.Source",
//		"-e", "tcp.srcport",
//		"-e", "udp.srcport",
//		"-e", "_ws.col.Protocol",
//		"-e", "tls.handshake.extensions_server_name",
//		//"-e", "_ws.col.Info",
//	)
//
//	stdout, err := cmd.StdoutPipe()
//	if err != nil {
//		return nil, err
//	}
//
//	err = cmd.Start()
//	if err != nil {
//		return nil, err
//	}
//
//	channel := make(chan netpacket.Packet, 10000)
//
//	go func() {
//		scanner := bufio.NewScanner(stdout)
//		for scanner.Scan() {
//			line := scanner.Text()
//
//			if strings.HasPrefix(line, `{"index"`) {
//				continue
//			}
//
//			packet, err := netpacket.ParsePacketFromTShark(line)
//			if err != nil {
//				slog.Error("failed to parse packet from tshark", "error", err, "line", line)
//				continue
//			}
//
//			channel <- packet
//		}
//	}()
//
//	return channel, nil
//}
