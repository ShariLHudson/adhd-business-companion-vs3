"use client";

import { useState } from "react";
import {
  JOURNAL_CREATION_INTRO,
  JOURNAL_CREATION_STEP_HINTS,
  JOURNAL_CREATION_STEP_OPENERS,
  JOURNAL_CREATION_STEP_TITLES,
  JOURNAL_DESK_INTRO,
  JOURNAL_TOOLS,
} from "@/lib/journalGazebo/hospitality";
import {
  JOURNAL_FONT_OPTIONS,
  JOURNAL_INK_OPTIONS,
  JOURNAL_LEATHER_OPTIONS,
  JOURNAL_NAME_SUGGESTIONS,
  JOURNAL_PAPER_OPTIONS,
  JOURNAL_WRITING_MODE_OPTIONS,
} from "@/lib/journalGazebo/catalog";
import { defaultJournalConfig } from "@/lib/journalGazebo/store";
import type { JournalCreationStep, JournalGazeboConfig } from "@/lib/journalGazebo/types";

const STEPS: JournalCreationStep[] = [
  "name",
  "paper",
  "writing-hand",
  "cover",
  "presence",
];

type Props = {
  initialConfig?: JournalGazeboConfig;
  variant?: "create" | "desk";
  prototypeMode?: boolean;
  onComplete: (config: JournalGazeboConfig) => void;
  onCancel?: () => void;
  finalLabel?: string;
};

