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

export type EnabledTestSettings = {
  repetitions?: { options: number[]; defaultOption: number };
  autoTransmitResults?: boolean;
  randomizeDomains?: boolean;
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
          deviceInfo,
        } satisfies TestSettings);
      }}
    >
      <div className="mb-3">
        <h2 className="text-lg font-semibold ">Settings</h2>
        <div className="text-muted-foreground text-sm">Configure the test</div>
      </div>

      <div className="grid grid-cols-[250px_1fr] gap-x-8 gap-y-3 items-center">
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

        {enabledSettings.deviceInfo && (
          <SettingsItem label="Device and user information for easier debugging (optional)">
            <InputGroup className="max-w-xl">
              <InputGroupInput
                type="text"
                placeholder="OS, device, browser, your name, etc."
                onChange={(e) => setDeviceInfo(e.target.value)}
                disabled={disabled}
              />
              <InputGroupAddon align="inline-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InputGroupButton
                      variant="secondary"
                      disabled={disabled}
                      onClick={async () => {
                        try {
                          const info = await getDeviceInfo();
                          setDeviceInfo(info);
                        } catch (err) {
                          alert(err);
                        }
                      }}
                    >
                      <WandSparklesIcon />
                      Autofill
                    </InputGroupButton>
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

type SettingsItemProps = {
  label: string;
  children?: React.ReactNode;
};

const SettingsItem: React.FC<SettingsItemProps> = ({ label, children }) => {
  return (
    <>
      <div className="text-sm leading-snug">{label}</div>
      <div>{children}</div>
    </>
  );
};
