import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  children?: React.ReactNode;
};

export const CitationDialog: React.FC<Props> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Citation</DialogTitle>
        </DialogHeader>

        <code className="whitespace-pre-wrap text-muted-foreground text-xs text-left">
          {`@inproceedings{sattler2025happyeyeballs,
  title = {{Lazy Eye Inspection: Capturing the State of Happy Eyeballs Implementations}},
  author = {Sattler, Patrick and Kirstein, Matthias and Wüstrich, Lars and Zirngibl, Johannes and Carle, Georg},
  booktitle = {Proceedings of the 2025 Internet Measurement Conference},
  year = {2025},
  location = {Madison, WI, USA},
  abbreviation = {IMC'25},
  publisher = {ACM},
  month = oct,
  homepage = {https://www.happy-eyeballs.net/},
  month_numeric = {10}
}`}
        </code>
      </DialogContent>
    </Dialog>
  );
};
