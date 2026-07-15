/**
 * Global Daily Companion Experience — shared daily-opening types.
 * One controller for first open of day, absence return, Settings → New Day,
 * and any explicit Start New Day control.
 */

import type { CompanionContinueOption } from "@/lib/companionLedContinue";
import type { AppSection } from "@/lib/companionUi";
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
  explanation: string;
  estimateLabel?: string | null;
  recommended: boolean;
};

/** Navigable destinations — selection is permission; no second confirm. */
export type DailyOpeningDestination =
  | { kind: "continue"; option: CompanionContinueOption }
  | { kind: "plan-my-day" }
  | { kind: "section"; section: AppSection }
  | { kind: "clear-my-mind" }
  | { kind: "explore-estate" }
  | { kind: "business-estate" };

export type HelpMeChooseSuggestion = {
  id: string;
  /** Display title on the suggestion card. */
  title: string;
  /** One-line benefit under the title. */
  benefit: string;
  /** Back-compat alias for title. */
  label: string;
  destination:
    | Exclude<DailyOpeningDestination, { kind: "continue" }>
    | {
        kind: "continue";
        option: CompanionContinueOption;
      };
};

export type DailyOpeningChoiceAction =
  | { kind: "navigate"; destination: DailyOpeningDestination }
  | { kind: "show-help-me-choose"; suggestions: HelpMeChooseSuggestion[] };

export type DailyOpeningDiscoveryInvite = {
  show: boolean;
  title: string;
  line: string;
  primaryLabel: string;
  secondaryLabel: string;
};

export type GlobalDailyOpeningResult = {
  entryPoint: DailyOpeningEntryPoint;
  momentKind: DailyOpeningMomentKind;
  /** Warm Shari message for the opening card. */
  welcomeMessage: string;
  /** Alias of welcomeMessage for older callers. */
  greeting: string;
  /** Optional first-60-days teaching line (never a fourth choice). */
  teachingSentence: string | null;
  choiceCards: DailyOpeningChoiceCard[];
  /** Flat labels derived from choiceCards (tests / legacy). */
  choices: DailyOpeningChoice[];
  continueOption: CompanionContinueOption | null;
  helpMeChooseSuggestions: HelpMeChooseSuggestion[];
  discovery: DailyOpeningDiscoveryInvite;
};

export const DAILY_OPENING_CHOICE_LABELS: Record<
  DailyOpeningChoiceId,
  string
> = {
  "continue-meaningful-work": "Continue Meaningful Work",
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
  "Or tell me what you need today…" as const;

/** Absence threshold aligned with Welcome Home / Phase 24 (3 days). */
export const DAILY_OPENING_ABSENCE_THRESHOLD_DAYS = 3;

export const DAILY_OPENING_DAY_KEY_STORAGE =
  "spark-global-daily-opening-day-v1";

export const DAILY_OPENING_DISCOVERY_DAY_STORAGE =
  "spark-global-daily-opening-discovery-day-v1";
