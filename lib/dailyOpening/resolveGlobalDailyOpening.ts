/**
 * Shared recommendation + choice resolution for the Global Daily Companion Experience.
 * All entry points must call this — do not duplicate choice logic elsewhere.
 */

import {
  resolveCompanionContinue,
  type CompanionContinueResolution,
} from "@/lib/companionLedContinue";
import { buildDailyOpeningChoiceCards } from "./buildDailyOpeningChoiceCards";
import {
  buildDailyOpeningWelcomeParts,
  resolveDailyOpeningMemberFirstName,
  resolveDailyOpeningMomentKind,
  resolveFirst60TeachingSentence,
} from "./buildDailyOpeningWelcome";
import { resolveDailyOpeningDiscoveryInvite } from "./resolveDiscoveryInvite";
import { resolveMeaningfulContinueForWelcome } from "./resolveMeaningfulContinue";
import { readDailyOpeningPresentedDay } from "./dailyOpeningDay";
import { todayStr } from "@/lib/companionStore";
import {
  DAILY_OPENING_CHOICE_LABELS,
  type DailyOpeningChoice,
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
  /** Explicit override only — prefer built warm messages. */
  greeting?: string | null;
  memberFirstName?: string | null;
  suppressDiscoveryForRecovery?: boolean;
  now?: Date;
};

function benefitForSuggestion(
  suggestion: Omit<HelpMeChooseSuggestion, "benefit"> & {
    benefit?: string;
  },
): string {
  if (suggestion.benefit?.trim()) return suggestion.benefit.trim();
  switch (suggestion.destination.kind) {
    case "continue":
      return "Pick up the meaningful work waiting for you.";
    case "plan-my-day":
      return "Shape today around what matters most.";
    case "clear-my-mind":
      return "Set everything down so your mind can settle.";
    case "explore-estate":
      return "Take a gentle look around Spark Estate.";
    case "business-estate":
      return "Add a detail that helps me support you.";
    case "section":
      return "Open the place that fits this moment.";
    default:
      return "A useful next step for right now.";
  }
}

/**
 * Exactly three actionable Help Me Choose suggestions.
 * Each must navigate on the first click (no second confirmation).
 */
export function resolveHelpMeChooseSuggestions(
  continueResolution?: CompanionContinueResolution,
): HelpMeChooseSuggestion[] {
  const resolution = continueResolution ?? resolveCompanionContinue();
  const continueOption = resolveMeaningfulContinueForWelcome(resolution);
  const suggestions: HelpMeChooseSuggestion[] = [];

  if (continueOption) {
    const title = continueOption.title.trim();
    suggestions.push({
      id: `hmc-continue-${continueOption.id}`,
      title,
      label: title,
      benefit:
        continueOption.subtitle?.trim() ||
        benefitForSuggestion({
          id: "",
          title,
          label: title,
          destination: { kind: "continue", option: continueOption },
        }),
      destination: { kind: "continue", option: continueOption },
    });
  } else {
    suggestions.push({
      id: "hmc-clear-my-mind",
      title: "Clear My Mind",
      label: "Clear My Mind",
      benefit: "Set everything down so your mind can settle.",
      destination: { kind: "clear-my-mind" },
    });
  }

  suggestions.push({
    id: "hmc-plan-my-day",
    title: "Plan My Day",
    label: "Plan My Day",
    benefit: "Shape today around what matters most.",
    destination: { kind: "plan-my-day" },
  });

  if (continueOption) {
    suggestions.push({
      id: "hmc-clear-my-mind",
      title: "Clear My Mind",
      label: "Clear My Mind",
      benefit: "Set everything down so your mind can settle.",
      destination: { kind: "clear-my-mind" },
    });
  } else {
    suggestions.push({
      id: "hmc-business-estate",
      title: "Work on My Business Estate",
      label: "Work on My Business Estate",
      benefit: "Add a detail that helps me support you more personally.",
      destination: { kind: "business-estate" },
    });
  }

  return suggestions.slice(0, 3).map((s) => ({
    ...s,
    benefit: benefitForSuggestion(s),
    title: s.title || s.label,
    label: s.title || s.label,
  }));
}

export function resolveGlobalDailyOpening(
  input: ResolveGlobalDailyOpeningInput,
): GlobalDailyOpeningResult {
  const continueResolution =
    input.continueResolution ?? resolveCompanionContinue();
  const continueOption = resolveMeaningfulContinueForWelcome(continueResolution);
  const helpMeChooseSuggestions =
    resolveHelpMeChooseSuggestions(continueResolution);

  const alreadyPresentedToday =
    readDailyOpeningPresentedDay() === todayStr();
  const momentKind = resolveDailyOpeningMomentKind(
    input.entryPoint,
    alreadyPresentedToday,
  );

  const memberFirstName =
    input.memberFirstName?.trim() || resolveDailyOpeningMemberFirstName();
  const built = buildDailyOpeningWelcomeParts({
    momentKind,
    memberFirstName,
  });
  const override = input.greeting?.trim();
  // Prefer warm card copy; only honor override when it is clearly personalized
  // and not the old journey "New day — fresh start" line.
  const useOverride =
    Boolean(override) &&
    !/^new day/i.test(override!) &&
    !/what feels most important/i.test(override!);

  const greetingTitle = useOverride ? override! : built.greetingTitle;
  const welcomeLine = useOverride ? "" : built.welcomeLine;
  const choicesIntro = useOverride ? "" : built.choicesIntro;
  const welcomeMessage = useOverride
    ? override!
    : built.welcomeMessage;

  const choiceCards = buildDailyOpeningChoiceCards(continueOption);
  const choices: DailyOpeningChoice[] = choiceCards.map((card) => ({
    id: card.id,
    label: card.title,
  }));

  const discovery = resolveDailyOpeningDiscoveryInvite({
    entryPoint: input.entryPoint,
    momentKind,
    suppressForRecovery: input.suppressDiscoveryForRecovery,
    now: input.now,
  });

  return {
    entryPoint: input.entryPoint,
    momentKind,
    greetingTitle,
    welcomeLine,
    choicesIntro,
    welcomeMessage,
    greeting: welcomeMessage,
    teachingSentence: resolveFirst60TeachingSentence(input.now),
    choiceCards,
    choices,
    continueOption,
    helpMeChooseSuggestions,
    discovery,
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
    // Plan vs Adapt are different needs — show the choice step first.
    return { kind: "show-plan-or-adapt" };
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
