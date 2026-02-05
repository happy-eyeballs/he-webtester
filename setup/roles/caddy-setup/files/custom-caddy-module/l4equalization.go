package happy_eyeballs_webtester_module

import (
	"context"
	"time"

	"github.com/caddyserver/caddy/v2"
	"github.com/caddyserver/caddy/v2/caddyconfig/caddyfile"
	"github.com/mholt/caddy-l4/layer4"
	"go.uber.org/zap"
)

type Layer4ProcessingDelayEqualizationBeginHandler struct{}

func (*Layer4ProcessingDelayEqualizationBeginHandler) CaddyModule() caddy.ModuleInfo {
	return caddy.ModuleInfo{
		ID: "layer4.handlers.begin_processing_delay_equalization",
		New: func() caddy.Module {
			return new(Layer4ProcessingDelayEqualizationBeginHandler)
		},
	}
}

func (h *Layer4ProcessingDelayEqualizationBeginHandler) Handle(connection *layer4.Connection, next layer4.Handler) error {
	now := time.Now()
	connection.Context = context.WithValue(connection.Context, processingDelayEqualizationBeginTimeCtxKey, &now)

	return next.Handle(connection)
}

func (h *Layer4ProcessingDelayEqualizationBeginHandler) UnmarshalCaddyfile(d *caddyfile.Dispenser) error {
	d.Next()

	if d.CountRemainingArgs() > 0 {
		return d.ArgErr()
	}

	return nil
}

type Layer4ProcessingDelayEqualizationHandler struct {
	EqualizationDelay caddy.Duration `json:"equalization_delay"`

	logger *zap.Logger
}

func (*Layer4ProcessingDelayEqualizationHandler) CaddyModule() caddy.ModuleInfo {
	return caddy.ModuleInfo{
		ID: "layer4.handlers.processing_delay_equalization",
		New: func() caddy.Module {
			return new(Layer4ProcessingDelayEqualizationHandler)
		},
	}
}

func (h *Layer4ProcessingDelayEqualizationHandler) Provision(ctx caddy.Context) error {
	h.logger = ctx.Logger(h)
	return nil
}

func (h *Layer4ProcessingDelayEqualizationHandler) Handle(connection *layer4.Connection, next layer4.Handler) error {
	beginTime, ok := connection.Context.Value(processingDelayEqualizationBeginTimeCtxKey).(*time.Time)
	if !ok || beginTime == nil {
		h.logger.Warn("processing delay equalization begin time is not a valid time, skipping")
		return next.Handle(connection)
	}

	elapsed := time.Since(*beginTime)
	delta := time.Duration(h.EqualizationDelay) - elapsed

	if delta > 0 {
		h.logger.Debug("applying processing delay equalization", zap.Duration("delta", delta))

		timer := time.NewTimer(delta)
		select {
		case <-timer.C:
		case <-connection.Context.Done():
			return context.Canceled
		}
	}

	return next.Handle(connection)
}

func (h *Layer4ProcessingDelayEqualizationHandler) UnmarshalCaddyfile(d *caddyfile.Dispenser) error {
	d.Next()

	if d.CountRemainingArgs() != 1 {
		return d.ArgErr()
	}

	d.NextArg()

	duration, err := caddy.ParseDuration(d.Val())
	if err != nil {
		return d.Err("invalid duration")
	}

	h.EqualizationDelay = caddy.Duration(duration)

	return nil
}

const (
	processingDelayEqualizationBeginTimeCtxKey caddy.CtxKey = "layer4_processing_delay_equalization_begin_time"
)

var (
	_ caddyfile.Unmarshaler = (*Layer4ProcessingDelayEqualizationBeginHandler)(nil)
	_ layer4.NextHandler    = (*Layer4ProcessingDelayEqualizationBeginHandler)(nil)

	_ caddy.Provisioner     = (*Layer4ProcessingDelayEqualizationHandler)(nil)
	_ caddyfile.Unmarshaler = (*Layer4ProcessingDelayEqualizationHandler)(nil)
	_ layer4.NextHandler    = (*Layer4ProcessingDelayEqualizationHandler)(nil)
)
