import React from "react";
import { type SubtestResult } from "@/lib/test-run.ts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

type Props = {
  result: SubtestResult;
  metadata?: { key: string; value: string }[];
};

export const TestResultBadge: React.FC<Props> = ({ result, metadata }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          style={{
            background: result.color,
          }}
          className="w-max px-4 py-1 rounded-full text-white"
        >
          {result.value}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 p-2">
          <div className="text-muted text-right font-semibold">URL</div>
          <a
            href={result.url}
            className="underline underline-offset-4 cursor-pointer hover:opacity-80"
          >
            {result.url}
          </a>

          {metadata?.map(({ key, value }) => (
            <>
              <div className="text-muted text-right font-semibold" key={key}>
                {key}
              </div>
              <div>{value}</div>
            </>
          ))}

          {result.error && (
            <>
              <div className="text-muted text-right font-semibold">Error</div>
              <div>{result.error}</div>
            </>
          )}

          {result.requestTiming && (
            <>
              <div className="text-muted text-right font-semibold">
                Total Fetch Duration
              </div>
              <div>{result.requestTiming.totalDurationMs.toFixed(2)} ms</div>

              <div className="text-muted text-right font-semibold">
                DNS Lookup Duration
              </div>
              <div>
                {result.requestTiming.dnsLookupDurationMs.toFixed(2)} ms
              </div>

              <div className="text-muted text-right font-semibold">
                Connect Duration
              </div>
              <div>
                {`${result.requestTiming.connectionEstablishmentDurationMs.toFixed(
                  2,
                )} ms (TLS negotiation: ${result.requestTiming.tlsNegotiationDurationMs.toFixed(
                  2,
                )} ms)`}
              </div>

              <div className="text-muted text-right font-semibold">
                Request Duration
              </div>
              <div>{result.requestTiming.requestDurationMs.toFixed(2)} ms</div>
            </>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
