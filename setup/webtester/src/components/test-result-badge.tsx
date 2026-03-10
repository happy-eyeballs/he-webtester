import React, { useState } from "react";
import { type SubtestResult } from "@/lib/test-run.ts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

type Props = {
  result: SubtestResult;
  testRunMetadata?: { key: string; value: string }[];
};

export const TestResultBadge: React.FC<Props> = ({
  result,
  testRunMetadata,
}) => {
  const [isTooltipOpen, setTooltipOpen] = useState(false);

  return (
    <Tooltip open={isTooltipOpen} onOpenChange={setTooltipOpen}>
      <TooltipTrigger asChild={true}>
        <div
          style={{
            background: result.color,
          }}
          className="w-max px-4 py-1 rounded-full text-white"
          onClick={(event) => {
            event.preventDefault();
            setTooltipOpen((open) => !open);
          }}
        >
          {result.value}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <ResultBadgeTooltipContent
          result={result}
          testRunMetadata={testRunMetadata ?? []}
        />
      </TooltipContent>
    </Tooltip>
  );
};

const ResultBadgeTooltipContent: React.FC<Props> = ({
  result,
  testRunMetadata,
}) => {
  return (
    <>
      <KeyValueTable>
        <KeyValueTableRow name="URL">
          <a
            href={result.url}
            className="underline underline-offset-4 cursor-pointer hover:opacity-80"
          >
            {result.url}
          </a>
        </KeyValueTableRow>

        {testRunMetadata?.map(({ key, value }) => (
          <KeyValueTableRow name={key} key={key}>
            {value}
          </KeyValueTableRow>
        ))}

        {result.error && (
          <KeyValueTableRow name="Error">{result.error}</KeyValueTableRow>
        )}
      </KeyValueTable>

      {result.additionalMetadata && (
        <KeyValueTable>
          {Object.entries(result.additionalMetadata).map(([key, value]) => (
            <KeyValueTableRow name={key} key={key}>
              {value}
            </KeyValueTableRow>
          ))}
        </KeyValueTable>
      )}

      {result.requestTiming && (
        <KeyValueTable>
          <KeyValueTableRow name="Total Fetch Duration">
            {result.requestTiming.totalDurationMs.toFixed(2)} ms
          </KeyValueTableRow>

          <KeyValueTableRow name="DNS Lookup Duration">
            {result.requestTiming.dnsLookupDurationMs.toFixed(2)} ms
          </KeyValueTableRow>

          <KeyValueTableRow name="Connect Duration">
            {`${result.requestTiming.connectionEstablishmentDurationMs.toFixed(
              2,
            )} ms (TLS negotiation: ${result.requestTiming.tlsNegotiationDurationMs.toFixed(
              2,
            )} ms)`}
          </KeyValueTableRow>

          <KeyValueTableRow name="Request Duration">
            {result.requestTiming.requestDurationMs.toFixed(2)} ms
          </KeyValueTableRow>
        </KeyValueTable>
      )}
    </>
  );
};

const KeyValueTable: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="grid grid-cols-[minmax(11em,auto)_1fr] gap-x-4 gap-y-1.5 p-2">
      {children}
    </div>
  );
};

const KeyValueTableRow: React.FC<{
  name: string;
  children?: React.ReactNode | string;
}> = ({ name, children }) => {
  return (
    <>
      <div className="text-muted text-right font-semibold">{name}</div>
      <div>{children}</div>
    </>
  );
};
