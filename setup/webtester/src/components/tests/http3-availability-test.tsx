import React, { useState } from "react";
import {
  type ResponseHandlerResult,
  type TestPart,
  TestRunResultColor,
  type TestSettings,
} from "@/lib/test-run.ts";
import { TestSkeleton } from "@/components/test-skeleton.tsx";
import { getHappyEyeballsTestDomain } from "@/lib/he-configuration.ts";
import { generateRandomId } from "@/lib/test-utils.ts";
import {
  buildInitialSettingsFromEnabledSettings,
  type EnabledTestSettings,
} from "@/lib/settings.ts";

export const HTTP3AvailabilityTest: React.FC = () => {
  const [settings, setSettings] = useState<TestSettings>(
    buildInitialSettingsFromEnabledSettings(enabledSettings),
  );

  const buildSubtests = async (): Promise<TestPart[]> => {
    const happyEyeballsTestDomain = await getHappyEyeballsTestDomain();

    const id = () => (settings.randomizeDomains ? generateRandomId() : 0);

    const http3ResponseHandler = async (
      response: Response,
    ): Promise<ResponseHandlerResult> => {
      const { protocol } = (await response.json()) as {
        protocol: string;
      };

      const isHTTP3 = protocol === "HTTP/3.0";

      return {
        value: protocol,
        color: isHTTP3
          ? TestRunResultColor.Option1
          : TestRunResultColor.Option2,
      };
    };

    return [
      {
        subtests: [
          {
            url: `https://id-${id()}.http3.http3.${happyEyeballsTestDomain}/ping`,
            responseHandler: http3ResponseHandler,
          },
          {
            url: `https://id-${id()}.http3-https.http3.${happyEyeballsTestDomain}/ping`,
            responseHandler: http3ResponseHandler,
          },
          {
            url: `https://id-${id()}.http3-altsvc.http3.${happyEyeballsTestDomain}/ping`,
            responseHandler: http3ResponseHandler,
            numberOfRequests: 2,
            sleepBetweenRequests: 500,
          },
          {
            url: `https://id-${id()}.http3-https-altsvc.http3.${happyEyeballsTestDomain}/ping`,
            responseHandler: http3ResponseHandler,
            numberOfRequests: 2,
            sleepBetweenRequests: 500,
          },
        ],
      },
    ];
  };

  return (
    <TestSkeleton
      enabledSettings={enabledSettings}
      settings={settings}
      setSettings={setSettings}
      buildSubtests={buildSubtests}
      resultsUrl="/results/http3-availability"
      subtestColumnDescription="Scenario"
      subtestColumnLabels={[
        "HTTP/3",
        "HTTP/3\nwith HTTPS RR",
        "HTTP/3\nwith Alt-Svc",
        "HTTP/3\nwith Alt-Svc\nand HTTPS RR",
      ]}
    />
  );
};

const enabledSettings: EnabledTestSettings = {
  repetitions: {
    options: [1, 5, 10, 20, 30, 40, 50],
    defaultOption: 5,
  },
  randomizeDomains: true,
  autoTransmitResults: false,
  deviceInfo: {},
};
