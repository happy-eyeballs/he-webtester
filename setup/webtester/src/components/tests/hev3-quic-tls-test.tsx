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
    const { protocol, server_ip } = (await response.json()) as {
      protocol: string;
      server_ip: string;
    };

    const isHTTP3 = protocol === "HTTP/3.0";

    return {
      value: isHTTP3 ? "QUIC" : "TLS",
      color: isHTTP3 ? TestRunResultColor.Option1 : TestRunResultColor.Option2,
      metadata: {
        Protocol: protocol,
        "Address Family": server_ip.includes(":") ? "IPv6" : "IPv4",
      },
    } satisfies ResponseHandlerResult;
  };

  const buildSubtests = async (settings: TestSettings): Promise<TestPart[]> => {
    const testParts: TestPart[] = [];

    for (const part of [
      {
        name: "Delay QUIC",
        protocol: Protocol.QUIC,
      },
      {
        name: "Delay TLS/TCP",
        protocol: Protocol.TLS,
      },
    ]) {
      const subtests: Subtest[] = [];

      for (let i = 0; i < availableDelays.length; i++) {
        const url = await generateQuicTlsDelayUrl(
          settings.randomizeDomains ?? false,
          availableDelays[i] ?? 0,
          part.protocol,
          (settings.httpsRecord as HTTPSRecord) ?? HTTPSRecord.H3H2,
        );

        subtests.push({
          url,
          responseHandler,
          sleepAfterSubtest: 2000,
        } satisfies Subtest);
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
        httpsRecord: {
          options: [
            HTTPSRecord.H3H2,
            HTTPSRecord.H2H3,
            HTTPSRecord.H3,
            HTTPSRecord.H2,
            HTTPSRecord.None,
          ],
          defaultOption: HTTPSRecord.H3H2,
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
  protocol: Protocol,
  httpsRecord: HTTPSRecord,
): Promise<string> => {
  const happyEyeballsTestDomain = await getHappyEyeballsTestDomain();

  const id = randomizeDomain ? generateRandomId() : 0;

  const httpsRR: string = {
    [HTTPSRecord.H3H2]: "h3h2",
    [HTTPSRecord.H2H3]: "h2h3",
    [HTTPSRecord.H3]: "h3",
    [HTTPSRecord.H2]: "h2",
    [HTTPSRecord.None]: "none",
  }[httpsRecord];

  const quicDelay = protocol === Protocol.QUIC ? delay : 0;
  const tlsDelay = protocol === Protocol.TLS ? delay : 0;

  return `https://https-${httpsRR}_ipv4-0_ipv6-0_quic-${quicDelay}_tls-${tlsDelay}_id-${id}.v3-quic.${happyEyeballsTestDomain}/ping`;
};

const enum Protocol {
  QUIC = "quic",
  TLS = "tls",
}

const enum HTTPSRecord {
  H3H2 = "alpn=h3,h2",
  H2H3 = "alpn=h2,h3",
  H3 = "alpn=h3",
  H2 = "alpn=h2",
  None = "NONE",
}
