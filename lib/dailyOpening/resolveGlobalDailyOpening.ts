/**
 * Shared recommendation + choice resolution for the Global Daily Companion Experience.
 * All entry points must call this — do not duplicate choice logic elsewhere.
 */

import {
  resolveCompanionContinue,
  type CompanionContinueOption,
  type CompanionContinueResolution,
} from "@/lib/companionLedContinue";
import {
  DAILY_OPENING_CHOICE_LABELS,
  GLOBAL_DAILY_OPENING_CHOICES,
  GLOBAL_DAILY_OPENING_GREETING,
  type DailyOpeningChoiceAction,
  type DailyOpeningChoiceId,
  type DailyOpeningDestination,
  type DailyOpeningEntryPoint,
  type GlobalDailyOpeningResult,
  type HelpMeChooseSuggestion,
} from "./types";

export type ResolveGlobalDailyOpeningInput = {
  entryPoint: DailyOpeningEntryPoint;
  continueResolution?: CompanionContinueResolution;
  greeting?: string | null;
  memberFirstName?: string | null;
};

function primaryContinueOption(
  resolution: CompanionContinueResolution,
): CompanionContinueOption | null {
  if (resolution.mode === "single") return resolution.option;
  if (resolution.mode === "choose") return resolution.options[0] ?? null;
  return null;
}

function buildGreeting(
  entryPoint: DailyOpeningEntryPoint,
  memberFirstName: string | null | undefined,
  override: string | null | undefined,
): string {
  const existing = override?.trim();
  if (existing) return existing;

  const name = memberFirstName?.trim() || null;
  if (entryPoint === "absence-return") {
    return name
      ? `Welcome back, ${name}. I'm glad you're here. What would help most today?`
      : "Welcome back. I'm glad you're here. What would help most today?";
  }
  if (entryPoint === "first-platform-opening") {
    return name
      ? `Welcome back, ${name}. What would help most today?`
      : "Welcome back. What would help most today?";
  }
  return GLOBAL_DAILY_OPENING_GREETING;
}

/**
 * Exactly three actionable Help Me Choose suggestions.
 * Each must navigate on the first click (no second confirmation).
 */
export function resolveHelpMeChooseSuggestions(
  continueResolution?: CompanionContinueResolution,
): HelpMeChooseSuggestion[] {
  const resolution = continueResolution ?? resolveCompanionContinue();
  const continueOption = primaryContinueOption(resolution);
  const suggestions: HelpMeChooseSuggestion[] = [];

  if (continueOption) {
    suggestions.push({
      id: `hmc-continue-${continueOption.id}`,
      label: continueOption.title,
      destination: { kind: "continue", option: continueOption },
    });
  } else {
    suggestions.push({
      id: "hmc-clear-my-mind",
      label: "Clear My Mind",
      destination: { kind: "clear-my-mind" },
    });
  }

  suggestions.push({
    id: "hmc-plan-my-day",
    label: "Plan My Day",
    destination: { kind: "plan-my-day" },
  });

  suggestions.push({
    id: "hmc-explore-estate",
    label: "Explore Spark Estate",
    destination: { kind: "explore-estate" },
  });

  return suggestions.slice(0, 3);
}

export function resolveGlobalDailyOpening(
  input: ResolveGlobalDailyOpeningInput,
): GlobalDailyOpeningResult {
  const continueResolution =
    input.continueResolution ?? resolveCompanionContinue();
  const continueOption = primaryContinueOption(continueResolution);
  const helpMeChooseSuggestions =
    resolveHelpMeChooseSuggestions(continueResolution);

  return {
    entryPoint: input.entryPoint,
    greeting: buildGreeting(
      input.entryPoint,
      input.memberFirstName,
      input.greeting,
    ),
    choices: GLOBAL_DAILY_OPENING_CHOICES.map((c) => ({ ...c })),
    continueOption,
    helpMeChooseSuggestions,
  };
}

/**
 * Resolve what happens when a main daily-opening choice is selected.
 * Click = permission to navigate (or to reveal Help Me Choose suggestions).
 */
export function resolveDailyOpeningChoiceAction(
  choiceId: DailyOpeningChoiceId,
  opening: GlobalDailyOpeningResult,
): DailyOpeningChoiceAction {
  if (choiceId === "help-me-choose") {
    return {
      kind: "show-help-me-choose",
      suggestions: opening.helpMeChooseSuggestions.slice(0, 3),
    };
  }

  if (choiceId === "plan-or-adapt-my-day") {
    return {
      kind: "navigate",
      destination: { kind: "plan-my-day" },
    };
  }

  // continue-meaningful-work
  if (opening.continueOption) {
    return {
      kind: "navigate",
      destination: {
        kind: "continue",
        option: opening.continueOption,
      },
    };
  }

  // No unfinished activity — still navigate immediately (Plan My Day).
  return {
    kind: "navigate",
    destination: { kind: "plan-my-day" },
  };
}

export function resolveHelpMeChooseSuggestionDestination(
  suggestion: HelpMeChooseSuggestion,
): DailyOpeningDestination {
  return suggestion.destination;
}

export function dailyOpeningChoiceLabel(id: DailyOpeningChoiceId): string {
  return DAILY_OPENING_CHOICE_LABELS[id];
}
