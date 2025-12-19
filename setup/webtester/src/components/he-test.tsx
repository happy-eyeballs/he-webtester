import React, { useState } from "react";
import {
  type EnabledTestSettings,
  TestSettingsSection,
} from "@/components/test-settings-section.tsx";
import {
  type Subtest,
  type TestRun,
  type TestSettings,
  executeTestRun,
} from "@/lib/test-run.ts";
import { TestResultTable } from "@/components/test-result-table.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { Button } from "@/components/ui/button.tsx";
import { downloadResults, transmitResults } from "@/lib/transmit-results.ts";

type Props = {
  buildSubtests: (settings: TestSettings) => Promise<Subtest[]>;
  enabledSettings: EnabledTestSettings;
  testName: string;
  resultsUrl: string;
  subtestColumnDescription: string;
  subtestColumnLabels: string[];
};

export const HETest: React.FC<Props> = ({
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
            <Button
              variant="default"
              disabled={
                isUserInteractionDisabled ||
                !testRuns.some((testRun) => !testRun.isTransmitted)
              }
              onClick={transmitTestResults}
            >
              Transmit results
            </Button>

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
