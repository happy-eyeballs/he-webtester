import React from "react";
import { type SubtestResult } from "@/lib/test-run.ts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

type Props = {
  result: SubtestResult;
};

export const TestResultBadge: React.FC<Props> = ({ result }) => {
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
            className="text-accent-muted dark:text-accent hover:underline underline-offset-3 cursor-pointer"
          >
            {result.url}
          </a>

          {result.requestDurationMs && (
            <>
              <div className="text-muted text-right font-semibold">
                Request Duration
              </div>
              <div>{result.requestDurationMs.toFixed(2)} ms</div>
            </>
          )}

          {result.error && (
            <>
              <div className="text-muted text-right font-semibold">Error</div>
              <div>{result.error}</div>
            </>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
