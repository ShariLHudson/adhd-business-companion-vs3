/**
 * Welcome day index from existing relationship-start signal.
 * Day 1 = first calendar day with the companion (daysSinceStart === 0).
 */

import { daysSinceRelationshipStart } from "@/lib/phase3AdaptiveRelationship";
import {
  FIRST_60_DAYS_GUIDED_LENGTH,
  type ResolveWelcomeDayIndexResult,
  type WelcomeExperiencePhase,
} from "./types";

export function resolveWelcomeExperiencePhase(
  dayIndex: number,
): WelcomeExperiencePhase {
  return dayIndex <= FIRST_60_DAYS_GUIDED_LENGTH ? "guided" : "adaptive";
}

/**
 * Resolve 1-based welcome day index.
 * Reuses `daysSinceRelationshipStart` (Phase 2 firstSessionAt) — no parallel clock.
 */
export function resolveWelcomeDayIndex(
  now = new Date(),
): ResolveWelcomeDayIndexResult {
  const daysSinceStart = Math.max(0, daysSinceRelationshipStart(now));
  const dayIndex = daysSinceStart + 1;
  return {
    dayIndex,
    daysSinceStart,
    phase: resolveWelcomeExperiencePhase(dayIndex),
  };
}

/** True while the member is in the fixed usefulness-guided discovery window. */
export function isGuidedFirst60Days(now = new Date()): boolean {
  return resolveWelcomeDayIndex(now).phase === "guided";
}
