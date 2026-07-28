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
import { resolveWelcomeDayIndex } from "./first60Days";
import { resolveDailyOpeningDiscoveryInvite } from "./resolveDiscoveryInvite";
import { resolveMeaningfulContinueForWelcome } from "./resolveMeaningfulContinue";
import { readDailyOpeningPresentedDay } from "./dailyOpeningDay";
import { todayStr } from "@/lib/companionStore";
import { resolveWelcomeActiveWork } from "@/lib/welcomeHome/resolveWelcomeActiveWork";
import type { CanonicalReturnState } from "@/lib/arrivalIntelligence/returnState";
import {
  DAILY_OPENING_CHOICE_LABELS,
  type CanonicalWelcomeContext,
  type DailyOpeningChoice,
  type DailyOpeningChoiceAction,
  type DailyOpeningChoiceId,
  type DailyOpeningDestination,
  type DailyOpeningEntryPoint,
  type DailyOpeningMomentKind,
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
  /**
   * MA-05 Phase 4a — optional canonical return-state (MA-05 P2) for the additive
   * welcomeContext. When omitted (all current callers), it is derived from
   * momentKind so behavior is unchanged; a later slice threads the precise
   * classifyReturnState value in.
   */
  returnState?: CanonicalReturnState;
};

/**
 * MA-05 Phase 4a fallback: derive a coarse canonical return-state from momentKind
 * when the caller has not supplied the precise P2 classification. Deterministic;
 * never affects visible output (welcomeContext is additive, not rendered here).
 */
function returnStateFromMomentKind(
  momentKind: DailyOpeningMomentKind,
): CanonicalReturnState {
  if (momentKind === "same-day-return") return "same_day_return";
  if (momentKind === "absence-return") return "return_after_absence";
  return "ordinary_return"; // first-of-day / explicit new day
}

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
  const now = input.now ?? new Date();
  const { dayIndex: welcomeDayIndex, phase: welcomePhase } =
    resolveWelcomeDayIndex(now);
  const built = buildDailyOpeningWelcomeParts({
    momentKind,
    memberFirstName,
    now,
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

  // 073/074 — one current Active Workspace for the first Welcome card
  const activeWork = resolveWelcomeActiveWork();
  const choiceCards = buildDailyOpeningChoiceCards(continueOption, activeWork);
  const choices: DailyOpeningChoice[] = choiceCards.map((card) => ({
    id: card.id,
    label: card.title,
  }));

  const discovery = resolveDailyOpeningDiscoveryInvite({
    entryPoint: input.entryPoint,
    momentKind,
    suppressForRecovery: input.suppressDiscoveryForRecovery,
    now,
  });

  const encouragementLine = resolveFirst60TeachingSentence(now);

  // MA-05 Phase 4a — additive canonical context. A pure MIRROR of the values
  // already resolved above (no recomputation, no new resident-facing decision).
  const welcomeContext: CanonicalWelcomeContext = {
    resident: {
      returnState: input.returnState ?? returnStateFromMomentKind(momentKind),
      journeyPhase: welcomePhase,
    },
    opening: {
      greetingTitle,
      welcomeLine,
      encouragement: encouragementLine,
    },
    choices: choiceCards,
    continuation: { candidate: continueOption },
    discovery,
  };

  return {
    entryPoint: input.entryPoint,
    momentKind,
    greetingTitle,
    welcomeLine,
    choicesIntro,
    discoveryInviteLine,
    welcomeMessage,
    greeting: welcomeMessage,
    teachingSentence: encouragementLine,
    encouragementLine,
    welcomeDayIndex,
    welcomePhase,
    choiceCards,
    choices,
    continueOption,
    activeWork,
    helpMeChooseSuggestions: [],
    discovery,
    welcomeContext,
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

  // First card = current work when Active Workspace exists; otherwise Meaningful Start.
  if (opening.activeWork?.workspaceId) {
    return {
      kind: "resume-active-work",
      workspaceId: opening.activeWork.workspaceId,
    };
  }
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
