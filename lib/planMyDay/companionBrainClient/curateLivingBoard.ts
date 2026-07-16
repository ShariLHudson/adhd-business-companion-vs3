/**
 * Curate today's board — companion holds complexity, user sees decisions only.
 */

import type { CompanionJudgmentResult } from "@/lib/companionBrain";
import { resolvePlanMyDayPriorityCap } from "@/lib/patternAwareness";
import type { PlanDayItem, PlanItemColumn } from "@/lib/planMyDay/types";
import { saveTodayPlanItems } from "@/lib/planMyDay/planDayItems";
import { whyTodayForItem } from "./whyToday";

export const FOCUS_CAP = 3;
export const READY_CAP = 8;

function focusCapForToday(): number {
  return resolvePlanMyDayPriorityCap() ?? FOCUS_CAP;
}

function isFocusCandidate(
  item: PlanDayItem,
  judgment: CompanionJudgmentResult,
): boolean {
  if (item.column === "today" || item.column === "doing") return true;
  const title = item.title.trim().toLowerCase();
  const proposals = new Set(
    judgment.proposals.map((p) => p.label.trim().toLowerCase()),
  );
  if (proposals.has(title)) return true;
  const momentum = judgment.momentum.label?.trim().toLowerCase() ?? "";
  return Boolean(momentum && title.includes(momentum));
}

/**
 * Park excess items — companion manages the long list.
 */
export function curatePlanBoardForJudgment(
  items: PlanDayItem[],
  judgment: CompanionJudgmentResult,
): PlanDayItem[] {
  let focusCount = 0;
  let readyCount = 0;

  const curated = items.map((item) => {
    if (item.done || item.column === "done") return item;

    const why = item.notes?.trim()
      ? item.notes
      : whyTodayForItem(item, judgment);

    // Member-chosen day areas (manual adds) are not re-bucketed by capacity.
    if (item.source === "manual") {
      return { ...item, notes: why };
    }

    if (isFocusCandidate(item, judgment)) {
      if (focusCount < focusCapForToday()) {
        focusCount += 1;
        const column: PlanItemColumn =
          item.column === "doing" ? "doing" : "today";
        return { ...item, column, notes: why };
      }
    }

    if (item.column !== "parked" && readyCount < READY_CAP) {
      readyCount += 1;
      const column: PlanItemColumn = "ready";
      return { ...item, column, notes: why };
    }

    if (item.column === "parked") return item;
    const parked: PlanItemColumn = "parked";
    return { ...item, column: parked, notes: why };
  });

  return saveTodayPlanItems(curated);
}

export function countHeldByCompanion(items: PlanDayItem[]): number {
  return items.filter((i) => !i.done && i.column === "parked").length;
}
