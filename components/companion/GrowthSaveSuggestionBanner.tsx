"use client";

import { useEffect, useState } from "react";
import {
  clearGrowthSaveSuggestion,
  getPendingGrowthSaveSuggestion,
  GROWTH_SAVE_DESTINATION_LABEL,
  GROWTH_SAVE_SUGGESTION_UPDATED,
  type GrowthSaveDestination,
} from "@/lib/growth/growthSaveSuggestions";

type Props = {
  onSaveToWins: (text: string) => void;
  onSaveToEvidence: (text: string) => void;
  onSaveToJourney: (text: string) => void;
  onSaveToHighlights: (text: string) => void;
};

const ACTION_HANDLERS: Record<
  GrowthSaveDestination,
  keyof Pick<
    Props,
    "onSaveToWins" | "onSaveToEvidence" | "onSaveToJourney" | "onSaveToHighlights"
  >
> = {
  wins: "onSaveToWins",
  evidence: "onSaveToEvidence",
  journey: "onSaveToJourney",
  highlights: "onSaveToHighlights",
};

export function GrowthSaveSuggestionBanner(props: Props) {
  const [suggestion, setSuggestion] = useState(
    () => getPendingGrowthSaveSuggestion(),
  );

  useEffect(() => {
    const sync = () => setSuggestion(getPendingGrowthSaveSuggestion());
    window.addEventListener(GROWTH_SAVE_SUGGESTION_UPDATED, sync);
    return () =>
      window.removeEventListener(GROWTH_SAVE_SUGGESTION_UPDATED, sync);
  }, []);

  if (!suggestion) return null;

  function handleSave(dest: GrowthSaveDestination) {
    const handlerKey = ACTION_HANDLERS[dest];
    props[handlerKey](suggestion!.text);
    clearGrowthSaveSuggestion();
    setSuggestion(null);
  }

  function dismiss() {
    clearGrowthSaveSuggestion();
    setSuggestion(null);
  }

  return (
    <div
      className="rounded-xl border border-[#c5e0e0] bg-[#f0f8f8] p-4"
      role="status"
      data-testid="growth-save-suggestion"
    >
      <p className="text-sm font-semibold text-[#1f1c19]">
        Worth preserving?
      </p>
      <p className="mt-1 text-sm text-[#4b463f]">{suggestion.text}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestion.destinations.map((dest) => (
          <button
            key={dest}
            type="button"
            onClick={() => handleSave(dest)}
            className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#163c3c]"
          >
            {GROWTH_SAVE_DESTINATION_LABEL[dest]}
          </button>
        ))}
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg border border-[#c9bfb0] px-3 py-1.5 text-xs font-semibold text-[#6b635a] hover:bg-white"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
