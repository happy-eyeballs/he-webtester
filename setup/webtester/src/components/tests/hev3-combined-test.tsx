import React from "react";
import {
  HTTPSRecord,
  IPVersion,
  Protocol,
  type ResponseHandlerResult,
  type Subtest,
  type TestPart,
  TestRunResultColor,
  type TestSettings,
} from "@/lib/test-run.ts";
import { TestSkeleton } from "@/components/test-skeleton.tsx";
import { generateHEv3TestUrl } from "@/lib/test-utils";

export const HEv3CombinedTest: React.FC = () => {
  const delays = [0, 100, 200, 300, 400, 500];

  const responseHandler = async (
    response: Response,
  ): Promise<ResponseHandlerResult> => {
    const { protocol: httpProtocol, server_ip } = (await response.json()) as {
      protocol: string;
      server_ip: string;
    };

    const isQUIC = httpProtocol === "HTTP/3.0";
    const isIPv6 = server_ip.includes(":");

    const ipVersion = isIPv6 ? "IPv6" : "IPv4";
    const protocol = isQUIC ? "QUIC" : "TLS";

    return {
      value: `${protocol}/${ipVersion}`,
      color: isIPv6
        ? isQUIC
          ? TestRunResultColor.Option1
          : TestRunResultColor.Option2
        : isQUIC
          ? TestRunResultColor.Option3
          : TestRunResultColor.Option4,
    } satisfies ResponseHandlerResult;
  };

  const buildSubtests = async (settings: TestSettings): Promise<TestPart[]> => {
    const testParts: TestPart[] = [];

    for (const ipDelay of delays) {
      const subtests: Subtest[] = [];

      for (const protocolDelay of delays) {
        const url = await generateHEv3TestUrl(
          settings.randomizeDomains ?? false,
          settings.delayedIPVersion === IPVersion.IPv4 ? ipDelay : 0,
          settings.delayedIPVersion === IPVersion.IPv6 ? ipDelay : 0,
          settings.delayedProtocol === Protocol.QUIC ? protocolDelay : 0,
          settings.delayedProtocol === Protocol.TLS ? protocolDelay : 0,
          (settings.httpsRecord as HTTPSRecord) ?? HTTPSRecord.H3H2,
        );

        subtests.push({
          url,
          responseHandler,
          sleepAfterSubtest: 2000,
        } satisfies Subtest);
      }

      testParts.push({
        name: ipDelay.toString(),
        subtests,
      } satisfies TestPart);
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
        delayedIPVersion: {
          options: [IPVersion.IPv4, IPVersion.IPv6],
          defaultOption: IPVersion.IPv6,
        },
        delayedProtocol: {
          options: [Protocol.QUIC, Protocol.TLS],
          defaultOption: Protocol.QUIC,
        },
        autoTransmitResults: true,
        randomizeDomains: true,
        deviceInfo: true,
      }}
      resultsUrl="/results/hev3-combined" // TODO
      subtestColumnDescription="Protocol Delay [ms]"
      subtestColumnLabels={delays.map((delay) => delay.toString())}
      subtestRowDescription="IP Delay [ms]"
    />
  );
};
