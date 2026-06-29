"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildSuggestedGrowthMoments,
  ignoreSuggestedMoment,
  markSuggestedMomentProcessed,
} from "@/lib/suggestedGrowthMoments";
import {
  clearGrowthSaveSuggestion,
  getPendingGrowthSaveSuggestion,
  GROWTH_SAVE_SUGGESTION_UPDATED,
} from "@/lib/growth/growthSaveSuggestions";
import { createSavedGrowthWin } from "@/lib/growthWinsStore";
import { createEvidenceEntry, EMPTY_EVIDENCE_DRAFT } from "@/lib/evidenceBankStore";

/** Spark-detected reminder — slides in only when something is worth remembering. */
export function GrowthCelebrationMoment() {
  const [tick, setTick] = useState(0);
  const [dismissing, setDismissing] = useState(false);
  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const onUpdate = () => reload();
    window.addEventListener("companion-suggested-growth-updated", onUpdate);
    window.addEventListener(GROWTH_SAVE_SUGGESTION_UPDATED, onUpdate);
    return () => {
      window.removeEventListener("companion-suggested-growth-updated", onUpdate);
      window.removeEventListener(GROWTH_SAVE_SUGGESTION_UPDATED, onUpdate);
    };
  }, [reload]);

  const saveSuggestion = useMemo(
    () => getPendingGrowthSaveSuggestion(),
    [tick],
  );
  const suggestedMoment = useMemo(
    () => buildSuggestedGrowthMoments()[0] ?? null,
    [tick],
  );

  const moment: { text: string; sourceId?: string } | null = saveSuggestion
    ? { text: saveSuggestion.text }
    : suggestedMoment
      ? {
          text: suggestedMoment.whatHappened,
          sourceId: suggestedMoment.sourceId,
        }
      : null;

  if (!moment || dismissing) return null;

  function finish(sourceId?: string) {
    if (sourceId) markSuggestedMomentProcessed(sourceId);
    clearGrowthSaveSuggestion();
    setDismissing(true);
    window.setTimeout(() => {
      setDismissing(false);
      reload();
    }, 480);
  }

  function saveWin() {
    createSavedGrowthWin({
      whatHappened: moment!.text,
      ts: new Date().toISOString(),
      icon: "win",
      attachments: [],
    });
    finish(moment!.sourceId);
  }

  function saveEvidence() {
    createEvidenceEntry({
      ...EMPTY_EVIDENCE_DRAFT,
      whatHappened: moment!.text,
      whatThisProves: moment!.text,
      category: "Personal Growth",
      attachments: [],
    });
    finish(moment!.sourceId);
  }

  function dismiss() {
    if (moment?.sourceId) ignoreSuggestedMoment(moment.sourceId);
    clearGrowthSaveSuggestion();
    setDismissing(true);
    window.setTimeout(() => {
      setDismissing(false);
      reload();
    }, 320);
  }

  const reminderText =
    moment.text?.trim() || "Something from today is worth holding onto.";

  return (
    <section
      className="growth-celebration growth-celebration--enter"
      role="status"
      data-testid="growth-celebration-moment"
    >
      <h3 className="growth-celebration__title">Spark noticed something today.</h3>
      <p className="growth-celebration__label">Today&apos;s Reminder</p>
      <p className="growth-celebration__moment">{reminderText}</p>
      <div className="growth-celebration__actions">
        <button type="button" className="growth-celebration__win" onClick={saveWin}>
          Save as a Win
        </button>
        <button
          type="button"
          className="growth-celebration__evidence"
          onClick={saveEvidence}
        >
          Save to Evidence Vault
        </button>
        <button type="button" className="growth-celebration__later" onClick={dismiss}>
          Later
        </button>
      </div>
    </section>
  );
}
