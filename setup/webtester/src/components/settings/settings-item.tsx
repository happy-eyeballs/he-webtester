import React from "react";
import { CircleHelpIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

export const SettingsItem: React.FC<{
  label: string;
  helpText?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ label, helpText, children }) => (
  <div className="grid md:grid-cols-[230px_1fr] md:gap-x-14 gap-y-2 items-center min-h-8">
    <div className="text-sm leading-snug">
      <div className="inline mr-2">{label}</div>

      {helpText && (
        <Tooltip>
          <TooltipTrigger asChild={true}>
            <CircleHelpIcon className="size-4.5 inline align-text-bottom text-blue-400" />
          </TooltipTrigger>
          <TooltipContent className="text-sm max-w-200">
            {helpText}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
    <div className="min-w-0">{children}</div>
  </div>
);

export const SettingsDivider: React.FC = () => (
  <div className="border-t my-4" />
);
