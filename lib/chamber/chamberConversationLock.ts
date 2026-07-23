/**
 * Chamber specialist conversation lock.
 *
 * When a Chamber member is active, that companion owns the turn end-to-end:
 * no research/estate-guide/frictionless local divert, no cross-companion
 * relationship-intelligence injection, no implied-place kernel handoff.
 */

import type { PrimaryTurnDecision } from "@/lib/conversation/primaryTurnClassifier";

/** True when a Chamber member conversation is in progress — block room exits from chat routing. */
export function isChamberMemberConversationActive(input: {
  activeSection: string | null | undefined;
  activeMemberId: string | null | undefined;
}): boolean {
  return (
    input.activeSection === "chamber-of-momentum" &&
    Boolean(input.activeMemberId?.trim())
  );
}

/**
 * Primary-turn decision that keeps the message with the active companion.
 * Classifier categories like INFORMATION_OR_RESEARCH must not re-route away.
 */
export function buildChamberSpecialistPrimaryTurn(
  memberId: string,
): PrimaryTurnDecision {
  const id = memberId.trim();
  return {
    type: "RELATIONSHIP_CHAT",
    confidence: "high",
    owner: `chamber:${id}`,
    reason:
      "active Chamber specialist owns turn — stay in companion chat (no research/frictionless divert)",
    blockKernelNavigation: true,
    blockBridgeResponder: true,
    blockCollectionOffer: true,
    blockSecondaryResponders: true,
  };
}

/**
 * Generic handlers must not steal an active Chamber turn.
 * Covers frictionless local replies, estate-guide bypass, RI, and observers.
 */
export function chamberSpecialistBlocksGenericHandlers(input: {
  activeSection: string | null | undefined;
  activeMemberId: string | null | undefined;
}): boolean {
  return isChamberMemberConversationActive(input);
}
