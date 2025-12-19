import { checkIfIPv4AndIPv6AreAvailable } from "@/lib/client-ip-address.ts";
import { transmitResults } from "@/lib/transmit-results.ts";
import { generateRandomId, sleep } from "@/lib/test-utils.ts";

export const executeTestRun = async (
  settings: TestSettings,
  resultsUrl: string,
  buildTestParts: (settings: TestSettings) => Promise<TestPart[]>,
  addTestRunToTable: (testRun: TestRun) => void,
  setStatusMessage: (message: string) => void,
  forceTableRerender: () => void,
) => {
  setStatusMessage("Checking if IPv4 and IPv6 are available...");
  await checkIfIPv4AndIPv6AreAvailable();

  const testRun: TestRun = {
    testRunId: generateRandomId(),
    settings,
    isTransmitted: false,
    repetitions: [],
  };
  addTestRunToTable(testRun);

  for (
    let repetition = 1;
    repetition <= (settings.repetitions ?? 1);
    repetition++
  ) {
    setStatusMessage(
      settings.repetitions
        ? `Running test repetition ${repetition} / ${settings.repetitions}...`
        : `Running test...`,
    );

    const parts = await buildTestParts(settings);

    testRun.repetitions.push({
      repetitionNumber: repetition,
      startedAt: new Date(),
      parts,
    } satisfies TestRunRepetition);

    for (const part of parts) {
      for (const subtest of part.subtests) {
        subtest.isRunning = true;
        forceTableRerender();

        subtest.result = await executeTestUrl(subtest.url).catch(
          (error: Error) =>
            ({
              value: SubtestResultValue.Error,
              url: subtest.url,
              error: error.message,
            }) satisfies SubtestResult,
        );

        subtest.isRunning = false;
        forceTableRerender();
      }

      if (repetition < (settings.repetitions ?? 1)) {
        setStatusMessage(
          `Waiting for 5 seconds before starting the next repetition...`,
        );
        await sleep(5000);
      }
    }
  }

  if (settings.autoTransmitResults) {
    setStatusMessage("Transmitting results...");

    await transmitResults(resultsUrl, [testRun]);
    forceTableRerender();
  }
};

const executeTestUrl = async (url: string): Promise<SubtestResult> => {
  const observer = observeRequestTiming(url);

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Response has non-200 status code: ${response.status}`);
  }

  const clientIP = await response.text();
  const isIPv6 = clientIP.includes(":");

  const requestDurationMs = await observer;

  return {
    value: isIPv6 ? SubtestResultValue.IPv6 : SubtestResultValue.IPv4,
    url,
    requestDurationMs,
  } satisfies SubtestResult;
};

const observeRequestTiming = (url: string): Promise<number> =>
  new Promise((resolve) => {
    const observer = new PerformanceObserver((list, observer) => {
      const entries = list.getEntriesByType("resource");

      const entry = entries.find((entry) => entry.name === url);
      if (entry && entry instanceof PerformanceResourceTiming) {
        resolve(entry.duration);
        observer.disconnect();
      }
    });

    observer.observe({ type: "resource", buffered: false });
  });

export type TestSettings = {
  repetitions: number | undefined;
  autoTransmitResults: boolean | undefined;
  randomizeDomains: boolean | undefined;
  resolverAddresses: string | undefined;
  deviceInfo: string | undefined;
};

export type TestRun = {
  testRunId: number;
  settings: TestSettings;
  isTransmitted: boolean;
  repetitions: TestRunRepetition[];
};

type TestRunRepetition = {
  repetitionNumber: number;
  startedAt: Date;
  parts: TestPart[];
};

export type TestPart = {
  name?: string;
  subtests: Subtest[];
};

export type Subtest = {
  url: string;
  isRunning?: boolean;
  result?: SubtestResult;
};

export type SubtestResult = {
  value: SubtestResultValue;
  url: string;
  requestDurationMs?: number;
  error?: string;
};

export const enum SubtestResultValue {
  Error = "ERR",
  IPv4 = "IPv4",
  IPv6 = "IPv6",
}
