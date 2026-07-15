/**
 * Warm Shari welcome copy for the Global Daily Companion Opening card.
 * Keep to two or three short sentences — never a fourth main choice.
 */

import { daysSinceRelationshipStart } from "@/lib/phase3AdaptiveRelationship";
import type { DailyOpeningEntryPoint } from "./types";

export type DailyOpeningMomentKind =
  | "first-of-day"
  | "same-day-return"
  | "absence-return"
  | "explicit-new-day";

const FIRST_60_TEACHING = [
  "Personalizing your Business Estate is optional, but every detail you add helps me support you more personally.",
  "Your Client Avatar helps me make better suggestions for your offers, content, and messaging.",
  "Spark remembers what matters so you do not have to hold it all alone.",
] as const;

export function resolveDailyOpeningMomentKind(
  entryPoint: DailyOpeningEntryPoint,
  alreadyPresentedToday: boolean,
): DailyOpeningMomentKind {
  if (entryPoint === "absence-return") return "absence-return";
  if (entryPoint === "first-platform-opening") return "first-of-day";
  if (alreadyPresentedToday) return "same-day-return";
  if (entryPoint === "settings-new-day" || entryPoint === "explicit-new-day") {
    return "first-of-day";
  }
  return "explicit-new-day";
}

export function buildDailyOpeningWelcomeMessage(input: {
  momentKind: DailyOpeningMomentKind;
  memberFirstName?: string | null;
}): string {
  const name = input.memberFirstName?.trim() || null;

  if (input.momentKind === "absence-return") {
    return name
      ? `Welcome home, ${name}. Your work is still here, and we do not need to catch up on everything today. Let's choose one small place to begin.`
      : "Welcome home. Your work is still here, and we do not need to catch up on everything today. Let's choose one small place to begin.";
  }

  if (input.momentKind === "same-day-return") {
    return name
      ? `Welcome back, ${name}. Let's choose the most helpful place to pick up from here.`
      : "Welcome back. Let's choose the most helpful place to pick up from here.";
  }

  // first-of-day + explicit new day — two or three short sentences
  if (name) {
    return `Good morning, ${name}. I'm glad you're here. We can keep today simple — choose what would help most, and I'll take you there.`;
  }
  return "Good morning. I'm glad you're here. We can keep today simple — choose what would help most, and I'll take you there.";
}

/** One short teaching sentence during the first 60 days — never a fourth choice. */
export function resolveFirst60TeachingSentence(
  now = new Date(),
): string | null {
  const days = daysSinceRelationshipStart(now);
  if (days < 0 || days >= 60) return null;
  const index = days % FIRST_60_TEACHING.length;
  return FIRST_60_TEACHING[index] ?? null;
}

export function countWelcomeSentences(message: string): number {
  return message
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}
