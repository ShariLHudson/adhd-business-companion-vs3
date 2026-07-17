/**
 * Shared recommendation + choice resolution for the Global Daily Companion Experience.
 * All entry points must call this — do not duplicate choice logic elsewhere.
 */

import {
  resolveCompanionContinue,
  type CompanionContinueResolution,
} from "@/lib/companionLedContinue";
import { hasActivePlanForToday } from "@/lib/dailyAdaptation/hasActivePlanToday";
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

/**
 * @deprecated Destination-card Help Me Choose removed.
 * Kept for tests that still import the symbol — returns [].
 */
export function resolveHelpMeChooseSuggestions(
  _continueResolution?: CompanionContinueResolution,
): HelpMeChooseSuggestion[] {
  return [];
}

export function resolveGlobalDailyOpening(
  input: ResolveGlobalDailyOpeningInput,
): GlobalDailyOpeningResult {
  const continueResolution =
    input.continueResolution ?? resolveCompanionContinue();
  const continueOption = resolveMeaningfulContinueForWelcome(continueResolution);

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
  const discoveryInviteLine = useOverride ? "" : built.discoveryInviteLine;
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
    discoveryInviteLine,
    welcomeMessage,
    greeting: welcomeMessage,
    teachingSentence: resolveFirst60TeachingSentence(input.now),
    choiceCards,
    choices,
    continueOption,
    helpMeChooseSuggestions: [],
    discovery,
  };
}

/**
 * Resolve what happens when a main daily-opening choice is selected.
 * Click = permission to navigate (or open Help Me Choose / discovery).
 */
export function resolveDailyOpeningChoiceAction(
  choiceId: DailyOpeningChoiceId,
  opening: GlobalDailyOpeningResult,
): DailyOpeningChoiceAction {
  if (choiceId === "help-me-choose") {
    return { kind: "show-help-me-choose" };
  }

  if (choiceId === "plan-or-adapt-my-day") {
    // Auto-route from canonical plan state — do not show duplicate Plan vs Adapt cards.
    return {
      kind: "navigate",
      destination: hasActivePlanForToday()
        ? { kind: "adapt-my-day" }
        : { kind: "plan-my-day" },
    };
  }

  // continue-meaningful-work → Meaningful Start (never Plan My Day, never resume).
  return { kind: "show-meaningful-start" };
}

export function resolveHelpMeChooseSuggestionDestination(
  suggestion: HelpMeChooseSuggestion,
): DailyOpeningDestination {
  return suggestion.destination;
}

export function dailyOpeningChoiceLabel(id: DailyOpeningChoiceId): string {
  return DAILY_OPENING_CHOICE_LABELS[id];
}
