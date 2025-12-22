import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group.tsx";
import { WandSparklesIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { Button } from "@/components/ui/button.tsx";
import type { TestSettings } from "@/lib/test-run.ts";
import { getDeviceInfo } from "@/lib/device-info.ts";
import { Input } from "@/components/ui/input.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { sleep } from "@/lib/test-utils";

export type EnabledTestSettings = {
  repetitions?: { options: number[]; defaultOption: number };
  autoTransmitResults?: boolean;
  randomizeDomains?: boolean;
  resolverAddresses?: boolean;
  deviceInfo?: boolean;
};

type Props = {
  enabledSettings: EnabledTestSettings;
  onStartTestRun: (settings: TestSettings) => void;
  disabled?: boolean;
  statusWidget?: React.ReactNode;
};

export const TestSettingsSection: React.FC<Props> = ({
  enabledSettings,
  onStartTestRun,
  disabled = false,
  statusWidget,
}) => {
  const [repetitions, setRepetitions] = useState<number | undefined>(
    enabledSettings.repetitions?.defaultOption,
  );

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
            <InputGroup className="max-w-xl">
              <InputGroupInput
                type="text"
                placeholder="OS, device, browser, your name, etc."
                value={deviceInfo}
                onChange={(e) => setDeviceInfo(e.target.value)}
                disabled={disabled}
                className="text-sm"
              />
              <InputGroupAddon align="inline-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AutofillButton
                      disabled={disabled}
                      setDeviceInfo={setDeviceInfo}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    Automatically detect device information.
                    <br />
                    Please update the auto-filled data if incorrect!
                  </TooltipContent>
                </Tooltip>
              </InputGroupAddon>
            </InputGroup>
          </SettingsItem>
        )}
      </div>

      <div className="mt-8 flex gap-8 items-center">
        <Button type="submit" disabled={disabled}>
          Run test
        </Button>

        {statusWidget}
      </div>
    </form>
  );
};

const SettingsItem: React.FC<{
  label: string;
  children?: React.ReactNode;
}> = ({ label, children }) => (
  <div className="grid md:grid-cols-[210px_1fr] md:gap-x-14 gap-y-2 items-center">
    <div className="text-sm leading-snug">{label}</div>
    <div>{children}</div>
  </div>
);

const AutofillButton: React.FC<{
  disabled: boolean;
  setDeviceInfo: (deviceInfo: string) => void;
}> = ({ disabled, setDeviceInfo }) => {
  const [isLoading, setIsLoading] = useState(false);

  const autofill = async () => {
    try {
      setIsLoading(true);

      const info = await getDeviceInfo();
      await sleep(100);

      if (!disabled) {
        setDeviceInfo(info);
      }
    } catch (err) {
      alert(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InputGroupButton
      variant="secondary"
      disabled={disabled || isLoading}
      onClick={autofill}
      className="text-sm"
    >
      {isLoading ? <Spinner /> : <WandSparklesIcon />}
      Autofill
    </InputGroupButton>
  );
};
