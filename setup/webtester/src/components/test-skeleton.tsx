import React, { useState } from "react";
import { TestSettingsSection } from "@/components/settings/test-settings-section.tsx";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import type { EnabledTestSettings } from "@/lib/settings.ts";

type Props = {
  enabledSettings: EnabledTestSettings;
  settings: TestSettings;
  setSettings: (settings: TestSettings) => void;
  buildSubtests: () => Promise<TestPart[]>;
  resultsUrl: string;
  subtestColumnDescription: string;
  subtestColumnLabels: string[];
  subtestRowDescription?: string;
};

export const TestSkeleton: React.FC<Props> = ({
  buildSubtests,
  enabledSettings,
  settings,
  setSettings,
  resultsUrl,
  subtestColumnDescription,
  subtestRowDescription,
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

  const executeTest = () =>
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

  const allTestRunsTransmitted = testRuns.every(
    (testRun) => testRun.isTransmitted,
  );

  return (
    <div className="py-10 flex flex-col gap-y-10">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <TestSettingsSection
            enabledSettings={enabledSettings}
            settings={settings}
            setSettings={setSettings}
            startTestRun={executeTest}
            disabled={isUserInteractionDisabled}
          />
        </CardContent>
      </Card>

      {isUserInteractionDisabled && (
        <Alert className="dark">
          <Spinner />
          <AlertTitle>Test is running</AlertTitle>
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}

      {testRuns.length > 0 && (
        <>
          <TestResultTable
            columnDescription={subtestColumnDescription}
            columns={subtestColumnLabels}
            testPartDescription={subtestRowDescription}
            testRuns={testRuns}
          />

          <div className="flex gap-4 items-center">
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
                  Please wait until all test repetitions have finished executing
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
              onClick={() => downloadResults(testRuns)}
            >
              Download results
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
