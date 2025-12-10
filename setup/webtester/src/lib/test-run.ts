export const enum SubtestResultValue {
  Error = "ERR",
  IPv4 = "IPv4",
  IPv6 = "IPv6",
}

export type SubtestResult = {
  value: SubtestResultValue;
  url: string;
  requestDurationMs?: number;
  error?: string;
};

export type Subtest = {
  url: string;
  isRunning?: boolean;
  result?: SubtestResult;
};

export type TestRunRepetition = {
  repetitionNumber: number;
  startedAt: Date;
  subtests: Subtest[];
};

export type TestRun = {
  testRunNumber: number;
  repetitions: TestRunRepetition[];
  settings: TestSettings;
};

export type TestSettings = {
  repetitions: number | undefined;
  autoTransmitResults: boolean | undefined;
  randomizeDomains: boolean | undefined;
  deviceInfo: string | undefined;
};
