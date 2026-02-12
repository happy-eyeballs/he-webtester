import {
  IPDelayType,
  HTTPSRecord,
  IPVersion,
  Protocol,
  type TestSettings,
} from "@/lib/test-run.ts";

export type EnabledTestSettings = {
  repetitions?: { options: number[]; defaultOption: number };
  httpsRecord?: { options: HTTPSRecord[]; defaultOption: HTTPSRecord };
  ipDelayType?: { options: IPDelayType[]; defaultOption: IPDelayType };
  delayedIPVersion?: { options: IPVersion[]; defaultOption: IPVersion };
  delayedProtocol?: { options: Protocol[]; defaultOption: Protocol };
  autoTransmitResults?: boolean;
  randomizeDomains?: boolean;
  resolverAddresses?: {};
  deviceInfo?: {};
};

export const buildInitialSettingsFromEnabledSettings = (
  enabledSettings: EnabledTestSettings,
): TestSettings => ({
  repetitions: enabledSettings.repetitions?.defaultOption ?? 1,
  httpsRecord: enabledSettings.httpsRecord?.defaultOption ?? HTTPSRecord.None,
  ipDelayType:
    enabledSettings.ipDelayType?.defaultOption ?? IPDelayType.Handshake,
  delayedIPVersion:
    enabledSettings.delayedIPVersion?.defaultOption ?? IPVersion.IPv6,
  delayedProtocol:
    enabledSettings.delayedProtocol?.defaultOption ?? Protocol.QUIC,
  randomizeDomains: enabledSettings.randomizeDomains ?? true,
  autoTransmitResults: enabledSettings.autoTransmitResults ?? false,
  resolverAddresses: "",
  deviceInfo: "",
});
