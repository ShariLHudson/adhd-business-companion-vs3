/**
 * Global Daily Companion Experience — shared daily-opening types.
 * One controller for first open of day, absence return, Settings → New Day,
 * and any explicit Start New Day control.
 */

import type { CompanionContinueOption } from "@/lib/companionLedContinue";
import type { AppSection } from "@/lib/companionUi";

export type DailyOpeningEntryPoint =
  | "first-platform-opening"
  | "absence-return"
  | "settings-new-day"
  | "explicit-new-day";

export type DailyOpeningChoiceId =
  | "continue-meaningful-work"
  | "plan-or-adapt-my-day"
  | "help-me-choose";

export type DailyOpeningChoice = {
  id: DailyOpeningChoiceId;
  label: string;
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
  label: string;
  destination: Exclude<DailyOpeningDestination, { kind: "continue" }> | {
    kind: "continue";
    option: CompanionContinueOption;
  };
};

export type DailyOpeningChoiceAction =
  | { kind: "navigate"; destination: DailyOpeningDestination }
  | { kind: "show-help-me-choose"; suggestions: HelpMeChooseSuggestion[] };

export type GlobalDailyOpeningResult = {
  entryPoint: DailyOpeningEntryPoint;
  greeting: string;
  choices: DailyOpeningChoice[];
  continueOption: CompanionContinueOption | null;
  helpMeChooseSuggestions: HelpMeChooseSuggestion[];
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
  "New day — fresh start. What would help most right now?";

/** Absence threshold aligned with Welcome Home / Phase 24 (3 days). */
export const DAILY_OPENING_ABSENCE_THRESHOLD_DAYS = 3;

export const DAILY_OPENING_DAY_KEY_STORAGE =
  "spark-global-daily-opening-day-v1";
