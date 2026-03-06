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
import { SettingsItem } from "@/components/settings/settings-item";

export type ToolSettings = {
  measurementType: string | undefined;
  randomizeDomain: boolean | undefined;
  delay: number | undefined;
};

type Props = {
  enabledSettings: {
    measurementType?: { options: string[]; defaultOption: string };
    randomizeDomain?: boolean;
    delay?: { options: number[]; defaultOption: number };
  };
  onSubmit: (toolSettings: ToolSettings) => void;
};

export const ToolSettingsSection: React.FC<Props> = ({
  enabledSettings,
  onSubmit,
}) => {
  const [measurementType, setMeasurementType] = useState<string | undefined>(
    enabledSettings.measurementType?.defaultOption,
  );

  const [randomizeDomain, setRandomizeDomain] = useState<boolean | undefined>(
    enabledSettings.randomizeDomain ? true : undefined,
  );

  const [delay, setDelay] = useState<number | undefined>(
    enabledSettings.delay?.defaultOption,
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        onSubmit({
          measurementType,
          randomizeDomain,
          delay,
        } satisfies ToolSettings);
      }}
    >
      <div className="grid gap-y-7 md:gap-y-3">
        {enabledSettings.measurementType && (
          <SettingsItem label="Measurement Type">
            <Select
              defaultValue={enabledSettings.measurementType.defaultOption}
              onValueChange={(value) => setMeasurementType(value)}
            >
              <SelectTrigger className="w-80">
                <SelectValue>{measurementType}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {enabledSettings.measurementType.options.map((value) => (
                  <SelectItem value={value} key={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsItem>
        )}

        {enabledSettings.delay && (
          <SettingsItem label="Delay">
            <Select
              defaultValue={enabledSettings.delay.defaultOption.toString()}
              onValueChange={(value) => setDelay(Number(value))}
            >
              <SelectTrigger className="w-30">
                <SelectValue>
                  {delay} <span className="text-muted-foreground">ms</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {enabledSettings.delay.options.map((value) => (
                  <SelectItem value={value.toString()} key={value}>
                    {value} <span className="text-muted-foreground">ms</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsItem>
        )}

        {enabledSettings.randomizeDomain && (
          <SettingsItem label="Randomize domain">
            <Checkbox
              defaultChecked={randomizeDomain ?? false}
              onCheckedChange={(checked) => setRandomizeDomain(!!checked)}
            />
          </SettingsItem>
        )}
      </div>

      <div className="mt-8 flex gap-8 items-center">
        <Button type="submit">Generate domain</Button>
      </div>
    </form>
  );
};
