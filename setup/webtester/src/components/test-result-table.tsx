import React from "react";
import { cn } from "@/lib/utils.ts";

export type TestRunResultItem = {
  label: string;
  color: string;
};

export type TestRunResult = {
  testRunId: string;
  startedAt: Date;
  results: TestRunResultItem[];
};

type Props = {
  columnDescription: string;
  columns: string[];
  rows: TestRunResult[];
};

export const TestResultTable: React.FC<Props> = ({
  columnDescription,
  columns,
  rows,
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
            {rows.map((row) => (
              <tr key={row.testRunId} className="border-t">
                <td className="whitespace-nowrap px-5 border-r">
                  #{row.testRunId}
                </td>
                <td className="whitespace-nowrap px-5 border-r">
                  {row.startedAt.toLocaleString()}
                </td>

                {row.results.map((result, index) => (
                  <td
                    key={index}
                    className={cn(
                      "px-5 py-3",
                      index < columns.length - 1 && "border-r",
                    )}
                  >
                    <div
                      style={{ background: result.color }}
                      className="w-max px-4 py-1 rounded-full text-white"
                    >
                      {result.label}
                    </div>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
