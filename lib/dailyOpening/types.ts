/**
 * Global Daily Companion Experience — shared daily-opening types.
 * One controller for first open of day, absence return, Settings → New Day,
 * and any explicit Start New Day control.
 */

import type { CompanionContinueOption } from "@/lib/companionLedContinue";
import type { AppSection } from "@/lib/companionUi";
import type { WelcomeActiveWorkCard } from "@/lib/welcomeHome/resolveWelcomeActiveWork";
import type { DailyOpeningMomentKind } from "./buildDailyOpeningWelcome";

export type { DailyOpeningMomentKind };

export type DailyOpeningEntryPoint =
  | "first-platform-opening"
  | "absence-return"
  | "settings-new-day"
  | "explicit-new-day";

export type DailyOpeningChoiceId =
  | "continue-meaningful-work"
  | "plan-or-adapt-my-day"
  | "help-me-choose";

/** Legacy flat label shape — prefer DailyOpeningChoiceCard. */
export type DailyOpeningChoice = {
  id: DailyOpeningChoiceId;
  label: string;
};

/** Rich card shown in GlobalDailyCompanionOpening. */
export type DailyOpeningChoiceCard = {
  id: DailyOpeningChoiceId;
  title: string;
  /** Joined support copy for aria-labels / legacy callers. */
  explanation: string;
  /**
   * Soft support lines under the title (why/where, what/when, how).
   * Prefer these in the UI; fall back to explanation when empty.
   */
  supportLines?: string[];
  estimateLabel?: string | null;
  recommended: boolean;
};

/** Navigable destinations — selection is permission; no second confirm. */
export type DailyOpeningDestination =
  | { kind: "continue"; option: CompanionContinueOption }
  | { kind: "plan-my-day" }
  | { kind: "adapt-my-day" }
  | { kind: "section"; section: AppSection }
  | { kind: "clear-my-mind" }
  | { kind: "explore-estate" }
  | { kind: "business-estate" }
  | { kind: "stay-in-chat"; cue?: string };

/** @deprecated Legacy destination-card Help Me Choose — use need-based flow. */
export type HelpMeChooseSuggestion = {
  id: string;
  /** Display title on the suggestion card. */
  title: string;
  /** One-line benefit under the title. */
  benefit: string;
  /** Back-compat alias for title. */
  label: string;
  destination:
    | Exclude<DailyOpeningDestination, { kind: "continue" | "stay-in-chat" }>
    | {
        kind: "continue";
        option: CompanionContinueOption;
      };
};

export type DailyOpeningChoiceAction =
  | { kind: "navigate"; destination: DailyOpeningDestination }
  | { kind: "show-help-me-choose" }
  | { kind: "show-meaningful-start" }
  | { kind: "show-something-helpful" }
  /** First Welcome card — resume the single current Active Workspace. */
  | { kind: "resume-active-work"; workspaceId: string };

export type DailyOpeningDiscoveryInvite = {
  show: boolean;
  /** Section label — e.g. Today's Discovery. */
  title: string;
  /** One-sentence why this discovery helps. */
  line: string;
  primaryLabel: string;
  secondaryLabel: string;
  /** Catalog id when a concrete discovery is offered. */
  discoveryId?: string;
  /** Soft "why today" line under the why. */
  whyToday?: string;
  /** Navigable destination for Explore. */
  destinationId?: string;
  /** Feature display name (Plan My Day, Chamber, …). */
  featureTitle?: string;
};

export type GlobalDailyOpeningResult = {
  entryPoint: DailyOpeningEntryPoint;
  momentKind: DailyOpeningMomentKind;
  /** Prominent greeting title — e.g. Good morning, Sarah. */
  greetingTitle: string;
  /** Warm Shari presence line. */
  welcomeLine: string;
  /** Brief explanation of the three choices. */
  choicesIntro: string;
  /** Discovery invite line for Show Me Something Helpful. */
  discoveryInviteLine: string;
  /** Joined greeting for older callers / sentence-count gates. */
  welcomeMessage: string;
  /** Alias of welcomeMessage for older callers. */
  greeting: string;
  /**
   * Optional encouragement / first-60 teaching line (never a fourth choice).
   * Prefer encouragementLine in UI.
   */
  teachingSentence: string | null;
  /** Today's Encouragement — brief rotating thought. */
  encouragementLine: string | null;
  /** 1-based welcome day index (Day 1 = first relationship day). */
  welcomeDayIndex: number;
  /** guided = days 1–60; adaptive = day 61+. */
  welcomePhase: "guided" | "adaptive";
  choiceCards: DailyOpeningChoiceCard[];
  /** Flat labels derived from choiceCards (tests / legacy). */
  choices: DailyOpeningChoice[];
  continueOption: CompanionContinueOption | null;
  /** 073/074 — canonical Active Workspace card when registry has work */
  activeWork: WelcomeActiveWorkCard | null;
  /** @deprecated Empty — Help Me Choose uses need-based flow. */
  helpMeChooseSuggestions: HelpMeChooseSuggestion[];
  discovery: DailyOpeningDiscoveryInvite;
};

export const DAILY_OPENING_CHOICE_LABELS_CONTINUE_FALLBACK =
  "Start With What Matters Most" as const;

export const DAILY_OPENING_CHOICE_LABELS: Record<
  DailyOpeningChoiceId,
  string
> = {
  "continue-meaningful-work": "Start With What Matters Most",
  "plan-or-adapt-my-day": "Plan or Adapt My Day",
  "help-me-choose": "Help Me Choose",
};

export const GLOBAL_DAILY_OPENING_CHOICES: DailyOpeningChoice[] = [
  {
    id: "continue-meaningful-work",
    label: DAILY_OPENING_CHOICE_LABELS["continue-meaningful-work"],
  },
  {
    id: "plan-or-adapt-my-day",
    label: DAILY_OPENING_CHOICE_LABELS["plan-or-adapt-my-day"],
  },
  {
    id: "help-me-choose",
    label: DAILY_OPENING_CHOICE_LABELS["help-me-choose"],
  },
];

export const GLOBAL_DAILY_OPENING_GREETING =
  "Good morning. I'm glad you're here. We can keep today simple.";

export const GLOBAL_DAILY_OPENING_INPUT_PLACEHOLDER =
  "You can also tell me what you need today." as const;

/** Absence threshold aligned with Welcome Home / Phase 24 (3 days). */
export const DAILY_OPENING_ABSENCE_THRESHOLD_DAYS = 3;

export const DAILY_OPENING_DAY_KEY_STORAGE =
  "spark-global-daily-opening-day-v1";

export const DAILY_OPENING_DISCOVERY_DAY_STORAGE =
  "spark-global-daily-opening-discovery-day-v1";
