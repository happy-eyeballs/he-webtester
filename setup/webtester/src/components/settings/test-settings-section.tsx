import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  HTTPSRecord,
  IPDelayType,
  IPVersion,
  Protocol,
  type TestSettings,
} from "@/lib/test-run.ts";
import { Input } from "@/components/ui/input.tsx";
import { DeviceInfoInput } from "@/components/settings/device-info-input.tsx";
import {
  SettingsDivider,
  SettingsItem,
} from "@/components/settings/settings-item";
import type { EnabledTestSettings } from "@/lib/settings.ts";
import { DelayRangeInput } from "@/components/settings/delay-range-input.tsx";

type Props = {
  enabledSettings: EnabledTestSettings;
  settings: TestSettings;
  setSettings: (settings: TestSettings) => void;
  runTest: () => void;
  downloadTestConfiguration: () => void;
  showDividers?: boolean;
  disabled?: boolean;
  disableProtocolHandshakeDelayRangeSetting?: boolean;
};

export const TestSettingsSection: React.FC<Props> = ({
  enabledSettings,
  settings,
  setSettings,
  runTest,
  downloadTestConfiguration,
  showDividers = false,
  disabled = false,
  disableProtocolHandshakeDelayRangeSetting = false,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        runTest();
      }}
    >
      <div className="grid gap-y-7 md:gap-y-3">
        {enabledSettings.repetitions !== undefined && (
          <SettingsItem label="Repetitions">
            <Select
              value={settings.repetitions.toString()}
              onValueChange={(value) =>
                setSettings({ ...settings, repetitions: Number(value) })
              }
              disabled={disabled}
            >
              <SelectTrigger className="w-full max-w-30">
                <SelectValue>{settings.repetitions}</SelectValue>
              </SelectTrigger>
              <SelectContent align="start">
                {enabledSettings.repetitions.options.map((value) => (
                  <SelectItem value={value.toString()} key={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsItem>
        )}

        {enabledSettings.httpsRecord !== undefined && (
          <SettingsItem label="HTTPS RR">
            <Select
              value={settings.httpsRecord}
              onValueChange={(value) =>
                setSettings({ ...settings, httpsRecord: value as HTTPSRecord })
              }
              disabled={disabled}
            >
              <SelectTrigger className="w-full max-w-60">
                <SelectValue>{settings.httpsRecord}</SelectValue>
              </SelectTrigger>
              <SelectContent align="start">
                {enabledSettings.httpsRecord.options.map((value) => (
                  <SelectItem value={value} key={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsItem>
        )}

        {showDividers && <SettingsDivider />}

        {enabledSettings.ipDelayType !== undefined && (
          <SettingsItem label="IP delay type">
            <Select
              value={settings.ipDelayType}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  ipDelayType: value as IPDelayType,
                })
              }
              disabled={disabled}
            >
              <SelectTrigger className="w-full max-w-120">
                <SelectValue>{settings.ipDelayType}</SelectValue>
              </SelectTrigger>
              <SelectContent align="start">
                {enabledSettings.ipDelayType.options.map((value) => (
                  <SelectItem value={value} key={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsItem>
        )}

        {enabledSettings.delayedIPVersion !== undefined && (
          <SettingsItem label="Delayed IP version">
            <Select
              value={settings.delayedIPVersion}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  delayedIPVersion: value as IPVersion,
                })
              }
              disabled={disabled}
            >
              <SelectTrigger className="w-full max-w-30">
                <SelectValue>{settings.delayedIPVersion}</SelectValue>
              </SelectTrigger>
              <SelectContent align="start">
                {enabledSettings.delayedIPVersion.options.map((value) => (
                  <SelectItem value={value} key={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsItem>
        )}

        {enabledSettings.ipHandshakeDelayRange !== undefined && (
          <SettingsItem label="IP delays">
            <DelayRangeInput
              delayRange={settings.ipHandshakeDelayRange}
              setDelayRange={(delayRange) =>
                setSettings({
                  ...settings,
                  ipHandshakeDelayRange: delayRange,
                })
              }
              disabled={disabled}
            />
          </SettingsItem>
        )}

        {showDividers && <SettingsDivider />}

        {enabledSettings.delayedProtocol !== undefined && (
          <SettingsItem label="Delayed protocol">
            <Select
              value={settings.delayedProtocol}
              onValueChange={(value) =>
                setSettings({ ...settings, delayedProtocol: value as Protocol })
              }
              disabled={disabled}
            >
              <SelectTrigger className="w-full max-w-30">
                <SelectValue>{settings.delayedProtocol}</SelectValue>
              </SelectTrigger>
              <SelectContent align="start">
                {enabledSettings.delayedProtocol.options.map((value) => (
                  <SelectItem value={value} key={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsItem>
        )}

        {enabledSettings.protocolHandshakeDelayRange !== undefined && (
          <SettingsItem label="Protocol handshake delays">
            <DelayRangeInput
              delayRange={settings.protocolHandshakeDelayRange}
              setDelayRange={(delayRange) =>
                setSettings({
                  ...settings,
                  protocolHandshakeDelayRange: delayRange,
                })
              }
              disabled={disabled || disableProtocolHandshakeDelayRangeSetting}
            />
          </SettingsItem>
        )}

        {showDividers && <SettingsDivider />}

        {enabledSettings.randomizeDomains !== undefined && (
          <SettingsItem label="Randomize domains">
            <Checkbox
              checked={settings.randomizeDomains}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, randomizeDomains: !!checked })
              }
              disabled={disabled}
            />
          </SettingsItem>
        )}

        {enabledSettings.autoTransmitResults !== undefined && (
          <SettingsItem label="Automatically transmit results">
            <Checkbox
              checked={settings.autoTransmitResults}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoTransmitResults: !!checked })
              }
              disabled={disabled}
            />
          </SettingsItem>
        )}

        {enabledSettings.resolverAddresses !== undefined && (
          <SettingsItem label="Configured Resolver IP Addresses (optional)">
            <Input
              type="text"
              placeholder="e.g., 8.8.8.8, 8.8.4.4"
              value={settings.resolverAddresses}
              onChange={(e) =>
                setSettings({ ...settings, resolverAddresses: e.target.value })
              }
              disabled={disabled}
              className="max-w-xl"
            />
          </SettingsItem>
        )}

        {enabledSettings.deviceInfo !== undefined && (
          <SettingsItem label="Device and user information for easier debugging (optional)">
            <DeviceInfoInput
              deviceInfo={settings.deviceInfo}
              setDeviceInfo={(deviceInfo) =>
                setSettings({ ...settings, deviceInfo })
              }
              disabled={disabled}
            />
          </SettingsItem>
        )}
      </div>

      <div className="mt-8 flex gap-4 items-center">
        <Button type="submit" disabled={disabled}>
          Run test
        </Button>

        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={downloadTestConfiguration}
        >
          Download test configuration
        </Button>
      </div>
    </form>
  );
};
