import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

type Props = {
  trigger?: React.ReactNode;
  children?: React.ReactNode;
};

export const ClickableTooltip: React.FC<Props> = ({ trigger, children }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Tooltip open={open}>
      <TooltipTrigger
        asChild
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onTouchStart={() => setOpen(!open)}
        onKeyDown={(e) => {
          e.preventDefault();
          e.key === "Enter" && setOpen(!open);
        }}
      >
        {trigger}
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
};
