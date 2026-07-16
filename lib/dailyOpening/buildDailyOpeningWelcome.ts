/**
 * Warm Shari welcome copy for the Global Daily Companion Opening card.
 * Structured header: greeting title · welcome line · three-choice intro.
 */

import { daysSinceRelationshipStart } from "@/lib/phase3AdaptiveRelationship";
import {
  resolveUserDisplayNameSource,
  significantNameTokens,
} from "@/lib/userProfileDisplay";
import type { DailyOpeningEntryPoint } from "./types";

export type DailyOpeningMomentKind =
  | "first-of-day"
  | "same-day-return"
  | "absence-return"
  | "explicit-new-day";

export type DailyOpeningWelcomeParts = {
  greetingTitle: string;
  welcomeLine: string;
  choicesIntro: string;
  /** Joined greeting for back-compat callers and sentence-count gates. */
  welcomeMessage: string;
};

const FIRST_60_TEACHING = [
  "Personalizing your Business Estate is optional, but every detail you add helps me support you more personally.",
  "Your Client Avatar helps me make better suggestions for your offers, content, and messaging.",
  "Spark remembers what matters so you do not have to hold it all alone.",
] as const;

export const SOMETHING_HELPFUL_TO_KNOW_TODAY =
  "Something Helpful to Know Today" as const;

const CHOICES_INTRO =
  "Three simple ways to begin — pick what would help most, and I'll take you there.";

/** Preferred name first, then legal name — first significant token only. */
export function resolveDailyOpeningMemberFirstName(): string | null {
  const source = resolveUserDisplayNameSource();
  if (!source) return null;
  const tokens = significantNameTokens(source);
  return tokens[0] ?? null;
}

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

function joinWelcomeParts(parts: Omit<DailyOpeningWelcomeParts, "welcomeMessage">): string {
  return [parts.greetingTitle, parts.welcomeLine, parts.choicesIntro]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
}

export function buildDailyOpeningWelcomeParts(input: {
  momentKind: DailyOpeningMomentKind;
  memberFirstName?: string | null;
}): DailyOpeningWelcomeParts {
  const name =
    input.memberFirstName?.trim() ||
    resolveDailyOpeningMemberFirstName() ||
    null;

  if (input.momentKind === "absence-return") {
    const parts = {
      greetingTitle: name ? `Welcome home, ${name}.` : "Welcome home.",
      welcomeLine:
        "Your work is still here, and we do not need to catch up on everything today.",
      choicesIntro: "Let's choose one small place to begin.",
    };
    return { ...parts, welcomeMessage: joinWelcomeParts(parts) };
  }

  if (input.momentKind === "same-day-return") {
    const parts = {
      greetingTitle: name ? `Welcome back, ${name}.` : "Welcome back.",
      welcomeLine: "I'm glad you're here.",
      choicesIntro:
        "Three simple ways to pick up — choose what would help most, and I'll take you there.",
    };
    return { ...parts, welcomeMessage: joinWelcomeParts(parts) };
  }

  // first-of-day + explicit new day
  const parts = {
    greetingTitle: name ? `Good morning, ${name}.` : "Good morning.",
    welcomeLine: "I'm glad you're here.",
    choicesIntro: CHOICES_INTRO,
  };
  return { ...parts, welcomeMessage: joinWelcomeParts(parts) };
}

/** Back-compat: single joined welcome string. */
export function buildDailyOpeningWelcomeMessage(input: {
  momentKind: DailyOpeningMomentKind;
  memberFirstName?: string | null;
}): string {
  return buildDailyOpeningWelcomeParts(input).welcomeMessage;
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
