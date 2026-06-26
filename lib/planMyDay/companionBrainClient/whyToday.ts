/**
 * Why today? — presentation of Companion Judgment™, not priority scores.
 */

import type { CompanionJudgmentResult } from "@/lib/companionBrain";
import type { PlanDayItem } from "@/lib/planMyDay/types";

export function whyTodayForItem(
  item: PlanDayItem,
  judgment: CompanionJudgmentResult,
): string {
  const title = item.title.trim().toLowerCase();
  const proposal = judgment.proposals.find(
    (p) => p.label.trim().toLowerCase() === title,
  );
  if (proposal?.reason) {
    return humanizeReason(proposal.reason);
  }

  const momentum = judgment.momentum.label?.trim().toLowerCase() ?? "";
  if (momentum && title.includes(momentum)) {
    return "Chosen because completing this unlocks several other things today.";
  }

  if (judgment.dayMode === "health" || item.category === "health") {
    return "Chosen because health leads today — business can wait.";
  }

  if (judgment.dayMode === "family" || item.category === "relationships") {
    return "Chosen because one small courtesy matters — then you're done with work.";
  }

  if (judgment.dayMode === "survival" || judgment.dayMode === "recovery") {
    return "Chosen because it's small, honest, and fits today's energy.";
  }

  if (item.column === "today" || item.column === "doing") {
    return "Chosen because it fits today's reality — not the whole backlog.";
  }

  return "Held nearby when you're ready — not required right now.";
}

function humanizeReason(reason: string): string {
  const r = reason.trim();
  if (/unlock/i.test(r)) {
    return "Chosen because it removes weight and unlocks what comes next.";
  }
  if (/health/i.test(r)) {
    return "Chosen because your health is the plan today.";
  }
  if (/capacity|fit/i.test(r)) {
    return "Chosen because today's energy fits this work.";
  }
  if (/explor|creative/i.test(r)) {
    return "Chosen because exploring first protects creative energy.";
  }
  if (/courtesy|family/i.test(r)) {
    return "Chosen because one professional courtesy, then family.";
  }
  return `Chosen because ${r.charAt(0).toLowerCase()}${r.slice(1)}`;
}

export function defaultWhyTodayPlaceholder(): string {
  return "Why this earned a place on today's board…";
}
