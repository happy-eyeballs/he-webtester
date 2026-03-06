import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  ToolSettingsSection,
  type ToolSettings,
} from "@/components/settings/tool-settings-section.tsx";
import { fetchAvailableDelays } from "@/lib/he-configuration.ts";
import { generateConnectAttemptDelayUrl } from "@/components/tests/connection-attempt-delay-test.tsx";
import { generateResolutionDelayUrl } from "@/components/tests/resolution-delay-test.tsx";
import { CopyToClipboardButton } from "@/components/copy-to-clipboard-button.tsx";

const enum MeasurementType {
  CAD = "Connection Attempt Delay (CAD)",
  RD = "Resolution Delay (RD)",
}

export const MeasurementDomainBuilderTool: React.FC = () => {
  const [availableDelays, setAvailableDelays] = useState<number[]>([]);
  const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);

  useEffect(() => {
    const setup = async () => {
      setAvailableDelays(await fetchAvailableDelays());
    };

    setup();
  }, []);

  const generateDomains = async (settings: ToolSettings) => {
    if (settings.measurementType === MeasurementType.CAD) {
      const url = await generateConnectAttemptDelayUrl(
        settings.randomizeDomain ?? false,
        settings.delay ?? 0,
      );

      setGeneratedUrls([url]);
      return;
    }

    if (settings.measurementType === MeasurementType.RD) {
      setGeneratedUrls([
        await generateResolutionDelayUrl(
          settings.randomizeDomain ?? false,
          settings.delay ?? 0,
          "a",
        ),
        await generateResolutionDelayUrl(
          settings.randomizeDomain ?? false,
          settings.delay ?? 0,
          "aaaa",
        ),
      ]);
      return;
    }
  };

  return (
    <div className="py-10 flex flex-col gap-y-10">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <ToolSettingsSection
            enabledSettings={{
              measurementType: {
                options: [MeasurementType.CAD, MeasurementType.RD],
                defaultOption: MeasurementType.CAD,
              },
              randomizeDomain: true,
              delay: {
                options: availableDelays,
                defaultOption: availableDelays[0] ?? 0,
              },
            }}
            onSubmit={generateDomains}
          />
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {generatedUrls.map((url) => (
          <div
            className="px-5 py-3 bg-muted rounded-xl flex justify-between items-center"
            key={url}
          >
            <a
              href={url}
              className="underline underline-offset-4 cursor-pointer w-max hover:opacity-80"
            >
              {url}
            </a>

            <CopyToClipboardButton text={url} />
          </div>
        ))}
      </div>
    </div>
  );
};
