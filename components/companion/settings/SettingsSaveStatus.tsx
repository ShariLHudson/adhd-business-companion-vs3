"use client";

import { SETTINGS_SAVED_MESSAGE } from "@/lib/navigationOrigin";
import { SETTINGS_TEXT } from "./settingsTokens";

type Props = {
  visible: boolean;
  message?: string;
  tone?: "ok" | "error";
  testId?: string;
};

export function SettingsSaveStatus({
  visible,
  message = SETTINGS_SAVED_MESSAGE,
  tone = "ok",
  testId = "settings-save-status",
}: Props) {
  if (!visible) return null;
  return (
    <p
      className={`mt-3 text-sm ${
        tone === "ok" ? SETTINGS_TEXT.accent : "text-[#a85c4a]"
      }`}
      role="status"
      data-testid={testId}
    >
      {message}
    </p>
  );
}

export { SETTINGS_SAVED_MESSAGE };
