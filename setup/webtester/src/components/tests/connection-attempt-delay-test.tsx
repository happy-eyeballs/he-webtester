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
    const subtests: Subtest[] = [];

    for (let i = 0; i < availableDelays.length; i++) {
      const url = await generateConnectAttemptDelayUrl(
        settings.randomizeDomains ?? false,
        availableDelays[i] ?? 0,
      );

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
      resultsUrl="/results/connection-attempt-delay"
      subtestColumnDescription="IPv6 Delay [ms]"
      subtestColumnLabels={availableDelays.map((delay) => delay.toString())}
    />
  );
};

export const generateConnectAttemptDelayUrl = async (
  randomizeDomain: boolean,
  delay: number,
): Promise<string> => {
  const happyEyeballsTestDomain = await getHappyEyeballsTestDomain();

  if (randomizeDomain) {
    return `https://id-${generateRandomId()}.delay-${delay}.v1.${happyEyeballsTestDomain}/ping`;
  }

  return `https://delay-${delay}.v1.${happyEyeballsTestDomain}/ping`;
};
