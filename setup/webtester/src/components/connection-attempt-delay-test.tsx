import React from "react";
import {
  type TestSettings,
  TestSettingsSection,
} from "@/components/test-settings-section.tsx";
import {
  TestResultTable,
  type TestRunResult,
} from "@/components/test-result-table.tsx";

export const ConnectionAttemptDelayTest: React.FC = () => {
  // https://ui.shadcn.com/colors
  const IPV6_COLOR = "#0e7490"; // cyan-700
  const IPV4_COLOR = "#b45309"; // amber-700

  // TEMP
  const results: TestRunResult[] = [
    {
      testRunId: "1",
      startedAt: new Date(),
      results: [
        { label: "IPv6", color: IPV6_COLOR },
        { label: "IPv6", color: IPV6_COLOR },
        { label: "IPv4", color: IPV4_COLOR },
        { label: "IPv4", color: IPV4_COLOR },
        { label: "IPv4", color: IPV4_COLOR },
      ],
    },
    {
      testRunId: "2",
      startedAt: new Date(),
      results: [
        { label: "IPv6", color: IPV6_COLOR },
        { label: "IPv6", color: IPV6_COLOR },
        { label: "IPv6", color: IPV6_COLOR },
        { label: "IPv6", color: IPV6_COLOR },
        { label: "IPv4", color: IPV4_COLOR },
      ],
    },
  ];

  const startTestRuns = (settings: TestSettings) => {
    console.log(settings);
  };

  return (
    <div>
      <TestSettingsSection
        enabledSettings={{
          repetitions: {
            options: [1, 5, 10, 20, 30, 40, 50],
            defaultOption: 10,
          },
          autoTransmitResults: true,
          randomizeDomains: true,
          deviceInfo: true,
        }}
        onStartTestRuns={startTestRuns}
      />

      <div className="mb-10" />

      <TestResultTable
        columnDescription="IPv6 Delay [ms]"
        columns={["0", "100", "200", "300", "400"]}
        rows={results}
      />
    </div>
  );
};
