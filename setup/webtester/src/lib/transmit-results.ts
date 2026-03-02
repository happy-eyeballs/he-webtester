import type { TestRun } from "@/lib/test-run.ts";
import { downloadJSONData } from "@/lib/test-utils.ts";

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

export const downloadResults = async (testRuns: TestRun[]): Promise<void> => {
  downloadJSONData(
    `${Math.floor(Date.now() / 1000)}.json`,
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
      results:
        testRunRepetition.parts.length === 1
          ? testRunRepetition.parts[0]?.subtests.map(
              (subtest) => subtest.results,
            )
          : testRunRepetition.parts.reduce(
              (result, testPart, testPartIndex) => ({
                ...result,
                [testPart.name ?? `${testPartIndex}`]: testPart.subtests.map(
                  (subtest) => subtest.results,
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
