"use client";

import type { ReactNode } from "react";
import { SETTINGS_TEXT } from "./settingsTokens";

type Props = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  testId?: string;
};

/** Optional Learn More — closed by default. */
export function SettingsHelpAccordion({
  title,
  children,
  defaultOpen = false,
  testId,
}: Props) {
  return (
    <details
      className="settings-help-accordion mt-3 rounded-lg border border-[#d4cdc3] bg-[#faf7f2] px-3 py-2"
      open={defaultOpen || undefined}
      data-testid={testId ?? "settings-help-accordion"}
    >
      <summary
        className={`cursor-pointer text-sm font-semibold ${SETTINGS_TEXT.accent} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]`}
      >
        {title}
      </summary>
      <div className={`mt-2 text-sm leading-relaxed ${SETTINGS_TEXT.helper}`}>
        {children}
      </div>
    </details>
  );
}
