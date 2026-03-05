import React from "react";
import type { DelayRange } from "@/lib/test-run.ts";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group.tsx";

type Props = {
  delayRange: DelayRange;
  setDelayRange: (delayRange: DelayRange) => void;
  disabled: boolean;
};

export const DelayRangeInput: React.FC<Props> = ({
  delayRange,
  setDelayRange,
  disabled,
}) => {
  return (
    <div className="flex gap-x-4 sm:gap-x-8 gap-y-2 items-center flex-wrap">
      <div className="flex gap-2 items-center">
        <span className="text-sm">From</span>
        <InputGroup className="max-w-25">
          <InputGroupInput
            type="number"
            min={0}
            className="text-right appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            disabled={disabled}
            value={delayRange.from}
            onChange={(e) =>
              setDelayRange({
                ...delayRange,
                from: Math.max(Number(e.target.value), 0),
              })
            }
          />
          <InputGroupAddon align="inline-end" className="pb-1">
            ms
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-sm">To</span>
        <InputGroup className="max-w-25">
          <InputGroupInput
            type="number"
            min={0}
            className="text-right appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            disabled={disabled}
            value={delayRange.to}
            onChange={(e) =>
              setDelayRange({
                ...delayRange,
                to: Math.max(Number(e.target.value), 0),
              })
            }
          />
          <InputGroupAddon align="inline-end" className="pb-1">
            ms
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-sm">Step</span>
        <InputGroup className="max-w-25">
          <InputGroupInput
            type="number"
            min={0}
            className="text-right appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            disabled={disabled}
            value={delayRange.step}
            onChange={(e) =>
              setDelayRange({
                ...delayRange,
                step: Math.max(Number(e.target.value), 1),
              })
            }
          />
          <InputGroupAddon align="inline-end" className="pb-1">
            ms
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
};
