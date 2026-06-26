"use client";

import {
  createUserLifeArea,
  suppressSmartLifeArea,
} from "@/lib/companionBrain/lifeAreas";
import type { SmartLifeAreaSuggestion } from "@/lib/companionBrain/lifeAreas/types";

type Props = {
  suggestion: SmartLifeAreaSuggestion;
  onAccepted: (lifeAreaId: string) => void;
  onDismiss: () => void;
};

export function SmartLifeAreaSuggestionCard({
  suggestion,
  onAccepted,
  onDismiss,
}: Props) {
  function accept() {
    const area = createUserLifeArea({
      name: suggestion.proposedName,
      rememberForSuggestions: true,
    });
    onAccepted(area.id);
  }

  function notNow() {
    onDismiss();
  }

  function neverAgain() {
    suppressSmartLifeArea(suggestion.proposedName);
    onDismiss();
  }

  return (
    <div
      className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/90 px-4 py-3"
      role="status"
      data-testid="smart-life-area-suggestion"
    >
      <p className="text-base leading-relaxed text-[#4b463f]">
        I&apos;ve noticed you&apos;ve been working on{" "}
        <strong>{suggestion.proposedName}</strong> quite a bit. Would you like me
        to create a <strong>{suggestion.proposedName}</strong> Life Area?
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={accept}
          className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={notNow}
          className="rounded-lg border border-[#c9bfb0] px-4 py-2 text-sm font-semibold text-[#6b635a]"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={neverAgain}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-[#9a8f82] hover:underline"
        >
          Never suggest again
        </button>
      </div>
    </div>
  );
}
