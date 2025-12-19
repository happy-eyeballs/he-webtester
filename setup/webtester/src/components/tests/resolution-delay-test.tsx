import React, { useEffect, useState } from "react";
import {
  type Subtest,
  type TestPart,
  type TestSettings,
} from "@/lib/test-run.ts";
import { HETest } from "@/components/he-test.tsx";
import {
  getHappyEyeballsTestDomain,
  fetchAvailableDelays,
} from "@/lib/he-configuration.ts";
import { generateRandomId } from "@/lib/test-utils";

export const ResolutionDelayTest: React.FC = () => {
  const [availableDelays, setAvailableDelays] = useState<number[]>([]);

  useEffect(() => {
    const setup = async () => {
      setAvailableDelays(await fetchAvailableDelays());
    };

    setup();
  }, []);

  const buildSubtests = async (settings: TestSettings): Promise<TestPart[]> => {
    const happyEyeballsTestDomain = await getHappyEyeballsTestDomain();

    const testParts: TestPart[] = [];

    for (const part of [
      { name: "Delay A", recordType: "a" },
      { name: "Delay AAAA", recordType: "aaaa" },
    ]) {
      const subtests: Subtest[] = [];

      for (let i = 0; i < availableDelays.length; i++) {
        const id = settings.randomizeDomains ? generateRandomId() : i;
        const delay = availableDelays[i] ?? 0;
        const url = `https://v2delay_${part.recordType}-${id}_${delay}.v2.${happyEyeballsTestDomain}/ping`;

        subtests.push({ url } satisfies Subtest);
      }

      testParts.push({ name: part.name, subtests } satisfies TestPart);
    }

    return testParts;
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
        resolverAddresses: true,
        deviceInfo: true,
      }}
      testName="ip-v2"
      resultsUrl="/results/v2"
      subtestColumnDescription="IPv6 Delay [ms]"
      subtestColumnLabels={availableDelays.map((delay) => delay.toString())}
    />
  );
};
