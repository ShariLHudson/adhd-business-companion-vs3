/**
 * P0.7.2 — Overwhelm + today/start routing.
 * Help-me-start-today is plan routing, not relationship reflection.
 */

import { adaptMyDayOfferLine } from "./adaptMyDayChatRouting";
import type { AppSection } from "./companionUi";
import type { WorkspaceOffer } from "./workspaceMode";

export type OverwhelmTodayRoute =
  | "plan_primary"
  | "adapt_primary"
  | "brain_dump_primary";

const BRAIN_DUMP_STRONG_RE =
  /\b(?:brain (?:is )?spinning|thoughts everywhere|mind racing|need to dump|too many thoughts|get (?:this|it) out of my head|dump everything)\b/i;

const ADAPT_TODAY_ADJUST_RE =
  /\b(?:my plan changed|need to adjust today|adjust(?:ing)? today|help adjusting|need to adapt(?: today)?)\b/i;

function isAdaptPrimaryRoute(text: string): boolean {
  const t = text.trim();
  if (ADAPT_TODAY_ADJUST_RE.test(t)) return true;
  if (
    /\b(?:today changed|my energy changed)\b/i.test(t) &&
    /\b(?:adapt|adjust)\b/i.test(t)
  ) {
    return true;
  }
  return false;
}

const START_TODAY_SIGNAL_RE =
  /\b(?:not sure where to start|don'?t know (?:what to (?:work on|do) first|where to start)|where (?:do i |should i )?start|what (?:should i |do i )?(?:work on|do) first|too much to do|need help getting started|can'?t decide (?:what to work on|where to start)|not sure what to work on)\b/i;

export const OVERWHELM_TODAY_STAY_HERE_GUIDANCE =
  "Let's start with one thing. What feels most urgent today? Offer a few concrete options if you know them from context — no recap, no relationship reflection.";

export function isUnderstandOverwhelmQuestion(text: string): boolean {
  const t = text.trim();
  return /\bwhy do i\b/i.test(t) && /\boverwhelm/i.test(t);
}

export function isOverwhelmTodayStartIntent(text: string): boolean {
  const t = text.trim();
  if (!t || isUnderstandOverwhelmQuestion(t)) return false;

  const hasToday = /\b(?:today|this morning|right now)\b/i.test(t);
  const hasOverwhelm = /\boverwhelm/i.test(t);

  if (/\btoday feels overwhelming\b/i.test(t)) return true;
  if (/\b(?:too much|so much) to do today\b/i.test(t)) return true;
  if (/^i need help getting started\.?$/i.test(t)) return true;
  if (hasOverwhelm && START_TODAY_SIGNAL_RE.test(t)) return true;
  if (hasOverwhelm && hasToday && /\b(?:start|work on|first|getting started)\b/i.test(t)) {
    return true;
  }
  if (START_TODAY_SIGNAL_RE.test(t)) return true;
  if (START_TODAY_SIGNAL_RE.test(t) && hasToday) return true;

  return false;
}

export function detectOverwhelmTodayRoute(text: string): OverwhelmTodayRoute | null {
  const t = text.trim();
  if (!t || isUnderstandOverwhelmQuestion(t)) return null;

  if (BRAIN_DUMP_STRONG_RE.test(t)) return "brain_dump_primary";
  if (isAdaptPrimaryRoute(t)) return "adapt_primary";
  if (isOverwhelmTodayStartIntent(t)) return "plan_primary";

  return null;
}

export function isOverwhelmTodayRoutingExempt(text: string): boolean {
  return detectOverwhelmTodayRoute(text) !== null;
}

export function overwhelmTodayGoalTags(route: OverwhelmTodayRoute): string[] {
  if (route === "brain_dump_primary") {
    return ["organize", "planning", "overwhelm_support", "mental_clarity"];
  }
  return ["planning", "focus", "overwhelm_support", "time_management"];
}

export function featureMatchForRoute(route: OverwhelmTodayRoute): AppSection {
  if (route === "brain_dump_primary") return "brain-dump";
  if (route === "adapt_primary") return "energy";
  return "plan-my-day";
}

export function secondaryFeatureMatchForRoute(route: OverwhelmTodayRoute): AppSection {
  if (route === "brain_dump_primary") return "plan-my-day";
  if (route === "adapt_primary") return "plan-my-day";
  return "energy";
}

function planPrimaryLine(): string {
  return "Let's make today smaller.\nWould you like to open Plan My Day so we can pick one place to start?";
}

function brainDumpPrimaryLine(): string {
  return "Let's get what's in your head out first.\nWould you like to open Clear My Mind?";
}

export function buildOverwhelmTodayOffers(
  text: string,
  route: OverwhelmTodayRoute,
): { primary: WorkspaceOffer; secondary: WorkspaceOffer } {
  void text;

  if (route === "brain_dump_primary") {
    return {
      primary: {
        section: "brain-dump",
        buttonLabel: "Open Clear My Mind",
        line: brainDumpPrimaryLine(),
        secondary: { section: "plan-my-day", buttonLabel: "Open Plan My Day" },
      },
      secondary: {
        section: "plan-my-day",
        buttonLabel: "Open Plan My Day",
        line: planPrimaryLine(),
      },
    };
  }

  if (route === "adapt_primary") {
    const adaptLine = adaptMyDayOfferLine();
    return {
      primary: {
        section: "energy",
        buttonLabel: "Open Today's Reality",
        line: adaptLine,
        secondary: { section: "plan-my-day", buttonLabel: "Open Plan My Day" },
      },
      secondary: {
        section: "plan-my-day",
        buttonLabel: "Open Plan My Day",
        line: planPrimaryLine(),
      },
    };
  }

  return {
    primary: {
      section: "plan-my-day",
      buttonLabel: "Open Plan My Day",
      line: planPrimaryLine(),
      secondary: { section: "energy", buttonLabel: "Open Today's Reality" },
    },
    secondary: {
      section: "energy",
      buttonLabel: "Open Today's Reality",
      line: adaptMyDayOfferLine(),
    },
  };
}

export function overwhelmTodayRoutingHint(route: OverwhelmTodayRoute): string {
  if (route === "brain_dump_primary") {
    return "User needs to unload thoughts first. Do not reflect or summarize. Offer Clear My Mind / Plan My Day or one tiny next step.";
  }
  if (route === "adapt_primary") {
    return "User needs to adjust today to reality. Do not reflect or summarize. Offer Today's Reality / Plan My Day or one tiny next step.";
  }
  return "User is overwhelmed and asking where to start today. Do not reflect or summarize. Offer Plan My Day / Today's Reality or give one tiny next step.";
}
