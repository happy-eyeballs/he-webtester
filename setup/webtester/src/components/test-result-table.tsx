import React from "react";
import { cn } from "@/lib/utils.ts";
import { TestResultBadge } from "@/components/test-result-badge.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import type { TestRun } from "@/lib/test-run.ts";
import { ShuffleIcon } from "lucide-react";
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
                    "content-start p-5",
                    index < columns.length - 1 && "border-r",
                  )}
                >
                  <div className="whitespace-nowrap [writing-mode:vertical-lr] rotate-180">
                    {column}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {testRuns.flatMap((testRun) =>
              testRun.repetitions.map((repetition) => (
                <tr
                  key={`${testRun.testRunNumber}|${repetition.repetitionNumber}`}
                  className="border-t"
                >
                  <td className="whitespace-nowrap px-5 border-r">
                    <div className="flex gap-4 items-center">
                      <div>
                        {testRun.settings.repetitions
                          ? `#${testRun.testRunNumber} (${repetition.repetitionNumber} / ${testRun.settings.repetitions})`
                          : `#${testRun.testRunNumber}`}
                      </div>

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
