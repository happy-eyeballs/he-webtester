import React, { useState } from "react";
import {
  IPDelayType,
  HTTPSRecord,
  Protocol,
  type ResponseHandlerResult,
  type Subtest,
  type TestPart,
  TestRunResultColor,
  type TestSettings,
} from "@/lib/test-run.ts";
import { TestSkeleton } from "@/components/test-skeleton.tsx";
import { generateHEv3TestUrl } from "@/lib/test-utils";
import {
  buildInitialSettingsFromEnabledSettings,
  type EnabledTestSettings,
} from "@/lib/settings.ts";

export const HEv3QuicTlsTest: React.FC = () => {
  const [settings, setSettings] = useState<TestSettings>(
    buildInitialSettingsFromEnabledSettings(enabledSettings),
  );

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

  const buildSubtests = async (): Promise<TestPart[]> => {
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

      for (const delay of handshakeDelays) {
        const url = await generateHEv3TestUrl(
          settings.randomizeDomains,
          0,
          0,
          part.protocol === Protocol.QUIC ? delay : 0,
          part.protocol === Protocol.TLS ? delay : 0,
          (settings.httpsRecord as HTTPSRecord) ?? HTTPSRecord.H3H2,
          IPDelayType.Handshake,
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
      enabledSettings={enabledSettings}
      settings={settings}
      setSettings={setSettings}
      buildSubtests={buildSubtests}
      resultsUrl="/results/hev3-quic-tls" // TODO
      subtestColumnDescription="Protocol Handshake Delay [ms]"
      subtestColumnLabels={handshakeDelays.map((delay) => delay.toString())}
    />
  );
};

const handshakeDelays = [0, 100, 200, 300, 400, 500];

const enabledSettings: EnabledTestSettings = {
  repetitions: {
    options: [1, 5, 10, 20, 30, 40, 50],
    defaultOption: 5,
  },
  httpsRecord: {
    options: [
      HTTPSRecord.H3H2,
      HTTPSRecord.H2H3,
      HTTPSRecord.H3,
      HTTPSRecord.H3NoDefault,
      HTTPSRecord.H2,
      HTTPSRecord.None,
    ],
    defaultOption: HTTPSRecord.H3H2,
  },
  randomizeDomains: true,
  autoTransmitResults: false,
  deviceInfo: {},
};
