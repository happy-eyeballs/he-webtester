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

export type TestSettings = {
  repetitions: number | undefined;
  autoTransmitResults: boolean | undefined;
  randomizeDomains: boolean | undefined;
  deviceInfo: string | undefined;
};

type Props = {
  enabledSettings: {
    repetitions?: { options: number[]; defaultOption: number };
    autoTransmitResults?: boolean;
    randomizeDomains?: boolean;
    deviceInfo?: boolean;
  };
  onStartTestRuns: (settings: TestSettings) => void;
};

export const TestSettingsSection: React.FC<Props> = ({
  enabledSettings,
  onStartTestRuns,
}) => {
  const [selectedRepetitions, setSelectedRepetitions] = useState<
    number | undefined
  >(enabledSettings.repetitions?.defaultOption);
  const [shouldRandomizeDomains, setShouldRandomizeDomains] = useState<
    boolean | undefined
  >(enabledSettings.randomizeDomains ? true : undefined);
  const [shouldAutoTransmitResults, setShouldAutoTransmitResults] = useState<
    boolean | undefined
  >(enabledSettings.autoTransmitResults ? false : undefined);
  const [deviceInfo, setDeviceInfo] = useState<string | undefined>(
    enabledSettings.deviceInfo ? "" : undefined,
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        onStartTestRuns({
          repetitions: selectedRepetitions,
          randomizeDomains: shouldRandomizeDomains,
          autoTransmitResults: shouldAutoTransmitResults,
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
              onValueChange={(value) => setSelectedRepetitions(Number(value))}
            >
              <SelectTrigger className="w-30">
                <SelectValue>{selectedRepetitions}</SelectValue>
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
              defaultChecked={shouldRandomizeDomains ?? false}
              onCheckedChange={(checked) =>
                setShouldRandomizeDomains(!!checked)
              }
            />
          </SettingsItem>
        )}

        {enabledSettings.autoTransmitResults && (
          <SettingsItem label="Automatically transmit results">
            <Checkbox
              defaultChecked={shouldAutoTransmitResults ?? false}
              onCheckedChange={(checked) =>
                setShouldAutoTransmitResults(!!checked)
              }
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
              />
              <InputGroupAddon align="inline-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InputGroupButton variant="secondary">
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

      <div className="mt-8">
        <Button type="submit">Start test runs</Button>
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
