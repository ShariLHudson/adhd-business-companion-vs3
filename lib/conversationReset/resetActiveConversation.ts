/**
 * Shared New Chat / New Day reset — ends the active thread without wiping
 * approved long-term profile, preferences, projects, rhythms, or calendar.
 */

import { clearConversation } from "@/lib/companionStore";
import {
  clearConversationSession,
  getOrCreateConversationSession,
  loadConversationSession,
} from "@/lib/conversationSession";
import { clearConversationOwner } from "@/lib/conversationContinuity";
import { clearConversationWorkflow } from "@/lib/estateCapabilityRegistry/conversationState";
import {
  clearConversationThreadFromEstateMemory,
  type ClearConversationThreadResult,
} from "@/lib/estateMemory/clearConversationThread";
import { clearUniversalCreationSession } from "@/lib/universalCreation";
import { clearFrictionlessPending } from "@/lib/frictionlessActionLayer";
import { clearActiveChamberMember } from "@/lib/chamber/chamberMemberActivation";
import { clearPendingGuidedFieldHelp } from "@/lib/profile/guidedFieldHelp";
import { clearPendingMenuSelection } from "@/lib/menuContinuationIntelligence";
import { clearExpertSessionPrompt } from "@/lib/profile/fieldHelpRegistry";
import { clearPendingEstatePlaceMenu } from "@/lib/estate/estatePlaceNavigation";
import { supersedeInFlightChatRequest } from "@/lib/chatFastPath/chatRequestInterrupt";

export type ResetActiveConversationMode = "new-chat" | "new-day";

export type ResetActiveConversationInput = {
  mode: ResetActiveConversationMode;
  /** In-flight companion-chat AbortController, if any. */
  abortController?: AbortController | null;
  /** Bump generation so superseded stream turns cannot land in the new thread. */
  bumpRequestGeneration?: () => void;
};

export type ResetActiveConversationResult = {
  mode: ResetActiveConversationMode;
  previousConversationId: string | null;
  conversationId: string;
  sessionId: string;
  estate: ClearConversationThreadResult;
};

/**
 * Tear down the active conversation thread and start a clean one.
 * Does not touch prefs, rhythms, reminders, calendar, or saved projects.
 */
export function resetActiveConversation(
  input: ResetActiveConversationInput,
): ResetActiveConversationResult {
  const previousConversationId =
    loadConversationSession()?.conversationId ?? null;

  input.bumpRequestGeneration?.();
  supersedeInFlightChatRequest(input.abortController ?? null);

  clearConversation();
  clearConversationOwner();
  clearConversationWorkflow();
  clearConversationSession();

  const estate = clearConversationThreadFromEstateMemory();

  clearUniversalCreationSession();
  clearFrictionlessPending();
  clearActiveChamberMember();
  clearPendingGuidedFieldHelp();
  clearPendingMenuSelection();
  clearExpertSessionPrompt();
  clearPendingEstatePlaceMenu();

  const next = getOrCreateConversationSession();

  return {
    mode: input.mode,
    previousConversationId,
    conversationId: next.conversationId,
    sessionId: next.sessionId,
    estate,
  };
}

/** Messages safe to send on the first AI turn after a reset. */
export function messagesForFreshAiRequest(
  messages: Array<{ role: string; content: string }>,
): Array<{ role: "user" | "assistant"; content: string }> {
  return messages
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .map((m) => ({ role: m.role, content: m.content }));
}
