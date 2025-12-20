import React from "react";
import {
  type ResponseHandlerResult,
  type TestPart,
  TestRunResultColor,
  type TestSettings,
} from "@/lib/test-run.ts";
import { HETest } from "@/components/he-test.tsx";
import { getHappyEyeballsTestDomain } from "@/lib/he-configuration.ts";
import { generateRandomId } from "@/lib/test-utils.ts";

export const HTTP3AvailabilityTest: React.FC = () => {
  const buildSubtests = async (settings: TestSettings): Promise<TestPart[]> => {
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
            url: `https://id-${id()}.http3.v3-quic.${happyEyeballsTestDomain}/ping`,
            responseHandler: http3ResponseHandler,
          },
          {
            url: `https://id-${id()}.http3-https.v3-quic.${happyEyeballsTestDomain}/ping`,
            responseHandler: http3ResponseHandler,
          },
          {
            url: `https://id-${id()}.http3-altsvc.v3-quic.${happyEyeballsTestDomain}/ping`,
            responseHandler: http3ResponseHandler,
            numberOfRequests: 2,
            sleepBetweenRequests: 500,
          },
          {
            url: `https://id-${id()}.http3-https-altsvc.v3-quic.${happyEyeballsTestDomain}/ping`,
            responseHandler: http3ResponseHandler,
            numberOfRequests: 2,
            sleepBetweenRequests: 500,
          },
        ],
      },
    ];
  };

  return (
    <HETest
      buildSubtests={buildSubtests}
      enabledSettings={{
        repetitions: {
          options: [1, 5, 10, 20, 30, 40, 50],
          defaultOption: 5,
        },
        autoTransmitResults: true,
        randomizeDomains: true,
        deviceInfo: true,
      }}
      testName="http3"
      resultsUrl="/results/http3"
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
