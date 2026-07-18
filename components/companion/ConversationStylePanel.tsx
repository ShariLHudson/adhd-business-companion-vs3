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
import { AI_TONE_GUIDES } from "@/lib/aiToneGuide";
import { getPrefs, savePrefs, type AiTone } from "@/lib/companionStore";
import { sortByDropdownLabel } from "@/lib/dropdownSort";

type StatusMsg = { tone: "ok" | "error"; text: string } | null;

const TONE_OPTIONS = sortByDropdownLabel(
  AI_TONE_GUIDES.map((tone) => ({
    value: tone.id,
    label: tone.label,
    description: tone.desc,
  })),
  (o) => o.label,
);

export function ConversationStylePanel({
  onSaved,
}: {
  onSaved?: (tone: AiTone) => void;
} = {}) {
  const [aiTone, setAiTone] = useState<AiTone>("balanced");
  const [status, setStatus] = useState<StatusMsg>(null);

  useEffect(() => {
    setAiTone(getPrefs().aiTone);
  }, []);

  function flash(tone: "ok" | "error", text: string) {
    setStatus({ tone, text });
    window.setTimeout(() => setStatus(null), 2800);
  }

  function selectTone(next: AiTone) {
    try {
      const saved = savePrefs({ aiTone: next });
      setAiTone(saved.aiTone);
      onSaved?.(saved.aiTone);
      flash("ok", SETTINGS_SAVED_MESSAGE);
    } catch {
      flash(
        "error",
        "I couldn’t save that preference just now. Your choice is still here, and I’ll keep trying.",
      );
    }
  }

  const selected = AI_TONE_GUIDES.find((t) => t.id === aiTone);

  return (
    <section
      className="conversation-style-panel"
      data-testid="conversation-style-panel"
      aria-label="Conversation Style"
    >
      <SettingsSection
        title="Conversation Style"
        explanation="Choose how you’d generally like Shari to communicate. This is a long-term preference — it changes delivery, not who she is."
        testId="conversation-style-section"
      >
        <SettingsDropdown
          id="conversation-style-tone"
          label="How should Shari usually sound?"
          value={aiTone}
          options={TONE_OPTIONS}
          onChange={(value) => selectTone(value as AiTone)}
          testId="conversation-style-dropdown"
        />

        {selected ? (
          <SettingsHelpAccordion
            title="More about this style"
            testId="conversation-style-learn-more"
          >
            <p className={`font-semibold ${SETTINGS_TEXT.secondary}`}>
              Feels like
            </p>
            <p className="mt-1">{selected.feelsLike}</p>
            <p className={`mt-3 font-semibold ${SETTINGS_TEXT.secondary}`}>
              Best for
            </p>
            <p className="mt-1">{selected.bestFor}</p>
            <p className={`mt-3 font-semibold ${SETTINGS_TEXT.secondary}`}>
              What changes
            </p>
            <p className="mt-1">{selected.whatChanges}</p>
            <p className={`mt-3 font-semibold ${SETTINGS_TEXT.secondary}`}>
              Example
            </p>
            <p className="mt-1 italic">{selected.example}</p>
            <p className={`mt-4 text-sm ${SETTINGS_TEXT.helper}`}>
              If today is different, tell Shari — or update Today’s Reality —
              and she’ll adapt for the day without changing this setting.
            </p>
          </SettingsHelpAccordion>
        ) : null}
      </SettingsSection>

      <SettingsSaveStatus
        visible={Boolean(status)}
        message={status?.text ?? SETTINGS_SAVED_MESSAGE}
        tone={status?.tone === "error" ? "error" : "ok"}
        testId="conversation-style-status"
      />
    </section>
  );
}
