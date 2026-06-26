"use client";

import type { FlexiblePlanningContext } from "@/lib/planMyDay/companionBrainClient/flexiblePlanning";

type Props = {
  context: FlexiblePlanningContext;
  onUseSuggestions: () => void;
};

/** Quiet reminder that Shari's suggestions remain available after building your own way. */
export function PlanDaySuggestionsReminder({ context, onUseSuggestions }: Props) {
  if (context.suggestionCount <= 0) return null;

  return (
    <div
      className="rounded-xl border border-dashed border-[#c9bfb0] bg-[#faf7f2]/80 px-4 py-3"
      role="status"
      data-testid="plan-day-suggestions-reminder"
    >
      <p className="text-sm leading-relaxed text-[#6b635a]">
        Today&apos;s suggestions ({context.suggestionCount}) are still here if
        you want a different direction — nothing was lost.
      </p>
      <button
        type="button"
        onClick={onUseSuggestions}
        className="mt-2 text-sm font-semibold text-[#1e4f4f] hover:underline"
      >
        Use Shari&apos;s suggestions
      </button>
    </div>
  );
}
