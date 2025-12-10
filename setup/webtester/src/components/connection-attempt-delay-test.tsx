import React, { useEffect, useState } from "react";
import { TestSettingsSection } from "@/components/test-settings-section.tsx";
import {
  type TestRunRepetition,
  type SubtestResult,
  SubtestResultValue,
  type Subtest,
  type TestRun,
  type TestSettings,
} from "@/lib/test-run.ts";
import { TestResultTable } from "@/components/test-result-table.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";

export const ConnectionAttemptDelayTest: React.FC = () => {
  const [availableDelays, setAvailableDelays] = useState<number[]>([]);
  const [happyEyeballsTestDomain, setHappyEyeballsTestDomain] =
    useState<string>("");
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);

  useEffect(() => {
    const setup = async () => {
      setAvailableDelays(await fetchAvailableDelays());
      setHappyEyeballsTestDomain(await fetchHappyEyeballsTestDomain());
    };

    setup();
  }, []);

  const fetchAvailableDelays = async (): Promise<number[]> => {
    const response = await fetch("/delays.csv", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to fetch the available delays");
    }

    const responseBody = await response.text();

    return responseBody
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => Number(line.trim()));

    // TODO: pop last two delays in if not v2 test
  };

  const fetchHappyEyeballsTestDomain = async (): Promise<string> => {
    const response = await fetch("/he-test-domain", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to fetch the Happy Eyeballs test domain");
    }

    return (await response.text()).trim();
  };

  const getClientIPAddress = async (ipVersion: 4 | 6): Promise<string> => {
    const response = await fetch(
      `https://ipv${ipVersion}-only.v1.${happyEyeballsTestDomain}/my-ip`,
      { cache: "no-cache" },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch the client ${ipVersion} address`);
    }

    return (await response.text()).trim();
  };

  const checkIfIPv4AndIPv6AreAvailable = async (): Promise<void> => {
    await getClientIPAddress(4).catch((_) => {
      throw new Error("No IPv4 address available");
    });

    await getClientIPAddress(6).catch((_) => {
      throw new Error("No IPv6 address available");
    });
  };

  const generateRandomId = (): number => {
    const max = 100000;
    const min = 0;

    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const forceTableRerender = () => setTestRuns((prev) => [...prev]);

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

  const runSubtest = async (subtest: Subtest): Promise<void> => {
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
  };

  const buildSubtests = (randomizeDomains: boolean): Subtest[] => {
    const subtests: Subtest[] = [];

    for (let i = 0; i < availableDelays.length; i++) {
      const id = randomizeDomains ? generateRandomId() : i;
      const delay = availableDelays[i] ?? 0;
      const url = `https://id-${id}.delay-${delay}.v1.${happyEyeballsTestDomain}/ping`;

      subtests.push({ url } satisfies Subtest);
    }

    return subtests;
  };

  const startTestRun = async (settings: TestSettings) => {
    if (availableDelays.length === 0) {
      alert("Delay list is not available");
      return;
    }

    if (!happyEyeballsTestDomain) {
      alert("Happy Eyeballs tests domain is not available");
      return;
    }

    try {
      setStatusMessage("Checking if IPv4 and IPv6 are available...");
      await checkIfIPv4AndIPv6AreAvailable();
    } catch (err) {
      alert(err);
      return;
    }

    setIsTestRunning(true);

    const testRun: TestRun = {
      testRunNumber: testRuns.length + 1,
      repetitions: [],
      settings,
    };
    setTestRuns((prev) => [...prev, testRun]);

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

      const subtests = buildSubtests(settings.randomizeDomains ?? false);

      testRun.repetitions.push({
        repetitionNumber: repetition,
        startedAt: new Date(),
        subtests,
      } satisfies TestRunRepetition);

      for (const subtest of subtests) {
        await runSubtest(subtest);
      }

      if (repetition < (settings.repetitions ?? 1)) {
        setStatusMessage(
          `Waiting for 5 seconds before starting the next repetition...`,
        );
        await sleep(5000);
      }
    }

    // TODO: transmit results

    setIsTestRunning(false);
    setStatusMessage("");
  };

  const statusWidget = isTestRunning ? (
    <div className="flex items-center gap-2">
      <Spinner />
      {statusMessage && <div className="text-sm">{statusMessage}</div>}
    </div>
  ) : undefined;

  return (
    <div>
      <TestSettingsSection
        enabledSettings={{
          repetitions: {
            options: [1, 5, 10, 20, 30, 40, 50],
            defaultOption: 10,
          },
          autoTransmitResults: true,
          randomizeDomains: true,
          deviceInfo: true,
        }}
        onStartTestRun={startTestRun}
        disabled={isTestRunning}
        statusWidget={statusWidget}
      />

      <div className="mb-10" />

      <TestResultTable
        columnDescription="IPv6 Delay [ms]"
        columns={availableDelays.map((delay) => delay.toString())}
        testRuns={testRuns}
      />
    </div>
  );
};
