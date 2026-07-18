"use client";

import type { ReactNode } from "react";
import { SETTINGS_SURFACE, SETTINGS_TEXT } from "./settingsTokens";

type Props = {
  title: string;
  explanation: string;
  children: ReactNode;
  className?: string;
  testId?: string;
};

/** One-sentence explanation → controls → optional help. */
export function SettingsSection({
  title,
  explanation,
  children,
  className = "",
  testId,
}: Props) {
  return (
    <section
      className={`settings-section ${className}`.trim()}
      data-testid={testId}
      aria-label={title}
    >
      <header className="mb-3">
        <h3 className={`text-base font-semibold ${SETTINGS_TEXT.secondary}`}>
          {title}
        </h3>
        <p className={`mt-1 text-sm leading-relaxed ${SETTINGS_TEXT.helper}`}>
          {explanation}
        </p>
      </header>
      <div className={SETTINGS_SURFACE.card}>{children}</div>
    </section>
  );
}
