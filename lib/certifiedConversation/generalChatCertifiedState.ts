/**
 * Per-conversation TCAI + CIE state for Companion / global Shari.
 * Projection of ConversationSession spine — cleared on reset; ignored on id mismatch.
 */

import type { ConversationRuntimeState } from "@/lib/conversationIntelligenceEngine";
import type { TopicAnchor } from "@/lib/topicContinuityAnchorIntelligence";
import { getActiveSpineConversationId } from "@/lib/conversationSession/spine";
import { reportProjectionConversationIdMismatch } from "@/lib/conversationSession/spineInvariants";

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
  const expected =
    conversationId?.trim() || getActiveSpineConversationId() || null;
  if (
    expected &&
    runtime.conversationId &&
    runtime.conversationId !== expected
  ) {
    reportProjectionConversationIdMismatch({
      projection: "generalChatCertifiedRuntime",
      projectionConversationId: runtime.conversationId,
      spineConversationId: expected,
    });
    runtime = null;
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
