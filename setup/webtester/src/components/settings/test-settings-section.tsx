import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Button } from "@/components/ui/button.tsx";
import type { TestSettings } from "@/lib/test-run.ts";
import { Input } from "@/components/ui/input.tsx";
import { DeviceInfoInput } from "@/components/settings/device-info-input.tsx";
import { SettingsItem } from "@/components/settings/settings-item";

export type EnabledTestSettings = {
  repetitions?: { options: number[]; defaultOption: number };
  httpsRecordContent?: { options: string[]; defaultOption: string };
  autoTransmitResults?: boolean;
  randomizeDomains?: boolean;
  resolverAddresses?: boolean;
  deviceInfo?: boolean;
};

type Props = {
  enabledSettings: EnabledTestSettings;
  onStartTestRun: (settings: TestSettings) => void;
  disabled?: boolean;
};

export const TestSettingsSection: React.FC<Props> = ({
  enabledSettings,
  onStartTestRun,
  disabled = false,
}) => {
  const [repetitions, setRepetitions] = useState<number | undefined>(
    enabledSettings.repetitions?.defaultOption,
  );

  const [httpsRecordContent, setHttpsRecordContent] = useState<
    string | undefined
  >(enabledSettings.httpsRecordContent?.defaultOption);

  const [randomizeDomains, setRandomizeDomains] = useState<boolean | undefined>(
    enabledSettings.randomizeDomains ? true : undefined,
  );

  const [autoTransmitResults, setAutoTransmitResults] = useState<
    boolean | undefined
  >(enabledSettings.autoTransmitResults ? false : undefined);

  const [resolverAddresses, setResolverAddresses] = useState<
    string | undefined
  >(enabledSettings.resolverAddresses ? "" : undefined);

  const [deviceInfo, setDeviceInfo] = useState<string | undefined>(
    enabledSettings.deviceInfo ? "" : undefined,
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        onStartTestRun({
          repetitions,
          httpsRecordContent,
          randomizeDomains,
          autoTransmitResults,
          resolverAddresses,
          deviceInfo,
        } satisfies TestSettings);
      }}
    >
      <div className="grid gap-y-7 md:gap-y-3">
        {enabledSettings.repetitions && (
          <SettingsItem label="Repetitions">
            <Select
              defaultValue={enabledSettings.repetitions.defaultOption.toString()}
              onValueChange={(value) => setRepetitions(Number(value))}
              disabled={disabled}
            >
              <SelectTrigger className="w-30">
                <SelectValue>{repetitions}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {enabledSettings.repetitions.options.map((value) => (
                  <SelectItem value={value.toString()} key={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsItem>
        )}

        {enabledSettings.httpsRecordContent && (
          <SettingsItem label="HTTPS RR Content">
            <Select
              defaultValue={enabledSettings.httpsRecordContent.defaultOption}
              onValueChange={(value) => setHttpsRecordContent(value)}
              disabled={disabled}
            >
              <SelectTrigger className="w-40">
                <SelectValue>{httpsRecordContent}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {enabledSettings.httpsRecordContent.options.map((value) => (
                  <SelectItem value={value} key={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsItem>
        )}

        {enabledSettings.randomizeDomains && (
          <SettingsItem label="Randomize domains">
            <Checkbox
              defaultChecked={randomizeDomains ?? false}
              onCheckedChange={(checked) => setRandomizeDomains(!!checked)}
              disabled={disabled}
            />
          </SettingsItem>
        )}

        {enabledSettings.autoTransmitResults && (
          <SettingsItem label="Automatically transmit results">
            <Checkbox
              defaultChecked={autoTransmitResults ?? false}
              onCheckedChange={(checked) => setAutoTransmitResults(!!checked)}
              disabled={disabled}
            />
          </SettingsItem>
        )}

        {enabledSettings.resolverAddresses && (
          <SettingsItem label="Configured Resolver IP Addresses (optional)">
            <Input
              type="text"
              placeholder="e.g., 8.8.8.8, 8.8.4.4"
              onChange={(e) => setResolverAddresses(e.target.value)}
              disabled={disabled}
              className="max-w-xl"
            />
          </SettingsItem>
        )}

        {enabledSettings.deviceInfo && (
          <SettingsItem label="Device and user information for easier debugging (optional)">
            <DeviceInfoInput
              deviceInfo={deviceInfo ?? ""}
              setDeviceInfo={setDeviceInfo}
              disabled={disabled}
            />
          </SettingsItem>
        )}
      </div>

      <div className="mt-8 flex gap-8 items-center">
        <Button type="submit" disabled={disabled}>
          Run test
        </Button>
      </div>
    </form>
  );
};
