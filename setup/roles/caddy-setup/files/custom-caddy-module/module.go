package happy_eyeballs_webtester_module

import (
	"net"
	"time"

	"github.com/caddyserver/caddy/v2"
	"github.com/caddyserver/caddy/v2/caddyconfig/caddyfile"
	"github.com/mholt/caddy-l4/layer4"
	"go.uber.org/zap"
)

func init() {
	caddy.RegisterModule(&Layer4ThrottleVarHandler{})
}

type Layer4ThrottleVarHandler struct {
	Latency string `json:"latency"`

	logger *zap.Logger
}

func (*Layer4ThrottleVarHandler) CaddyModule() caddy.ModuleInfo {
	return caddy.ModuleInfo{
		ID: "layer4.handlers.throttle_var",
		New: func() caddy.Module {
			return new(Layer4ThrottleVarHandler)
		},
	}
}

func (h *Layer4ThrottleVarHandler) Provision(ctx caddy.Context) error {
	h.logger = ctx.Logger(h)
	return nil
}

func (h *Layer4ThrottleVarHandler) Handle(connection *layer4.Connection, next layer4.Handler) error {
	repl := connection.Context.Value(layer4.ReplacerCtxKey).(*caddy.Replacer)

	latencyString := repl.ReplaceAll(h.Latency, "")

	latency, err := caddy.ParseDuration(latencyString)
	if err != nil {
		h.logger.Error("invalid duration", zap.String("duration", latencyString), zap.Error(err))
		return next.Handle(connection)
	}

	if latency == 0 {
		h.logger.Debug("latency is 0")
		return next.Handle(connection)
	}

	h.logger.Debug("wrapping connection with latency", zap.Duration("latency", latency))

	wrappedConnection := connection.Wrap(&ConnectionWithLatency{Conn: connection.Conn, latency: latency})
	return next.Handle(wrappedConnection)
}

func (h *Layer4ThrottleVarHandler) UnmarshalCaddyfile(d *caddyfile.Dispenser) error {
	d.Next()

	if d.CountRemainingArgs() != 1 {
		return d.ArgErr()
	}

	d.NextArg()
	h.Latency = d.Val()

	return nil
}

type ConnectionWithLatency struct {
	net.Conn
	latency time.Duration
}

func (c *ConnectionWithLatency) Read(b []byte) (n int, err error) {
	time.Sleep(c.latency)
	return c.Conn.Read(b)
}

func (c *ConnectionWithLatency) Write(b []byte) (n int, err error) {
	time.Sleep(c.latency)
	return c.Conn.Write(b)
}

var (
	_ caddy.Provisioner     = (*Layer4ThrottleVarHandler)(nil)
	_ caddyfile.Unmarshaler = (*Layer4ThrottleVarHandler)(nil)
	_ layer4.NextHandler    = (*Layer4ThrottleVarHandler)(nil)
)
