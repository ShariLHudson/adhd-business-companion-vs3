"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { JOURNAL_NAME_SUGGESTIONS } from "@/lib/journalGazebo/catalog";
import {
  JOURNAL_CREATION_DEDICATION_CONTINUE,
  JOURNAL_CREATION_DEDICATION_PROMPT,
  JOURNAL_CREATION_DEDICATION_SKIP,
  JOURNAL_CREATION_NAME_PROMPT,
  JOURNAL_TOOLS,
} from "@/lib/journalGazebo/hospitality";
import { defaultJournalConfig } from "@/lib/journalGazebo/store";
import type { JournalCeremonyStep, JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { JournalGazeboCeremonyPage } from "./JournalGazeboCeremonyPage";
import { JournalGazeboHeroJournal } from "./JournalGazeboHeroJournal";

type CreationStep = "name" | "dedication" | "journal-opening" | "ceremony";

type Props = {
  onComplete: (config: JournalGazeboConfig) => void;
  onCancel?: () => void;
  onGiftMoment?: (moment: "desk" | "pond") => void;
};

const JOURNAL_OPEN_MS = 1300;

/**
 * First journal — name, optional dedication, cover opens, today's page.
 * No long setup wizard. Defaults carry the rest.
 */
export function JournalGazeboWritingDeskCreate({
  onComplete,
  onCancel,
}: Props) {
  const [step, setStep] = useState<CreationStep>("name");
  const [draft, setDraft] = useState(() => defaultJournalConfig({ name: "" }));
  const [dedicationDraft, setDedicationDraft] = useState("");
  const [ceremonyStep, setCeremonyStep] = useState<JournalCeremonyStep>(0);
  const [journalOpen, setJournalOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dedicationRef = useRef<HTMLTextAreaElement>(null);

  const patch = useCallback((partial: Partial<JournalGazeboConfig>) => {
    setDraft((current) => ({ ...current, ...partial }));
  }, []);

  useEffect(() => {
    if (step === "name") {
      window.setTimeout(() => nameInputRef.current?.focus(), 400);
    }
    if (step === "dedication") {
      window.setTimeout(() => dedicationRef.current?.focus(), 400);
    }
  }, [step]);

  function commitName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    patch({ name: trimmed, embossedTitle: trimmed });
    setStep("dedication");
  }

  function skipDedication() {
    patch({ dedication: "" });
    beginJournalOpening();
  }

  function saveDedication() {
    patch({ dedication: dedicationDraft.trim() });
    beginJournalOpening();
  }

  function beginJournalOpening() {
    setStep("journal-opening");
    setJournalOpen(false);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.setTimeout(() => {
      setJournalOpen(true);
      window.setTimeout(() => {
        setStep("ceremony");
        setCeremonyStep(0);
      }, reducedMotion ? 80 : JOURNAL_OPEN_MS);
    }, reducedMotion ? 80 : 400);
  }

  function handleCeremonyTurn() {
    const final: JournalGazeboConfig = {
      ...draft,
      name: draft.name.trim() || "My Journey",
      embossedTitle: draft.embossedTitle.trim() || draft.name.trim() || "My Journey",
      dedication: draft.dedication?.trim() || dedicationDraft.trim() || undefined,
      writingMode: "silent",
    };
    onComplete(final);
  }

  const ceremonyVisible = step === "ceremony" || step === "journal-opening";

  return (
    <div className="writing-desk-create" data-creation-step={step}>
      {step === "name" ? (
        <div className="writing-desk-create__panel writing-desk-create__panel--name">
          <p className="writing-desk-create__prompt">{JOURNAL_CREATION_NAME_PROMPT}</p>
          <label className="writing-desk-create__visually-hidden" htmlFor="jg-name">
            Journal name
          </label>
          <input
            ref={nameInputRef}
            id="jg-name"
            className="writing-desk-create__input writing-desk-create__input--name"
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitName(draft.name);
            }}
            placeholder="Or anything you choose"
            autoComplete="off"
          />
          <ul className="writing-desk-create__name-list">
            {JOURNAL_NAME_SUGGESTIONS.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  className="writing-desk-create__name-choice"
                  onClick={() => commitName(name)}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
          {draft.name.trim() ? (
            <button
              type="button"
              className="writing-desk-create__primary"
              onClick={() => commitName(draft.name)}
            >
              {JOURNAL_TOOLS.continue}
            </button>
          ) : null}
        </div>
      ) : null}

      {step === "dedication" ? (
        <div className="writing-desk-create__panel writing-desk-create__panel--dedication">
          <p className="writing-desk-create__prompt">{JOURNAL_CREATION_DEDICATION_PROMPT}</p>
          <label className="writing-desk-create__visually-hidden" htmlFor="jg-dedication">
            Dedication
          </label>
          <textarea
            ref={dedicationRef}
            id="jg-dedication"
            className="writing-desk-create__input writing-desk-create__input--dedication"
            value={dedicationDraft}
            onChange={(e) => setDedicationDraft(e.target.value)}
            rows={4}
            placeholder="A few words for future you…"
          />
          <div className="writing-desk-create__dedication-actions">
            <button
              type="button"
              className="writing-desk-create__secondary"
              onClick={skipDedication}
            >
              {JOURNAL_CREATION_DEDICATION_SKIP}
            </button>
            <button
              type="button"
              className="writing-desk-create__primary"
              onClick={saveDedication}
            >
              {JOURNAL_CREATION_DEDICATION_CONTINUE}
            </button>
          </div>
        </div>
      ) : null}

      {ceremonyVisible ? (
        <div className="writing-desk-create__ceremony-book">
          <JournalGazeboHeroJournal
            config={{
              ...draft,
              embossedTitle: draft.embossedTitle || draft.name,
              dedication: draft.dedication || dedicationDraft.trim() || undefined,
              showSparkFlame: false,
            }}
            moment={step === "ceremony" ? "open" : journalOpen ? "open" : "opening"}
          >
            {step === "ceremony" ? (
              <JournalGazeboCeremonyPage
                step={ceremonyStep}
                config={{
                  ...draft,
                  dedication: draft.dedication || dedicationDraft.trim() || undefined,
                }}
                onTurnPage={handleCeremonyTurn}
              />
            ) : null}
          </JournalGazeboHeroJournal>
        </div>
      ) : null}

      {step === "name" && onCancel ? (
        <button
          type="button"
          className="writing-desk-create__escape"
          onClick={onCancel}
        >
          Return to the letter
        </button>
      ) : null}
    </div>
  );
}
