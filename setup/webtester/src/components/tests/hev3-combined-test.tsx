import React, { useEffect, useState } from "react";
import {
  HTTPSRecord,
  IPDelayType,
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
import {
  buildInitialSettingsFromEnabledSettings,
  type EnabledTestSettings,
} from "@/lib/settings.ts";
import { fetchAvailableDelays } from "@/lib/he-configuration.ts";

export const HEv3CombinedTest: React.FC = () => {
  const [settings, setSettings] = useState<TestSettings>(
    buildInitialSettingsFromEnabledSettings(enabledSettings),
  );
  const [networkDelays, setNetworkDelays] = useState<number[]>([]);

  useEffect(() => {
    fetchAvailableDelays().then((delays) => setNetworkDelays(delays.v1_delays));
  }, []);

  const buildSubtests = async (): Promise<TestPart[]> => {
    const testParts: TestPart[] = [];

    const ipDelays =
      settings.ipDelayType === IPDelayType.Network
        ? networkDelays
        : handshakeDelays;

    for (const ipDelay of ipDelays) {
      const subtests: Subtest[] = [];

      for (const protocolDelay of handshakeDelays) {
        const url =
          settings.ipDelayType === IPDelayType.Handshake
            ? await generateHEv3TestUrl(
                settings.randomizeDomains,
                settings.delayedIPVersion === IPVersion.IPv4 ? ipDelay : 0,
                settings.delayedIPVersion === IPVersion.IPv6 ? ipDelay : 0,
                settings.delayedProtocol === Protocol.QUIC ? protocolDelay : 0,
                settings.delayedProtocol === Protocol.TLS ? protocolDelay : 0,
                settings.httpsRecord,
                settings.ipDelayType,
              )
            : await generateHEv3TestUrl(
                settings.randomizeDomains,
                0,
                ipDelay,
                settings.delayedProtocol === Protocol.QUIC ? protocolDelay : 0,
                settings.delayedProtocol === Protocol.TLS ? protocolDelay : 0,
                settings.httpsRecord,
                settings.ipDelayType,
              );

        subtests.push({
          url,
          responseHandler,
          sleepAfterSubtest: 2000,
        } satisfies Subtest);
      }

      testParts.push({
        name: `${ipDelay} (${settings.ipDelayType === IPDelayType.Handshake ? "Handshake" : "Network"})`,
        subtests,
      } satisfies TestPart);
    }

    return testParts;
  };

  const buildEnabledSettings = (): EnabledTestSettings => {
    if (settings.ipDelayType === IPDelayType.Network) {
      // disable the "delayed ip version" setting when the delay type is network
      // (only IPv6 delay is configured)
      const { delayedIPVersion, ...remainingEnabledSettings } = enabledSettings;
      return remainingEnabledSettings;
    }

    return enabledSettings;
  };

  return (
    <TestSkeleton
      enabledSettings={buildEnabledSettings()}
      settings={settings}
      setSettings={setSettings}
      buildSubtests={buildSubtests}
      resultsUrl="/results/hev3-combined" // TODO
      subtestColumnDescription="Protocol Handshake Delay [ms]"
      subtestColumnLabels={handshakeDelays.map((delay) => delay.toString())}
      subtestRowDescription="IP Delay [ms]"
    />
  );
};

const handshakeDelays = [0, 100, 200, 300, 400, 500];

const enabledSettings: EnabledTestSettings = {
  repetitions: {
    options: [1, 2, 5, 10],
    defaultOption: 1,
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
  ipDelayType: {
    options: [IPDelayType.Handshake, IPDelayType.Network],
    defaultOption: IPDelayType.Handshake,
  },
  delayedIPVersion: {
    options: [IPVersion.IPv4, IPVersion.IPv6],
    defaultOption: IPVersion.IPv6,
  },
  delayedProtocol: {
    options: [Protocol.QUIC, Protocol.TLS],
    defaultOption: Protocol.QUIC,
  },
  randomizeDomains: true,
  autoTransmitResults: false,
  deviceInfo: {},
};

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
    value: `${protocol} / ${ipVersion}`,
    color: isIPv6
      ? isQUIC
        ? TestRunResultColor.Option1
        : TestRunResultColor.Option2
      : isQUIC
        ? TestRunResultColor.Option3
        : TestRunResultColor.Option4,
    metadata: {
      "HTTP Protocol": httpProtocol,
    },
  } satisfies ResponseHandlerResult;
};
