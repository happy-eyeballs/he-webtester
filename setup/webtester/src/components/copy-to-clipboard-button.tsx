import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";

export const CopyToClipboardButton: React.FC<{ text: string }> = ({ text }) => {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);

    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 1000);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild={true}>
        <Button size="icon" className="relative" onClick={copyToClipboard}>
          <CopyIcon
            className={cn(
              "absolute h-4 w-4 transition-all duration-300",
              hasCopied ? "scale-0 opacity-0" : "scale-100 opacity-100",
            )}
          />

          <CheckIcon
            className={cn(
              "absolute h-4 w-4 transition-all duration-300",
              hasCopied ? "scale-100 opacity-100" : "scale-0 opacity-0",
            )}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {hasCopied ? "Copied!" : "Copy to Clipboard"}
      </TooltipContent>
    </Tooltip>
  );
};
