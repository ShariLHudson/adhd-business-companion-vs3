/**
 * Discard assistant responses that belong to a superseded conversation scope.
 */

import { getDaySession } from "./daySession";
import type { ChatRequestIdentity } from "./types";

export type StaleResponseCheckInput = {
  identity: ChatRequestIdentity;
  /** Active conversation when the response is about to render. */
  activeConversationId: string | null | undefined;
  /** Active day session when the response is about to render. */
  activeDaySessionId?: string | null;
  /** Active scope when the response is about to render. */
  activeScopeId?: string | null;
  /** Optional destination the response claimed. */
  responseDestinationId?: string | null;
  activeDestinationId?: string | null;
};

export type StaleResponseCheckResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "conversation_mismatch"
        | "day_session_mismatch"
        | "scope_mismatch"
        | "destination_mismatch";
    };

export function createChatRequestIdentity(input: {
  conversationId: string;
  scopeId: string;
  requestId?: string;
  destinationId?: string | null;
}): ChatRequestIdentity {
  const day = getDaySession();
  return {
    conversationId: input.conversationId,
    daySessionId: day.daySessionId,
    requestId:
      input.requestId ??
      `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    scopeId: input.scopeId,
    destinationId: input.destinationId ?? null,
  };
}

/**
 * Returns ok:false when a delayed/async reply must not replace current chat.
 */
export function shouldAcceptAssistantResponse(
  input: StaleResponseCheckInput,
): StaleResponseCheckResult {
  const { identity } = input;
  const dayId = input.activeDaySessionId ?? getDaySession().daySessionId;

  if (
    identity.conversationId &&
    input.activeConversationId &&
    identity.conversationId !== input.activeConversationId
  ) {
    return { ok: false, reason: "conversation_mismatch" };
  }

  if (identity.daySessionId && dayId && identity.daySessionId !== dayId) {
    return { ok: false, reason: "day_session_mismatch" };
  }

  if (
    identity.scopeId &&
    input.activeScopeId &&
    identity.scopeId !== input.activeScopeId
  ) {
    return { ok: false, reason: "scope_mismatch" };
  }

  if (
    identity.destinationId &&
    input.activeDestinationId &&
    identity.destinationId !== input.activeDestinationId
  ) {
    return { ok: false, reason: "destination_mismatch" };
  }

  return { ok: true };
}
