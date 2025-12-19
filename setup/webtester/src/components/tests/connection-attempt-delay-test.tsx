import React, { useEffect, useState } from "react";
import { type Subtest, type TestSettings } from "@/lib/test-run.ts";
import { HETest } from "@/components/he-test.tsx";
import { getHappyEyeballsTestDomain } from "@/lib/he-tests-domain.ts";

export const ConnectionAttemptDelayTest: React.FC = () => {
  const [availableDelays, setAvailableDelays] = useState<number[]>([]);

  useEffect(() => {
    const setup = async () => {
      setAvailableDelays(await fetchAvailableDelays());
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

  const buildSubtests = async (settings: TestSettings): Promise<Subtest[]> => {
    const happyEyeballsTestDomain = await getHappyEyeballsTestDomain();

    const subtests: Subtest[] = [];

    for (let i = 0; i < availableDelays.length; i++) {
      const id = settings.randomizeDomains ? generateRandomId() : i;
      const delay = availableDelays[i] ?? 0;
      const url = `https://id-${id}.delay-${delay}.v1.${happyEyeballsTestDomain}/ping`;

      subtests.push({ url } satisfies Subtest);
    }

    return subtests;
  };

  return (
    <HETest
      buildSubtests={buildSubtests}
      enabledSettings={{
        repetitions: {
          options: [1, 5, 10, 20, 30, 40, 50],
          defaultOption: 10,
        },
        autoTransmitResults: true,
        randomizeDomains: true,
        deviceInfo: true,
      }}
      testName="ip-v1"
      resultsUrl="/results/v1"
      subtestColumnDescription="IPv6 Delay [ms]"
      subtestColumnLabels={availableDelays.map((delay) => delay.toString())}
    />
  );
};
