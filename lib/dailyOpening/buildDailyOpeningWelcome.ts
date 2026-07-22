/**
 * Warm Shari welcome copy for the Global Daily Companion Opening card.
 * Structured header: greeting · presence · what you can do · discovery invite.
 */

import { listActiveWorkspaces } from "@/lib/activeWorkspaceRegistry";
import {
  resolveUserDisplayNameSource,
  significantNameTokens,
} from "@/lib/userProfileDisplay";
import {
  resolveFirst60Encouragement,
  resolveFirst60WelcomeLine,
  resolveWelcomeDayIndex,
} from "./first60Days";
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
  /** Subtle discovery line under the welcome (pairs with Show Me Something Helpful). */
  discoveryInviteLine: string;
  /** Joined greeting for back-compat callers and sentence-count gates. */
  welcomeMessage: string;
};

/** @deprecated Prefer SHOW_ME_SOMETHING_HELPFUL_LABEL — discovery is a secondary action, not a fourth card. */
export const SOMETHING_HELPFUL_TO_KNOW_TODAY =
  "Something Helpful to Know Today" as const;

export const SHOW_ME_SOMETHING_HELPFUL_LABEL =
  "Show Me Something Helpful" as const;

const DISCOVERY_INVITE_LINE =
  "I can also show you one helpful part of Spark Estate that you may not have discovered yet.";

const CHOICES_INTRO =
  "You can return to something already in motion, shape today around the time and energy you have, or let me help you decide what would be most useful right now.";

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

function joinWelcomeParts(
  parts: Omit<DailyOpeningWelcomeParts, "welcomeMessage">,
): string {
  return [
    parts.greetingTitle,
    parts.welcomeLine,
    parts.choicesIntro,
    parts.discoveryInviteLine,
  ]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
}

export function buildDailyOpeningWelcomeParts(input: {
  momentKind: DailyOpeningMomentKind;
  memberFirstName?: string | null;
  now?: Date;
  /** When false, do not persist welcome rotation (tests). */
  persistWelcomeRotation?: boolean;
}): DailyOpeningWelcomeParts {
  const name =
    input.memberFirstName?.trim() ||
    resolveDailyOpeningMemberFirstName() ||
    null;
  const now = input.now ?? new Date();
  const { dayIndex } = resolveWelcomeDayIndex(now);
  const persist = input.persistWelcomeRotation !== false;

  if (input.momentKind === "absence-return") {
    // 074 — only claim work is here when registry has active work
    const hasActiveWork = listActiveWorkspaces().length > 0;
    const parts = {
      greetingTitle: name ? `Welcome home, ${name}.` : "Welcome home.",
      welcomeLine: hasActiveWork
        ? "It's good to see you. Your work is still here, and you do not have to catch up on everything today."
        : "It's good to see you. You do not have to catch up on everything today.",
      choicesIntro: CHOICES_INTRO,
      discoveryInviteLine: DISCOVERY_INVITE_LINE,
    };
    return { ...parts, welcomeMessage: joinWelcomeParts(parts) };
  }

  if (input.momentKind === "same-day-return") {
    const parts = {
      greetingTitle: name ? `Welcome back, ${name}.` : "Welcome back.",
      welcomeLine:
        "It's good to see you. You do not have to remember everything or decide it all at once.",
      choicesIntro: CHOICES_INTRO,
      discoveryInviteLine: DISCOVERY_INVITE_LINE,
    };
    return { ...parts, welcomeMessage: joinWelcomeParts(parts) };
  }

  // first-of-day + explicit new day — unique rotating welcome line
  const daily = resolveFirst60WelcomeLine({
    dayIndex,
    persist,
  });
  const parts = {
    greetingTitle: name ? `Welcome back, ${name}.` : "Welcome back.",
    welcomeLine: daily.text,
    choicesIntro: CHOICES_INTRO,
    discoveryInviteLine: DISCOVERY_INVITE_LINE,
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

/**
 * Today's Encouragement — brief rotating thought (all relationship days).
 * Kept as resolveFirst60TeachingSentence for back-compat exports.
 */
export function resolveFirst60TeachingSentence(
  now = new Date(),
  options?: { persist?: boolean },
): string | null {
  const { dayIndex } = resolveWelcomeDayIndex(now);
  return resolveFirst60Encouragement({
    dayIndex,
    persist: options?.persist,
  }).text;
}

/** Alias — prefer this name in First 60 Days Welcome Experience. */
export function resolveTodaysEncouragement(
  now = new Date(),
  options?: { persist?: boolean },
): string | null {
  return resolveFirst60TeachingSentence(now, options);
}

export function countWelcomeSentences(message: string): number {
  return message
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}
