"use client";

import { useEffect, useState } from "react";
import {
  SettingsDropdown,
  SettingsSaveStatus,
  SettingsSection,
  SETTINGS_SAVED_MESSAGE,
} from "@/components/companion/settings";
import { getPrefs, savePrefs, type HelpMode } from "@/lib/companionStore";
import { sortByDropdownLabel } from "@/lib/dropdownSort";

type StatusMsg = { tone: "ok" | "error"; text: string } | null;

const HELP_MODE_OPTIONS = sortByDropdownLabel(
  [
    {
      value: "step-by-step" as const,
      label: "Step-by-step guidance",
      description: "One small step at a time.",
    },
    {
      value: "ask-first" as const,
      label: "Ask me questions first",
      description: "Clarify before suggesting.",
    },
    {
      value: "direct" as const,
      label: "Direct answers",
      description: "Lead with the answer.",
    },
    {
      value: "concise" as const,
      label: "Concise replies",
      description: "Shorter sentences — still warm.",
    },
    {
      value: "navigate" as const,
      label: "Take me to the right place",
      description: "Point me to the tool that fits.",
    },
  ],
  (o) => o.label,
);

export function HelpModePanel({
  onSaved,
}: {
  onSaved?: (mode: HelpMode) => void;
} = {}) {
  const [helpMode, setHelpMode] = useState<HelpMode>("ask-first");
  const [status, setStatus] = useState<StatusMsg>(null);

  useEffect(() => {
    setHelpMode(getPrefs().helpMode);
  }, []);

  function flash(tone: "ok" | "error", text: string) {
    setStatus({ tone, text });
    window.setTimeout(() => setStatus(null), 2800);
  }

  function selectMode(next: HelpMode) {
    try {
      const saved = savePrefs({ helpMode: next });
      setHelpMode(saved.helpMode);
      onSaved?.(saved.helpMode);
      flash("ok", SETTINGS_SAVED_MESSAGE);
    } catch {
      flash(
        "error",
        "I couldn’t save that preference just now. Your choice is still here, and I’ll keep trying.",
      );
    }
  }

  return (
    <section
      className="help-mode-panel"
      data-testid="help-mode-panel"
      aria-label="Help Mode"
    >
      <SettingsSection
        title="Help Mode"
        explanation="Choose what Shari usually does when you ask for help — clarify, answer, shorten, or guide you somewhere."
        testId="help-mode-section"
      >
        <SettingsDropdown
          id="help-mode"
          label="How should Shari usually help?"
          value={helpMode}
          options={HELP_MODE_OPTIONS}
          onChange={(value) => selectMode(value as HelpMode)}
          testId="help-mode-dropdown"
        />
      </SettingsSection>

      <SettingsSaveStatus
        visible={Boolean(status)}
        message={status?.text ?? SETTINGS_SAVED_MESSAGE}
        tone={status?.tone === "error" ? "error" : "ok"}
        testId="help-mode-status"
      />
    </section>
  );
}
