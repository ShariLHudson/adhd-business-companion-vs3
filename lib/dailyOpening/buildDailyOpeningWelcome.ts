/**
 * Warm Shari welcome copy for the Global Daily Companion Opening card.
 * Structured header: greeting · presence · what you can do · discovery invite.
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
  /** Subtle discovery line under the welcome (pairs with Show Me Something Helpful). */
  discoveryInviteLine: string;
  /** Joined greeting for back-compat callers and sentence-count gates. */
  welcomeMessage: string;
};

const FIRST_60_TEACHING = [
  "Personalizing your Business Estate is optional, but every detail you add helps me support you more personally.",
  "Your Client Avatar helps me make better suggestions for your offers, content, and messaging.",
  "Spark remembers what matters so you do not have to hold it all alone.",
  "Spark can notice strategies that seem to help you — like shorter sessions or fewer priorities. Nothing becomes a lasting pattern unless you choose to keep it.",
] as const;

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
}): DailyOpeningWelcomeParts {
  const name =
    input.memberFirstName?.trim() ||
    resolveDailyOpeningMemberFirstName() ||
    null;

  if (input.momentKind === "absence-return") {
    const parts = {
      greetingTitle: name ? `Welcome home, ${name}.` : "Welcome home.",
      welcomeLine:
        "It's good to see you. Your work is still here, and you do not have to catch up on everything today.",
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

  // first-of-day + explicit new day
  const parts = {
    greetingTitle: name ? `Welcome back, ${name}.` : "Welcome back.",
    welcomeLine:
      "It's good to see you. You do not have to remember everything or decide it all at once.",
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
