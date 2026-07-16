/**
 * Shared New Day sequence — used by Settings → New Day, Estate Menu New Day,
 * and any other explicit Start New Day control.
 *
 * Steps 1–6 + 8 are performed here (conversation teardown + fresh session).
 * Steps 7 (preserve long-term profile / Business Estate) is guaranteed by
 * resetActiveConversation never touching approved profile stores.
 * Steps 9–10 (present Global Daily opening + three choices) are returned for UI.
 */

import {
  resetActiveConversation,
  type ResetActiveConversationInput,
  type ResetActiveConversationResult,
} from "@/lib/conversationReset";
import { clearDailySessionFlags } from "@/lib/freshStartSession";
import { resetTodayPlanForNewDay } from "@/lib/planMyDay/planDayItems";
import { beginEstateJourneyNewDay } from "@/lib/estateJourneyEngine/session";
import { getPrefs } from "@/lib/companionStore";
import { getApprovedFieldValue } from "@/lib/profile/businessEstateProfile";
import { resolveDailyOpeningMemberFirstName } from "./buildDailyOpeningWelcome";
import {
  resolveGlobalDailyOpening,
  type ResolveGlobalDailyOpeningInput,
} from "./resolveGlobalDailyOpening";
import { markDailyOpeningPresented } from "./dailyOpeningDay";
import type {
  DailyOpeningEntryPoint,
  GlobalDailyOpeningResult,
} from "./types";

export type RunSharedNewDayInput = {
  entryPoint: Extract<
    DailyOpeningEntryPoint,
    "settings-new-day" | "explicit-new-day" | "first-platform-opening" | "absence-return"
  >;
  abortController?: AbortController | null;
  bumpRequestGeneration?: () => void;
  continueResolution?: ResolveGlobalDailyOpeningInput["continueResolution"];
  greeting?: string | null;
};

export type RunSharedNewDayResult = {
  reset: ResetActiveConversationResult;
  journeyGreeting: string;
  opening: GlobalDailyOpeningResult;
  previousConversationId: string | null;
};

function resolveMemberFirstName(): string | null {
  const fromPrefs = resolveDailyOpeningMemberFirstName();
  if (fromPrefs) return fromPrefs;
  const founder = getApprovedFieldValue("identity.founderName")?.trim();
  if (founder) return founder.split(/\s+/)[0] ?? founder;
  const prefsName = getPrefs().name?.trim();
  if (prefsName) return prefsName.split(/\s+/)[0] ?? prefsName;
  return null;
}

/**
 * Full New Day / daily-opening reset through the shared controller.
 * Does not open blank chat — returns the Global Daily opening for the UI.
 */
export function runSharedNewDay(
  input: RunSharedNewDayInput,
): RunSharedNewDayResult {
  const resetInput: ResetActiveConversationInput = {
    mode: "new-day",
    abortController: input.abortController ?? null,
    bumpRequestGeneration: input.bumpRequestGeneration,
  };

  // 1–6: cancel stream, end conversation, clear messages/digest/thread, new IDs
  const reset = resetActiveConversation(resetInput);

  // 8: initialize a new daily session (flags + plan archive + journey day)
  clearDailySessionFlags();
  resetTodayPlanForNewDay();
  const { greeting: journeyGreeting } = beginEstateJourneyNewDay();

  // Warm card copy is owned by resolveGlobalDailyOpening — do not override
  // with the journey "New day — fresh start" line (that made choices feel like chat).
  const opening = resolveGlobalDailyOpening({
    entryPoint: input.entryPoint,
    continueResolution: input.continueResolution,
    greeting: input.greeting,
    memberFirstName: resolveMemberFirstName(),
  });

  markDailyOpeningPresented();

  return {
    reset,
    journeyGreeting,
    opening,
    previousConversationId: reset.previousConversationId,
  };
}
