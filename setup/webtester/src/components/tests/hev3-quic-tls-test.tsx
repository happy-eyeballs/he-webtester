import React, { useEffect, useState } from "react";
import {
  type ResponseHandlerResult,
  type Subtest,
  type TestPart,
  TestRunResultColor,
  type TestSettings,
} from "@/lib/test-run.ts";
import { TestSkeleton } from "@/components/test-skeleton.tsx";
import {
  getHappyEyeballsTestDomain,
  fetchAvailableDelays,
} from "@/lib/he-configuration.ts";
import { generateRandomId } from "@/lib/test-utils";

export const HEv3QuicTlsTest: React.FC = () => {
  const [availableDelays, setAvailableDelays] = useState<number[]>([]);

  useEffect(() => {
    const setup = async () => {
      setAvailableDelays((await fetchAvailableDelays()).v3_quic_delays);
    };

    setup();
  }, []);

  const responseHandler = async (
    response: Response,
  ): Promise<ResponseHandlerResult> => {
    const { protocol } = (await response.json()) as {
      protocol: string;
    };

    const isHTTP3 = protocol === "HTTP/3.0";

    return {
      value: protocol,
      color: isHTTP3 ? TestRunResultColor.Option1 : TestRunResultColor.Option2,
    };
  };

  const buildSubtests = async (settings: TestSettings): Promise<TestPart[]> => {
    const testParts: TestPart[] = [];

    for (const part of [
      {
        name: "Delay QUIC",
        protocol: "quic" as const,
      },
      {
        name: "Delay TLS",
        protocol: "tls" as const,
      },
    ]) {
      const subtests: Subtest[] = [];

      for (let i = 0; i < availableDelays.length; i++) {
        const url = await generateQuicTlsDelayUrl(
          settings.randomizeDomains ?? false,
          availableDelays[i] ?? 0,
          part.protocol,
        );

        subtests.push({ url, responseHandler } satisfies Subtest);
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
        deviceInfo: true,
      }}
      resultsUrl="/results/hev3-quic-tls" // TODO
      subtestColumnDescription="Delay before initial read on connection [ms]"
      subtestColumnLabels={availableDelays.map((delay) => delay.toString())}
    />
  );
};

export const generateQuicTlsDelayUrl = async (
  randomizeDomain: boolean,
  delay: number,
  protocol: "quic" | "tls",
): Promise<string> => {
  const happyEyeballsTestDomain = await getHappyEyeballsTestDomain();

  const id = randomizeDomain ? generateRandomId() : 0;

  return `https://id-${id}.${protocol}-delay-${delay}.v3-quic.${happyEyeballsTestDomain}/ping`;
};
