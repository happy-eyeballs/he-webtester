import type { TestRun } from "@/lib/test-run.ts";

export const transmitResults = async (
  url: string,
  testRuns: TestRun[],
): Promise<void> => {
  const results = mapTestRunsToResults(
    testRuns.filter((testRun) => !testRun.isTransmitted),
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(results),
  });

  if (!response.ok) {
    throw new Error(`Failed to transmit the results`);
  }

  for (const testRun of testRuns) {
    testRun.isTransmitted = true;
  }
};

export const downloadResults = async (
  testName: string,
  testRuns: TestRun[],
): Promise<void> => {
  downloadJSONData(
    `${testName}-${Math.floor(Date.now() / 1000)}.json`,
    JSON.stringify(mapTestRunsToResults(testRuns)),
  );
};

const mapTestRunsToResults = (testRuns: TestRun[]) => {
  return testRuns.flatMap((testRun) =>
    testRun.repetitions.map((testRunRepetition) => ({
      id: testRun.testRunId,
      runCount: testRunRepetition.repetitionNumber,
      timestampStart: testRunRepetition.startedAt,
      settings: testRun.settings,
      results: testRunRepetition.parts.reduce(
        (result, testPart) => ({
          ...result,
          [testPart.name ?? ""]: testPart.subtests.map(
            (subtest) => subtest.result,
          ),
        }),
        {},
      ),
      platform: window.navigator.platform,
      vendor: window.navigator.vendor,
      userAgent: window.navigator.userAgent,
    })),
  );
};

const downloadJSONData = (fileName: string, data: string) => {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link); // Required for Firefox
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
