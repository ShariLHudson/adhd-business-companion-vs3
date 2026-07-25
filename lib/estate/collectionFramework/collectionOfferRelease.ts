/**
 * Release Collection / win-save confirmation ownership.
 * Newest explicit member instruction wins over a stale save prompt.
 */

import {
  isExplicitOwnerExit,
  isExplicitTaskChange,
} from "@/lib/conversationContinuity/exitRules";
import { detectWorkflowCorrection } from "@/lib/conversationContinuity/workflowCorrection";
import {
  classifyTurnRecovery,
  type TurnRecoveryType,
} from "@/lib/shariAnswerFirst/turnRecovery";
import {
  isConfirmationAcceptance,
  isPureConfirmationDecline,
} from "@/lib/conversationConfirmationGate";
import { clearWinSavePending, loadWinSavePending } from "@/lib/estate/winSavePending";
import { clearAllCollectionPrefills } from "./collectionPrefillStore";
import {
  clearCollectionPendingOffer,
  loadCollectionPendingOffer,
  markCollectionOfferCooldown,
} from "./collectionPendingOffer";
import { isCollectionOfferMessage } from "./collectionOfferIntelligence";
import type { CollectionOfferReply } from "./collectionOfferFlow";

/** Explicit create / revise instruction that must outrank a pending save prompt. */
const EXPLICIT_CREATE_OR_REVISE_RE =
  /\b(?:add|include|insert|put|change|revise|update|rewrite|edit|make|remove|delete)\b[\s\S]{0,80}\b(?:email|draft|newsletter|sop|proposal|document|message|letter)\b/i;

const EXPLICIT_EMAIL_REVISION_RE =
  /\b(?:add|include|insert|put|change|revise|update|rewrite|edit)\b[\s\S]{0,60}\b(?:to|into|in|on)\s+(?:the|my|this|our)\s+(?:email|draft)\b/i;

export function isExplicitCreateOrRevisionRequest(userText: string): boolean {
  const t = userText.trim();
  if (!t || t.length < 8) return false;
  if (isConfirmationAcceptance(t) || isPureConfirmationDecline(t)) return false;
  return EXPLICIT_CREATE_OR_REVISE_RE.test(t) || EXPLICIT_EMAIL_REVISION_RE.test(t);
}

export function hasPendingCollectionOwnership(): boolean {
  return Boolean(loadCollectionPendingOffer() || loadWinSavePending());
}

/**
 * Clear Collection offer, win-save pending, and destination prefill seeds.
 * Does not touch Create session / Continuity owner (those use Continuity rules).
 */
export function clearCollectionOfferOwnership(opts?: {
  currentTurn?: number;
}): void {
  clearCollectionPendingOffer();
  clearWinSavePending();
  clearAllCollectionPrefills();
  if (typeof opts?.currentTurn === "number") {
    markCollectionOfferCooldown(opts.currentTurn);
  }
}

export type CollectionOwnershipReleaseReason =
  | "decline"
  | "not_now"
  | "owner_exit"
  | "task_change"
  | "workflow_correction"
  | "explicit_create_or_revision"
  | "turn_recovery"
  | "none";

/**
 * Whether a newer user turn must release a pending Collection / win-save prompt.
 */
export function shouldReleasePendingCollectionOwnership(userText: string): {
  release: boolean;
  reason: CollectionOwnershipReleaseReason;
  recoveryType: TurnRecoveryType;
} {
  const recoveryType = classifyTurnRecovery(userText);
  if (!hasPendingCollectionOwnership()) {
    return { release: false, reason: "none", recoveryType };
  }

  if (isExplicitOwnerExit(userText)) {
    return { release: true, reason: "owner_exit", recoveryType };
  }
  if (isExplicitTaskChange(userText)) {
    return { release: true, reason: "task_change", recoveryType };
  }
  const correction = detectWorkflowCorrection(userText);
  if (correction.isCorrection) {
    return { release: true, reason: "workflow_correction", recoveryType };
  }
  // Pending Collection offer is sticky ownership — correction language must
  // release even when Create session is not active (detectWorkflowCorrection
  // otherwise no-ops without sticky create).
  if (
    /\b(?:actually i meant|that(?:'?s| is) not what i mean|you misunderstood|let'?s do something else|i said)\b/i.test(
      userText,
    )
  ) {
    return { release: true, reason: "workflow_correction", recoveryType };
  }
  if (isExplicitCreateOrRevisionRequest(userText)) {
    return {
      release: true,
      reason: "explicit_create_or_revision",
      recoveryType,
    };
  }
  if (
    recoveryType === "correction" ||
    recoveryType === "revision"
  ) {
    // Only release when the turn is substantive — not bare "no" (handled by decline).
    if (userText.trim().length >= 12 && !isPureConfirmationDecline(userText)) {
      return { release: true, reason: "turn_recovery", recoveryType };
    }
  }

  return { release: false, reason: "none", recoveryType };
}

/**
 * Whether a handled Collection reply may keep confirmation ownership.
 * Decline / open / unhandled must never re-arm awaitingUserConfirmation.
 */
export function shouldReArmCollectionConfirmation(
  reply: Pick<Extract<CollectionOfferReply, { handled: true }>, "kind" | "ack">,
): boolean {
  if (reply.kind === "decline" || reply.kind === "open" || reply.kind === "ack") {
    return false;
  }
  return reply.kind === "menu" || isCollectionOfferMessage(reply.ack);
}
