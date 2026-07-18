"use client";

import type { ReactNode } from "react";
import { SETTINGS_TEXT } from "./settingsTokens";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Short selected-state / helper description — dark text on light surfaces. */
export function SettingsDescription({ children, className = "" }: Props) {
  return (
    <p
      className={`settings-description text-sm leading-relaxed ${SETTINGS_TEXT.helper} ${className}`.trim()}
    >
      {children}
    </p>
  );
}