export function JournalGazeboCreationWizard({
  initialConfig,
  variant = "create",
  prototypeMode = false,
  onComplete,
  onCancel,
  finalLabel = JOURNAL_TOOLS.beginWriting,
}: Props) {
  const steps = prototypeMode
    ? STEPS.filter((s) => s !== "cover")
    : STEPS;
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState(() => initialConfig ?? defaultJournalConfig());

  const step = steps[stepIndex]!;
  const isLast = stepIndex === steps.length - 1;
  const stepHint = JOURNAL_CREATION_STEP_HINTS[step];
  const stepOpener =
    JOURNAL_CREATION_STEP_OPENERS[
      STEPS.indexOf(step as (typeof STEPS)[number])
    ] ?? "";

  function patch(partial: Partial<JournalGazeboConfig>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function goNext() {
    if (isLast) {
      onComplete({ ...draft, name: draft.name.trim() || "Daily Reflections" });
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (stepIndex === 0) {
      onCancel?.();
      return;
    }
    setStepIndex((i) => i - 1);
  }

  return (
    <div className="journal-gazebo__wizard">
      <div className="journal-gazebo__wizard-plate">
        {variant === "create" && stepIndex === 0 ? (
          <p className="journal-gazebo__wizard-intro">{JOURNAL_CREATION_INTRO}</p>
        ) : null}
        {variant === "desk" && stepIndex === 0 ? (
          <p className="journal-gazebo__wizard-intro">{JOURNAL_DESK_INTRO}</p>
        ) : null}
        <p className="journal-gazebo__wizard-kicker">{stepOpener}</p>
        <h2 className="journal-gazebo__wizard-title">
          {JOURNAL_CREATION_STEP_TITLES[step]}
        </h2>
        <p className="journal-gazebo__wizard-hint">{stepHint}</p>

        {step === "name" ? (
          <div className="journal-gazebo__wizard-panel">
            <label className="journal-gazebo__wizard-label" htmlFor="jg-name">
              A name for your journal
            </label>
            <input
              id="jg-name"
              className="journal-gazebo__wizard-input"
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Daily Reflections"
              autoFocus
            />
            <div className="journal-gazebo__wizard-chips">
              {JOURNAL_NAME_SUGGESTIONS.map((name) => (
                <button
                  key={name}
                  type="button"
                  className="journal-gazebo__wizard-chip"
                  onClick={() => patch({ name })}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === "paper" ? (
          <div className="journal-gazebo__wizard-panel journal-gazebo__wizard-panel--grid">
            {JOURNAL_PAPER_OPTIONS.map((paper) => (
              <button
                key={paper.id}
                type="button"
                className={[
                  "journal-gazebo__wizard-swatch",
                  draft.paperStyle === paper.id
                    ? "journal-gazebo__wizard-swatch--active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-paper={paper.id}
                onClick={() => patch({ paperStyle: paper.id })}
              >
                {paper.label}
              </button>
            ))}
          </div>
        ) : null}

        {step === "writing-hand" ? (
          <div className="journal-gazebo__wizard-panel">
            <p className="journal-gazebo__wizard-subhead">Lettering</p>
            <div className="journal-gazebo__wizard-chips">
              {JOURNAL_FONT_OPTIONS.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  className={[
                    "journal-gazebo__wizard-chip",
                    draft.fontId === font.id
                      ? "journal-gazebo__wizard-chip--active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ fontFamily: font.family }}
                  onClick={() => patch({ fontId: font.id })}
                >
                  {font.label}
                </button>
              ))}
            </div>
            <p className="journal-gazebo__wizard-subhead">Ink</p>
            <div className="journal-gazebo__wizard-inks">
              {JOURNAL_INK_OPTIONS.map((ink) => (
                <button
                  key={ink.id}
                  type="button"
                  className={[
                    "journal-gazebo__wizard-ink",
                    draft.inkColor === ink.id
                      ? "journal-gazebo__wizard-ink--active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => patch({ inkColor: ink.id })}
                  title={ink.label}
                >
                  <span
                    className="journal-gazebo__wizard-ink-dot"
                    style={{ background: ink.css }}
                  />
                  <span className="journal-gazebo__wizard-ink-label">{ink.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {prototypeMode && variant === "create" && stepIndex === 0 ? (
          <p className="journal-gazebo__wizard-prototype-note">
            Cover &amp; print — coming soon. This pass is about how arrival and
            writing feel.
          </p>
        ) : null}

        {step === "cover" ? (
          <div className="journal-gazebo__wizard-panel">
            <p className="journal-gazebo__wizard-subhead">Leather color</p>
            <div className="journal-gazebo__wizard-leathers">
              {JOURNAL_LEATHER_OPTIONS.map((leather) => (
                <button
                  key={leather.id}
                  type="button"
                  className={[
                    "journal-gazebo__wizard-leather",
                    draft.leatherColor === leather.id
                      ? "journal-gazebo__wizard-leather--active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => patch({ leatherColor: leather.id })}
                  title={leather.label}
                >
                  <span
                    className="journal-gazebo__wizard-leather-swatch"
                    style={{ background: leather.swatch }}
                  />
                  {leather.label}
                </button>
              ))}
            </div>
            <label className="journal-gazebo__wizard-label" htmlFor="jg-emboss">
              Embossed title (optional)
            </label>
            <input
              id="jg-emboss"
              className="journal-gazebo__wizard-input"
              value={draft.embossedTitle}
              onChange={(e) => patch({ embossedTitle: e.target.value })}
              placeholder={draft.name || "Your journal"}
            />
            <label className="journal-gazebo__wizard-check">
              <input
                type="checkbox"
                checked={draft.showSparkFlame}
                onChange={(e) => patch({ showSparkFlame: e.target.checked })}
              />
              Spark flame on the cover
            </label>
          </div>
        ) : null}

        {step === "presence" ? (
          <div className="journal-gazebo__wizard-panel journal-gazebo__wizard-panel--stack">
            {JOURNAL_WRITING_MODE_OPTIONS.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={[
                  "journal-gazebo__wizard-mode",
                  draft.writingMode === mode.id
                    ? "journal-gazebo__wizard-mode--active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => patch({ writingMode: mode.id })}
              >
                <span className="journal-gazebo__wizard-mode-title">{mode.label}</span>
                <span className="journal-gazebo__wizard-mode-desc">
                  {mode.description}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="journal-gazebo__wizard-nav">
          <button type="button" className="journal-gazebo__wizard-nav-btn" onClick={goBack}>
            {stepIndex === 0 ? JOURNAL_TOOLS.backToWelcome : JOURNAL_TOOLS.back}
          </button>
          <button
            type="button"
            className="journal-gazebo__wizard-nav-btn journal-gazebo__wizard-nav-btn--primary"
            onClick={goNext}
          >
            {isLast ? finalLabel : JOURNAL_TOOLS.continue}
          </button>
        </div>
      </div>
    </div>
  );
}
