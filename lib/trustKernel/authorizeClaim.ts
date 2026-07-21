/**
 * Trust Kernel — authorize member-visible claims from Action Receipts.
 * Does not perform Creation work.
 */

import { authorizeSuccessMessage } from "@/lib/creationCommitCoordinator";
import { HONEST_PROMISE_ALTERNATIVES } from "@/lib/trustContract";
import type {
  ActionReceipt,
  ActionReceiptStage,
  MemberClaimKind,
  TrustKernelDecision,
} from "./types";

const STAGE_RANK: Record<ActionReceiptStage, number> = {
  intent_recognized: 1,
  creation_initialized: 2,
  creation_persisted: 3,
  workspace_bound: 4,
  member_visible: 5,
  resume_available: 5,
  action_failed_recoverably: 0,
  action_failed_without_state_loss: 0,
};

const CLAIM_REQUIRED_STAGE: Record<MemberClaimKind, ActionReceiptStage | null> =
  {
    intent_only: "intent_recognized",
    created: "creation_persisted",
    saved: "creation_persisted",
    added: "creation_persisted",
    updated: "creation_persisted",
    organized: "creation_persisted",
    opened: "member_visible",
    ready: "member_visible",
    continue: "resume_available",
  };

function hasStage(
  receipt: ActionReceipt,
  required: ActionReceiptStage,
): boolean {
  if (
    receipt.stage === "action_failed_recoverably" ||
    receipt.stage === "action_failed_without_state_loss"
  ) {
    return false;
  }
  return STAGE_RANK[receipt.stage] >= STAGE_RANK[required];
}

/**
 * May this claim be shown to the member given the receipt?
 */
export function authorizeMemberClaim(
  claim: MemberClaimKind,
  receipt: ActionReceipt | null,
): TrustKernelDecision {
  const required = CLAIM_REQUIRED_STAGE[claim];
  if (!receipt) {
    return {
      allowed: false,
      missing: ["action_receipt"],
      requiredStage: required,
      honestRecoveryMessage:
        claim === "intent_only"
          ? null
          : HONEST_PROMISE_ALTERNATIVES.opened,
    };
  }

  if (
    receipt.stage === "action_failed_recoverably" ||
    receipt.stage === "action_failed_without_state_loss"
  ) {
    return {
      allowed: false,
      missing: ["operation_failed"],
      requiredStage: required,
      honestRecoveryMessage:
        "Something got tangled for a second, but your work is still here.",
    };
  }

  const missing: string[] = [];
  if (required && !hasStage(receipt, required)) {
    missing.push(`stage<${required}`);
  }

  // Creation opened/ready also require 068 completion receipt when present
  if (
    (claim === "opened" || claim === "ready") &&
    receipt.creationReceipt
  ) {
    const gate = authorizeSuccessMessage({
      claimKind: "opened",
      receipt: receipt.creationReceipt,
    });
    if (!gate.allowed) {
      missing.push(...gate.missing.map((m) => `creation:${m}`));
    }
  }

  if (
    (claim === "continue" || claim === "opened" || claim === "ready") &&
    !receipt.creationId &&
    !receipt.eventRecordId
  ) {
    missing.push("creation_identity");
  }

  if (claim === "continue" && receipt.creationReceipt) {
    const gate = authorizeSuccessMessage({
      claimKind: "continue",
      receipt: receipt.creationReceipt,
    });
    if (!gate.allowed) {
      missing.push(...gate.missing.map((m) => `creation:${m}`));
    }
  }

  if (
    (claim === "created" || claim === "saved") &&
    receipt.creationReceipt
  ) {
    const gate = authorizeSuccessMessage({
      claimKind: claim === "saved" ? "saved" : "created",
      receipt: receipt.creationReceipt,
    });
    if (!gate.allowed) {
      missing.push(...gate.missing.map((m) => `creation:${m}`));
    }
  }

  const allowed = missing.length === 0;
  return {
    allowed,
    missing,
    requiredStage: required,
    honestRecoveryMessage: allowed
      ? null
      : claim === "saved"
        ? HONEST_PROMISE_ALTERNATIVES.saved
        : claim === "continue"
          ? HONEST_PROMISE_ALTERNATIVES.continue
          : HONEST_PROMISE_ALTERNATIVES.opened,
  };
}

/** Stale async results must not apply when versions diverge. */
export function isContextFresh(input: {
  resultContextVersion: number | null;
  activeContextVersion: number;
  resultRequestId: string | null;
  activeRequestId: string;
}): boolean {
  if (
    input.resultRequestId &&
    input.resultRequestId !== input.activeRequestId
  ) {
    return false;
  }
  if (
    input.resultContextVersion != null &&
    input.resultContextVersion !== input.activeContextVersion
  ) {
    return false;
  }
  return true;
}
