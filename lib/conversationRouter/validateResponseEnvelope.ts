/**
 * Stale-response validation — re-export + helpers for every async path.
 */

import {
  createChatRequestIdentity,
  getActiveChatScope,
  getDaySession,
  shouldAcceptAssistantResponse,
  type ChatRequestIdentity,
  type StaleResponseCheckResult,
} from "@/lib/chatScope";

export {
  createChatRequestIdentity,
  shouldAcceptAssistantResponse,
  type ChatRequestIdentity,
  type StaleResponseCheckResult,
};

export type ValidateResponseEnvelopeInput = {
  identity: ChatRequestIdentity;
  activeConversationId: string | null | undefined;
  activeDestinationId?: string | null;
  responseDestinationId?: string | null;
};

/**
 * Before rendering any async assistant content, verify the request is still current.
 */
export function validateResponseEnvelope(
  input: ValidateResponseEnvelopeInput,
): StaleResponseCheckResult {
  const day = getDaySession();
  const scope = getActiveChatScope();
  return shouldAcceptAssistantResponse({
    identity: input.identity,
    activeConversationId: input.activeConversationId,
    activeDaySessionId: day.daySessionId,
    activeScopeId: scope?.scopeId ?? null,
    responseDestinationId: input.responseDestinationId,
    activeDestinationId: input.activeDestinationId,
  });
}

/** Build identity for a new companion-chat request. */
export function beginRoutedChatRequest(input: {
  conversationId: string;
  destinationId?: string | null;
}): ChatRequestIdentity {
  const scope = getActiveChatScope();
  return createChatRequestIdentity({
    conversationId: input.conversationId,
    scopeId: scope?.scopeId ?? "global_companion",
    destinationId: input.destinationId ?? null,
  });
}
