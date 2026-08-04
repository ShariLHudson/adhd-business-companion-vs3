"use client";

import { outcomeGoalLabel } from "@/lib/goals/goalLinking";
import { listOutcomeGoals } from "@/lib/goals/outcomeGoals";

export function PlanItemGoalBadge({
  outcomeGoalId,
}: {
  outcomeGoalId?: string;
}) {
  if (!outcomeGoalId) return null;
  const label =
    outcomeGoalLabel(outcomeGoalId, listOutcomeGoals()) ?? "Linked goal";
  return (
    <span className="ml-2 inline-block max-w-[12rem] truncate rounded-full bg-[#f0f8f8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1e4f4f]">
      → {label}
    </span>
  );
}
