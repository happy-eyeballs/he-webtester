import React from "react";
import { cn } from "@/lib/utils.ts";
import { TestResultBadge } from "@/components/test-result-badge.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import type { TestRun } from "@/lib/test-run.ts";
import { CloudUploadIcon, ShuffleIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

type Props = {
  columnDescription: string;
  columns: string[];
  testRuns: TestRun[];
};

export const TestResultTable: React.FC<Props> = ({
  columnDescription,
  columns,
  testRuns,
}) => {
  return (
    <div className="relative">
      <div className="overflow-x-auto pb-5">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left whitespace-nowrap px-5 pt-5 border-r w-30">
                Test Run #
              </th>
              <th className="text-left whitespace-nowrap px-5 pt-5 border-r w-50">
                Started At
              </th>
              <th
                className="text-left whitespace-nowrap px-5 pt-5 pb-2"
                colSpan={columns.length}
              >
                {columnDescription}
              </th>
            </tr>
            <tr>
              <th className="border-r" />
              <th className="border-r" />
              {columns.map((column, index) => (
                <th
                  key={column}
                  className={cn(
                    "text-left p-5 [writing-mode:vertical-lr]",
                    index < columns.length - 1 && "border-r",
                  )}
                >
                  <div className="whitespace-nowrap rotate-180">{column}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {testRuns.flatMap((testRun, testRunNumber) =>
              testRun.repetitions.map((repetition) => (
                <tr
                  key={`${testRun.testRunId}|${repetition.repetitionNumber}`}
                  className="border-t"
                >
                  <td className="whitespace-nowrap px-5 border-r">
                    <div className="flex gap-4 items-center font-bold">
                      <Tooltip>
                        <TooltipTrigger>
                          {testRun.settings.repetitions
                            ? `#${testRunNumber} (${repetition.repetitionNumber} / ${testRun.settings.repetitions})`
                            : `#${testRunNumber}`}
                        </TooltipTrigger>
                        <TooltipContent>
                          <b>ID:</b> {testRun.testRunId}
                        </TooltipContent>
                      </Tooltip>

                      {testRun.settings.randomizeDomains && (
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="size-7 bg-secondary text-secondary-foreground grid place-items-center rounded-md">
                              <ShuffleIcon className="size-3.5" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Randomized domains</TooltipContent>
                        </Tooltip>
                      )}

                      {testRun.isTransmitted && (
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="size-7 bg-secondary text-secondary-foreground grid place-items-center rounded-md">
                              <CloudUploadIcon className="size-3.5" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Transmitted</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 border-r">
                    {repetition.startedAt.toLocaleString()}
                  </td>

                  {repetition.subtests.map((subtest, index) => (
                    <td
                      key={index}
                      className={cn(
                        "px-5 py-3",
                        index < columns.length - 1 && "border-r",
                      )}
                    >
                      {subtest.result ? (
                        <TestResultBadge result={subtest.result} />
                      ) : subtest.isRunning ? (
                        <Spinner />
                      ) : (
                        <></>
                      )}
                    </td>
                    // <td
                    //   key={index}
                    //   className={cn(index < columns.length - 1 && "border-r")}
                    // >
                    //   <div
                    //     style={{ background: result.color }}
                    //     className="px-5 py-3 text-white"
                    //   >
                    //     {result.label}
                    //   </div>
                    // </td>
                  ))}
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
