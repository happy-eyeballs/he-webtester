import React, { useEffect, useState } from "react";
import {
  type Subtest,
  type TestPart,
  type TestSettings,
} from "@/lib/test-run.ts";
import { TestSkeleton } from "@/components/test-skeleton.tsx";
import {
  getHappyEyeballsTestDomain,
  fetchAvailableDelays,
} from "@/lib/he-configuration.ts";
import { generateRandomId } from "@/lib/test-utils.ts";

export const ConnectionAttemptDelayTest: React.FC = () => {
  const [availableDelays, setAvailableDelays] = useState<number[]>([]);

  useEffect(() => {
    const setup = async () => {
      setAvailableDelays(await fetchAvailableDelays());
    };

    setup();
  }, []);

  const buildSubtests = async (settings: TestSettings): Promise<TestPart[]> => {
    const happyEyeballsTestDomain = await getHappyEyeballsTestDomain();

    const subtests: Subtest[] = [];

    for (let i = 0; i < availableDelays.length; i++) {
      const id = settings.randomizeDomains ? generateRandomId() : i;
      const delay = availableDelays[i] ?? 0;
      const url = `https://id-${id}.delay-${delay}.v1.${happyEyeballsTestDomain}/ping`;

      subtests.push({ url } satisfies Subtest);
    }

    return [{ subtests }];
  };

  return (
    <TestSkeleton
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
