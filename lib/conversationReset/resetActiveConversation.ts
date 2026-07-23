/**
 * Shared New Chat / New Day reset — ends the active thread without wiping
 * approved long-term profile, preferences, projects, rhythms, or calendar.
 *
 * Authoritative temporary-context boundary for CB-007.
 * Visible greetings must satisfy CB-015 (Shari voice — no reset/session jargon).
 */

import { clearConversation, clearLastActivity } from "@/lib/companionStore";
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
import { clearStashedConversation } from "@/lib/conversationHandoffRecovery";
import { clearPendingChoice } from "@/lib/pendingChoice/manager";
import { clearCompanionConversationState } from "@/lib/companionConversationContext/store";
import { clearDiscoverySession } from "@/lib/estateBrain/discoveryMode";
import { clearImpliedNeedSession } from "@/lib/intentAwareConversation/impliedNeedSession";
import { clearFrictionFirstSession } from "@/lib/sparkCompanion/frictionFirst/frictionFirstSession";
import { clearOutcomeThread } from "@/lib/companionOutcomeThread";
import { clearActiveTaskLockState } from "@/lib/estate/activeTaskLock";
import { clearCollectionPendingOffer } from "@/lib/estate/collectionFramework/collectionPendingOffer";
import { endTurnDecision } from "@/lib/conversationStabilization/turnDecisionStore";
import { clearBoardIntakeDraft } from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import { consumeCallTheBoard } from "@/lib/board/callTheBoard";
import {
  activateNewDayChatScope,
  bindDaySessionConversation,
  startNewDaySession,
} from "@/lib/chatScope";

/** Keep in sync with CONTEXTUAL_HELP_SESSION_STORAGE_KEY (avoid importing that module). */
const CONTEXTUAL_HELP_SESSION_STORAGE_KEY =
  "companion-contextual-help-session-v1";

function clearTemporaryConversationRestoreVectors(): void {
  clearStashedConversation();
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CONTEXTUAL_HELP_SESSION_STORAGE_KEY);
  } catch {
    /* noop */
  }
}

/**
 * Temporary conversation vectors that must not survive New Chat / New Day.
 * Long-term prefs, profile, rhythms, reminders, and saved work stay untouched.
 */
function clearTemporaryConversationIsolationState(): void {
  clearPendingChoice();
  clearCompanionConversationState();
  clearDiscoverySession();
  clearImpliedNeedSession();
  clearFrictionFirstSession();
  clearOutcomeThread();
  // Chat continue cue only — saved projects / recent work remain for CB-008.
  clearLastActivity();
  clearActiveTaskLockState();
  clearCollectionPendingOffer();
  endTurnDecision();
}

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

  // Prevent silent restore of prior threads after New Chat / New Day.
  clearTemporaryConversationRestoreVectors();

  clearUniversalCreationSession();
  clearFrictionlessPending();
  clearActiveChamberMember();
  clearPendingGuidedFieldHelp();
  clearPendingMenuSelection();
  clearExpertSessionPrompt();
  clearPendingEstatePlaceMenu();

  // CB-007 — remaining temporary conversation state (pending menus, sticky nouns, etc.)
  clearTemporaryConversationIsolationState();

  // Board intake + Call-the-Board seed must not reattach after New Day / New Chat.
  // Saved Board discussion history (director-discussions) is preserved.
  clearBoardIntakeDraft();
  consumeCallTheBoard();

  const next = getOrCreateConversationSession();
  startNewDaySession(next.conversationId);
  bindDaySessionConversation(next.conversationId);
  if (input.mode === "new-day") {
    activateNewDayChatScope();
  }

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
