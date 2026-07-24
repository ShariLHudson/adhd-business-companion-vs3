/**
 * Per-conversation TCAI + CIE state for Companion / global Shari.
 * Cleared on intentional new chat / conversation reset.
 */

import type { ConversationRuntimeState } from "@/lib/conversationIntelligenceEngine";
import type { TopicAnchor } from "@/lib/topicContinuityAnchorIntelligence";

export type GeneralChatCertifiedRuntime = {
  topicAnchor: TopicAnchor | null;
  cieState: ConversationRuntimeState | null;
  conversationId: string;
};

let runtime: GeneralChatCertifiedRuntime | null = null;

export function getGeneralChatCertifiedRuntime(
  conversationId?: string | null,
): GeneralChatCertifiedRuntime | null {
  if (!runtime) return null;
  if (
    conversationId &&
    runtime.conversationId &&
    runtime.conversationId !== conversationId
  ) {
    return null;
  }
  return runtime;
}

export function saveGeneralChatCertifiedRuntime(
  next: GeneralChatCertifiedRuntime,
): void {
  runtime = next;
}

export function clearGeneralChatCertifiedRuntime(): void {
  runtime = null;
}
