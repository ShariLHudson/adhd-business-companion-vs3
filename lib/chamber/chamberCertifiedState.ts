/**
 * Per-member TCAI + CIE state for Chamber conversations.
 * Cleared when the member conversation is dismissed or switched.
 */

import type { ConversationRuntimeState } from "@/lib/conversationIntelligenceEngine";
import type { TopicAnchor } from "@/lib/topicContinuityAnchorIntelligence";

export type ChamberCertifiedRuntime = {
  topicAnchor: TopicAnchor | null;
  cieState: ConversationRuntimeState | null;
  conversationId: string;
};

const byMember = new Map<string, ChamberCertifiedRuntime>();

export function getChamberCertifiedRuntime(
  memberId: string | null | undefined,
): ChamberCertifiedRuntime | null {
  if (!memberId) return null;
  return byMember.get(memberId) ?? null;
}

export function saveChamberCertifiedRuntime(
  memberId: string,
  runtime: ChamberCertifiedRuntime,
): void {
  byMember.set(memberId, runtime);
}

export function clearChamberCertifiedRuntime(
  memberId?: string | null,
): void {
  if (memberId) {
    byMember.delete(memberId);
    return;
  }
  byMember.clear();
}
