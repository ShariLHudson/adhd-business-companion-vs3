/**
 * Guard transcript-text ownership recovery (Phase 3E).
 * recoverCollectionPendingFromAssistant may only revive a valid unanswered offer.
 */

import { loadCollectionPendingOffer } from "@/lib/estate/collectionFramework/collectionPendingOffer";
import { isConfirmationAcceptance } from "@/lib/conversationConfirmationGate";
import { getSpineOwnership } from "./ownershipStore";
import type { ConversationExperienceOwner } from "./types";

const BLOCKING_OWNERS: ConversationExperienceOwner[] = [
  "create",
  "talk_it_out",
  "intent_workflow",
  "chamber",
  "board",
];

export type CollectionRecoveryGuardInput = {
  userText: string;
  /** True when CPC believes last assistant was a collection offer. */
  lastAssistantLooksLikeOffer: boolean;
  /** Confirmation reply (yes/no style) for this turn. */
  isConfirmationReply: boolean;
  /** Turn distance since offer was made, if known. */
  turnsSinceOffer?: number;
  /** Max turns an unanswered offer may be recovered (default 2). */
  maxRecoveryTurns?: number;
};

export type CollectionRecoveryGuardResult = {
  allow: boolean;
  reason: string;
};

/**
 * Whether recoverCollectionPendingFromAssistant may run.
 * Never after decline, incompatible owner, expiration, or unrelated later yes.
 */
export function mayRecoverCollectionPendingFromAssistant(
  input: CollectionRecoveryGuardInput,
): CollectionRecoveryGuardResult {
  if (loadCollectionPendingOffer()) {
    return { allow: false, reason: "pending_already_present" };
  }
  if (!input.lastAssistantLooksLikeOffer) {
    return { allow: false, reason: "last_assistant_not_offer" };
  }
  if (!input.isConfirmationReply || !isConfirmationAcceptance(input.userText)) {
    return { allow: false, reason: "not_acceptance_of_active_offer" };
  }

  const ownership = getSpineOwnership();
  if (ownership) {
    if (ownership.owner === "none" || ownership.status === "completed") {
      return { allow: false, reason: "ownership_completed_or_none" };
    }
    if (ownership.status === "releasing") {
      return { allow: false, reason: "ownership_releasing" };
    }
    if (BLOCKING_OWNERS.includes(ownership.owner)) {
      return { allow: false, reason: `blocked_by_${ownership.owner}` };
    }
    // After decline / explicit override, spine is companion — do not revive.
    if (
      ownership.owner === "companion" &&
      /decline|not_now|release|override|exit|task_change/i.test(ownership.reason)
    ) {
      return { allow: false, reason: "companion_after_release" };
    }
    // Only recover when spine still expects a confirmation/collection reply.
    if (
      ownership.owner !== "confirmation" &&
      ownership.owner !== "collection_offer"
    ) {
      return { allow: false, reason: "spine_owner_not_collection_family" };
    }
  } else {
    // No spine ownership — migration compatibility: allow only immediate accept.
    // Unrelated later "yes" without ownership record must not revive.
    return { allow: false, reason: "no_spine_ownership_for_recovery" };
  }

  const maxTurns = input.maxRecoveryTurns ?? 2;
  if (
    typeof input.turnsSinceOffer === "number" &&
    input.turnsSinceOffer > maxTurns
  ) {
    return { allow: false, reason: "offer_expired" };
  }

  return { allow: true, reason: "valid_active_unanswered_offer" };
}
