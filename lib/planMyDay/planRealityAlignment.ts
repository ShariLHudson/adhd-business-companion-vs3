/**
 * Plan My Day™ — daily reality alignment with Today's Reality™.
 *
 * Detects when today's commitments may no longer match the user's stated
 * energy, capacity, or motivation — supportive prompts only.
 */

import { getDayState, type DayState } from "../companionStore";
import {
  energyLevelToLegacy,
  labelForEnergyLevel,
  labelForMotivationLevel,
  labelForVibe,
} from "../adjustMyDay";
import { isPlanItemActive } from "./planDayItems";
import type { PlanDayItem } from "./types";

const DISMISS_KEY = "plan-my-day-reality-dismissed-v1";

const HEAVY_COMMITMENT_RE =
  /\b(sales page|webinar|landing page|email sequence|launch|funnel|website|campaign|build|course|program|sales|marketing plan)\b/i;

export type RealityMismatchPrompt = {
  realitySummary: string[];
  reasons: string[];
};

type DismissSnapshot = {
  activeCount: number;
  workloadScore: number;
};

function readDismiss(): DismissSnapshot | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DISMISS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DismissSnapshot;
  } catch {
    return null;
  }
}

export function dismissPlanRealityPrompt(items: PlanDayItem[]): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(
      DISMISS_KEY,
      JSON.stringify({
        activeCount: items.filter(isPlanItemActive).length,
        workloadScore: workloadScore(items),
      }),
    );
  } catch {
    /* ignore */
  }
}

export function resetPlanRealityPromptDismissal(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(DISMISS_KEY);
}

function workloadScore(items: PlanDayItem[]): number {
  let score = 0;
  for (const item of items.filter(isPlanItemActive)) {
    score += 1;
    if (HEAVY_COMMITMENT_RE.test(item.title)) score += 2;
    if (item.projectId) score += 1;
    if (item.durationMinutes && item.durationMinutes >= 60) score += 2;
  }
  return score;
}

function heavyCommitmentCount(items: PlanDayItem[]): number {
  return items.filter(
    (i) => isPlanItemActive(i) && HEAVY_COMMITMENT_RE.test(i.title),
  ).length;
}

function isConstrainedReality(day: DayState): boolean {
  const lowEnergy =
    day.energy === "low" ||
    day.energyLevel === "running-on-fumes" ||
    day.energyLevel === "need-recharge";
  const lowDrive =
    day.overwhelm === "high" ||
    day.motivationLevel === "not-happening" ||
    day.motivationLevel === "dragging" ||
    day.motivationLevel === "need-push";
  const hardVibe =
    day.vibe === "struggling" || day.vibe === "rough-day" || day.vibe === "mixed-bag";
  return lowEnergy || lowDrive || hardVibe;
}

export function summarizeDayReality(day: DayState): string[] {
  const lines: string[] = [];
  if (day.energyLevel) {
    const legacy = energyLevelToLegacy(day.energyLevel);
    if (legacy === "low") lines.push("Low energy");
    else if (legacy === "medium") lines.push("Moderate energy");
  }
  if (
    day.overwhelm === "high" ||
    day.motivationLevel === "not-happening" ||
    day.motivationLevel === "dragging"
  ) {
    lines.push("Limited time or drive");
  }
  if (day.vibe === "struggling" || day.vibe === "rough-day") {
    lines.push("A tougher day emotionally");
  }
  if (lines.length === 0) {
    lines.push(labelForEnergyLevel(day.energyLevel));
    if (day.motivationLevel) {
      lines.push(labelForMotivationLevel(day.motivationLevel));
    }
    if (day.vibe) lines.push(labelForVibe(day.vibe, day.vibeNote));
  }
  return lines.slice(0, 4);
}

export function evaluatePlanRealityMismatch(
  items: PlanDayItem[],
  opts?: { newItemTitle?: string },
): RealityMismatchPrompt | null {
  const day = getDayState();
  if (!day || !isConstrainedReality(day)) return null;

  const active = items.filter(isPlanItemActive);
  if (active.length < 3) return null;

  const score = workloadScore(items);
  const heavy = heavyCommitmentCount(items);
  const newIsHeavy = opts?.newItemTitle
    ? HEAVY_COMMITMENT_RE.test(opts.newItemTitle)
    : false;

  const dismiss = readDismiss();
  if (
    dismiss &&
    active.length <= dismiss.activeCount &&
    score <= dismiss.workloadScore
  ) {
    return null;
  }

  const reasons: string[] = [];

  if (active.length >= 5) {
    reasons.push("Several commitments are now competing for today.");
  }
  if (heavy >= 2) {
    reasons.push("Multiple larger project or launch-style tasks are on the plan.");
  }
  if (newIsHeavy && heavy >= 1) {
    reasons.push("A larger commitment was just added to an already full day.");
  }
  if (score >= 8) {
    reasons.push("Today's time and energy may not match everything on the list.");
  }

  const totalMinutes = active.reduce(
    (sum, i) => sum + (i.durationMinutes ?? 30),
    0,
  );
  if (totalMinutes > 300 && isConstrainedReality(day)) {
    reasons.push("Planned work may exceed realistic capacity for today.");
  }

  if (reasons.length === 0) return null;

  return {
    realitySummary: summarizeDayReality(day),
    reasons,
  };
}
