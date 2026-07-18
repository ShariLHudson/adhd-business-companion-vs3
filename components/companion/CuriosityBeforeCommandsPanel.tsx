"use client";

import { useEffect, useState } from "react";
import {
  SettingsDropdown,
  SettingsHelpAccordion,
  SettingsSaveStatus,
  SettingsSection,
  SETTINGS_SAVED_MESSAGE,
  SETTINGS_TEXT,
} from "@/components/companion/settings";
import {
  CURIOSITY_MODE_OPTIONS,
  buildCuriosityBeforeCommandsPrompt,
  getCuriosityBeforeCommandsPreference,
  saveCuriosityBeforeCommandsPreference,
  subscribeCuriosityBeforeCommands,
  type CuriosityBeforeCommandsMode,
} from "@/lib/curiosityBeforeCommands";

type StatusMsg = { tone: "ok" | "error"; text: string } | null;

export function CuriosityBeforeCommandsPanel() {
  const [mode, setMode] = useState<CuriosityBeforeCommandsMode>("situational");
  const [status, setStatus] = useState<StatusMsg>(null);
  const [previewSeed, setPreviewSeed] = useState(0);

  function refresh() {
    setMode(getCuriosityBeforeCommandsPreference().mode);
  }

  useEffect(() => {
    refresh();
    return subscribeCuriosityBeforeCommands(refresh);
  }, []);

  function flash(tone: "ok" | "error", text: string) {
    setStatus({ tone, text });
    window.setTimeout(() => setStatus(null), 2800);
  }

  function selectMode(next: CuriosityBeforeCommandsMode) {
    const result = saveCuriosityBeforeCommandsPreference({ mode: next });
    if (!result.ok) {
      flash(
        "error",
        "I couldn’t save that preference just now. Your choice is still here, and I’ll keep trying.",
      );
      return;
    }
    setMode(result.preference.mode);
    flash("ok", SETTINGS_SAVED_MESSAGE);
  }

  const previewCuriosity = buildCuriosityBeforeCommandsPrompt(
    {
      actionLabel: "the kitchen",
      knownBenefit: "a little more calm at home",
      preferSmallStep: true,
      variationSeed: previewSeed,
    },
    { mode },
  );
  const previewDirect = buildCuriosityBeforeCommandsPrompt(
    {
      actionLabel: "reply to Susan",
      forceDirect: true,
      preferSmallStep: true,
    },
    { mode },
  );

  const dropdownOptions = CURIOSITY_MODE_OPTIONS.map((option) => ({
    value: option.id,
    label: option.label,
    description: option.description,
  }));

  return (
    <section
      className="curiosity-before-commands-panel"
      data-testid="curiosity-before-commands-panel"
      aria-label="How Shari Invites Me"
    >
      <SettingsSection
        title="How Shari Invites Me"
        explanation="When an action is optional and not urgent, Shari can invite you with a question that connects the step to something meaningful — instead of sounding like a command."
        testId="how-shari-invites-section"
      >
        <SettingsDropdown
          id="curiosity-invite-mode"
          label="How should Shari usually invite optional actions?"
          value={mode}
          options={dropdownOptions}
          onChange={(value) => selectMode(value as CuriosityBeforeCommandsMode)}
          testId="curiosity-mode-dropdown"
        />

        <SettingsHelpAccordion title="See examples" testId="curiosity-examples">
          <p className={`font-semibold ${SETTINGS_TEXT.secondary}`}>
            Instead of pressure
          </p>
          <p className="mt-1">“You need to work on the kitchen.”</p>
          <p className={`mt-3 font-semibold ${SETTINGS_TEXT.secondary}`}>
            Curiosity invitation
          </p>
          <p className="mt-1">
            “How would you feel if one part of the kitchen were clearer today?”
          </p>
          <p className={`mt-3 font-semibold ${SETTINGS_TEXT.secondary}`}>
            Live preview
          </p>
          <p className="mt-1" data-testid="curiosity-preview">
            {previewCuriosity}
          </p>
          <button
            type="button"
            className={`mt-2 text-sm font-semibold ${SETTINGS_TEXT.accent}`}
            onClick={() => setPreviewSeed((n) => n + 1)}
          >
            Another wording
          </button>
          <p
            className={`mt-3 text-xs font-semibold uppercase tracking-wide ${SETTINGS_TEXT.helper}`}
          >
            Urgent / direct stays plain
          </p>
          <p className="mt-1" data-testid="curiosity-preview-direct">
            {previewDirect}
          </p>
          <p className={`mt-3 ${SETTINGS_TEXT.helper}`}>
            Urgent notices, fixed calendar times, and moments when you ask for
            direct language stay clear and concise.
          </p>
        </SettingsHelpAccordion>
      </SettingsSection>

      <SettingsSaveStatus
        visible={Boolean(status)}
        message={status?.text ?? SETTINGS_SAVED_MESSAGE}
        tone={status?.tone === "error" ? "error" : "ok"}
        testId="curiosity-before-commands-status"
      />
    </section>
  );
}
