import React, { useState } from "react";
import {
  type EnabledTestSettings,
  TestSettingsSection,
} from "@/components/test-settings-section.tsx";
import {
  type TestRun,
  type TestSettings,
  type TestPart,
  executeTestRun,
} from "@/lib/test-run.ts";
import { TestResultTable } from "@/components/test-result-table.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { Button } from "@/components/ui/button.tsx";
import { downloadResults, transmitResults } from "@/lib/transmit-results.ts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

type Props = {
  buildSubtests: (settings: TestSettings) => Promise<TestPart[]>;
  enabledSettings: EnabledTestSettings;
  testName: string;
  resultsUrl: string;
  subtestColumnDescription: string;
  subtestColumnLabels: string[];
};

export const TestSkeleton: React.FC<Props> = ({
  buildSubtests,
  enabledSettings,
  testName,
  resultsUrl,
  subtestColumnDescription,
  subtestColumnLabels,
}) => {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);

  const [isUserInteractionDisabled, setIsUserInteractionDisabled] =
    useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const forceTableRerender = () => setTestRuns((prev) => [...prev]);

  const withDisabledUserInteraction = async (fn: () => Promise<void>) => {
    try {
      setIsUserInteractionDisabled(true);
      setStatusMessage("");
      await fn();
    } catch (err) {
      alert(err);
    } finally {
      setStatusMessage("");
      setIsUserInteractionDisabled(false);
    }
  };

  const executeTest = (settings: TestSettings) =>
    withDisabledUserInteraction(async () => {
      await executeTestRun(
        settings,
        resultsUrl,
        buildSubtests,
        (testRun) => setTestRuns((prev) => [...prev, testRun]),
        setStatusMessage,
        forceTableRerender,
      );
    });

  const transmitTestResults = () =>
    withDisabledUserInteraction(async () => {
      setStatusMessage("Transmitting results...");

      await transmitResults(resultsUrl, testRuns);
      forceTableRerender();
    });

  const statusWidget = isUserInteractionDisabled ? (
    <div className="flex items-center gap-2">
      <Spinner />
      {statusMessage && <div className="text-sm">{statusMessage}</div>}
    </div>
  ) : undefined;

  const allTestRunsTransmitted = testRuns.every(
    (testRun) => testRun.isTransmitted,
  );

  return (
    <div>
      <TestSettingsSection
        enabledSettings={enabledSettings}
        onStartTestRun={executeTest}
        disabled={isUserInteractionDisabled}
        statusWidget={statusWidget}
      />

      {testRuns.length > 0 && (
        <>
          <div className="mb-10" />

          <TestResultTable
            columnDescription={subtestColumnDescription}
            columns={subtestColumnLabels}
            testRuns={testRuns}
          />

          <div className="mt-8 flex gap-4 items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  disabled={isUserInteractionDisabled || allTestRunsTransmitted}
                  onClick={transmitTestResults}
                >
                  Transmit results
                </Button>
              </TooltipTrigger>

              {isUserInteractionDisabled ? (
                <TooltipContent className="max-w-md">
                  Please wait until all test repetitions have finished
                  executing...
                </TooltipContent>
              ) : allTestRunsTransmitted ? (
                <TooltipContent className="max-w-md">
                  All test runs have been successfully transmitted. Thank you
                  for your help!
                </TooltipContent>
              ) : (
                <TooltipContent className="max-w-md">
                  If you want to help us interpret the results, you can describe
                  your network environment as part of the device and the user
                  information input field.
                </TooltipContent>
              )}
            </Tooltip>

            <Button
              variant="secondary"
              disabled={isUserInteractionDisabled}
              onClick={() => downloadResults(testName, testRuns)}
            >
              Download results
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
