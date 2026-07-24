/**
 * ConversationSession spine API — Phase 0/1 identity surface.
 * Transcript writes live in transcriptAuthority.ts (Phase 2).
 *
 * Durable authority lives here. Other stores are views / projections /
 * adapters / consumers (see SPINE_CONTRACT.md).
 */

import type { ConversationSession, ConversationSessionPatch } from "./types";
import {
  applyConversationSessionPatch,
  getOrCreateConversationSession,
  loadConversationSession,
} from "./store";

/** Classifications for non-spine stores (documentation + runtime tags). */
export const CONVERSATION_STORE_CLASSIFICATION = {
  messages: "view",
  messagesRef: "view",
  continuityOwner: "projection",
  shariConversationThread: "projection",
  generalChatCertifiedRuntime: "projection",
  universalCreationSession: "adapter",
  turnAuthority: "consumer",
  turnDecisionStore: "consumer",
} as const;

export type ConversationStoreClassification =
  (typeof CONVERSATION_STORE_CLASSIFICATION)[keyof typeof CONVERSATION_STORE_CLASSIFICATION];

/** Load or create the active ConversationSession spine. */
export function getOrCreateConversationSpine(): ConversationSession {
  return getOrCreateConversationSession();
}

/** Load the active spine without creating. */
export function getConversationSpine(): ConversationSession | null {
  return loadConversationSession();
}

/** Active spine conversationId, or null if none. */
export function getActiveSpineConversationId(): string | null {
  return loadConversationSession()?.conversationId?.trim() || null;
}

/** Merge a patch onto the spine (creates spine if missing). */
export function patchConversationSpine(
  patch: ConversationSessionPatch,
): ConversationSession {
  return applyConversationSessionPatch(patch);
}

/**
 * Whether a projection's conversationId matches the active spine.
 * Missing spine id → treat as mismatch (projection must not win).
 */
export function projectionMatchesActiveSpine(
  projectionConversationId: string | null | undefined,
): boolean {
  const spineId = getActiveSpineConversationId();
  const proj = projectionConversationId?.trim() || "";
  if (!spineId || !proj) return false;
  return spineId === proj;
}
