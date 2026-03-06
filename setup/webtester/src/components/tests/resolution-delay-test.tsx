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
    const testParts: TestPart[] = [];

    for (const part of [
      { name: "Delay A", dnsRecordType: "a" as const },
      { name: "Delay AAAA", dnsRecordType: "aaaa" as const },
    ]) {
      const subtests: Subtest[] = [];

      for (let i = 0; i < availableDelays.length; i++) {
        const url = await generateResolutionDelayUrl(
          settings.randomizeDomains ?? false,
          availableDelays[i] ?? 0,
          part.dnsRecordType,
        );

        subtests.push({ url } satisfies Subtest);
      }

      testParts.push({ name: part.name, subtests } satisfies TestPart);
    }

    return testParts;
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
        resolverAddresses: true,
        deviceInfo: true,
      }}
      resultsUrl="/results/resolution-delay"
      subtestColumnDescription="IPv6 Delay [ms]"
      subtestColumnLabels={availableDelays.map((delay) => delay.toString())}
    />
  );
};

export const generateResolutionDelayUrl = async (
  randomizeDomain: boolean,
  dnsDelay: number,
  dnsRecordType: "a" | "aaaa",
): Promise<string> => {
  const happyEyeballsTestDomain = await getHappyEyeballsTestDomain();

  const id = randomizeDomain ? generateRandomId() : 0;

  return `https://v2delay_${dnsRecordType}-${id}_${dnsDelay}.v2.${happyEyeballsTestDomain}/ping`;
};
