import React from "react";

export const SettingsItem: React.FC<{
  label: string;
  children?: React.ReactNode;
}> = ({ label, children }) => (
  <div className="grid md:grid-cols-[210px_1fr] md:gap-x-14 gap-y-2 items-center min-h-8">
    <div className="text-sm leading-snug">{label}</div>
    <div className="min-w-0">{children}</div>
  </div>
);
