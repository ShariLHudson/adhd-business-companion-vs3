/**
 * Pure completion gate — authorize success messaging only.
 */

import { HONEST_PROMISE_ALTERNATIVES } from "@/lib/trustContract";
import type {
  AuthorizeSuccessInput,
  AuthorizeSuccessResult,
  CreationCompletionReceipt,
  SuccessClaimKind,
} from "./types";

const HONEST_BY_CLAIM: Record<SuccessClaimKind, string> = {
  opened: HONEST_PROMISE_ALTERNATIVES.opened,
  created: HONEST_PROMISE_ALTERNATIVES.created,
  saved: HONEST_PROMISE_ALTERNATIVES.saved,
  organized: HONEST_PROMISE_ALTERNATIVES.organized,
  updated: HONEST_PROMISE_ALTERNATIVES.updated,
  continue: HONEST_PROMISE_ALTERNATIVES.continue,
  added: HONEST_PROMISE_ALTERNATIVES.added,
};

function requireFields(
  receipt: CreationCompletionReceipt,
  fields: (keyof CreationCompletionReceipt)[],
): string[] {
  const missing: string[] = [];
  for (const field of fields) {
    if (field === "eventRecordId") {
      if (!receipt.eventRecordId) missing.push("eventRecordId");
      continue;
    }
    if (!receipt[field]) missing.push(String(field));
  }
  return missing;
}

/**
 * May Shari claim this success given the receipt?
 * Does not perform work. Does not mutate state.
 */
export function authorizeSuccessMessage(
  input: AuthorizeSuccessInput,
): AuthorizeSuccessResult {
  const { claimKind, receipt } = input;
  let missing: string[] = [];

  switch (claimKind) {
    case "opened":
      // Estate Create: record + bind + estate mount.
      // Split verify alone is never enough for Creation Platform claims.
      missing = requireFields(receipt, [
        "eventRecordId",
        "eventRecordBoundToSession",
        "createEstateMounted",
      ]);
      break;
    case "created":
      missing = requireFields(receipt, [
        "eventRecordId",
        "persistSucceeded",
      ]);
      break;
    case "saved":
    case "added":
    case "updated":
      missing = requireFields(receipt, ["persistSucceeded"]);
      break;
    case "organized":
      missing = requireFields(receipt, [
        "eventRecordId",
        "factsPresentOnRecord",
      ]);
      break;
    case "continue":
      missing = requireFields(receipt, ["resumeAvailable"]);
      break;
    default:
      missing = ["unknown_claim"];
  }

  const allowed = missing.length === 0;
  return {
    allowed,
    claimKind,
    missing,
    honestRecoveryMessage: HONEST_BY_CLAIM[claimKind],
  };
}

/** Empty receipt — nothing verified. */
export function emptyCompletionReceipt(): CreationCompletionReceipt {
  return {
    eventRecordId: null,
    eventRecordBoundToSession: false,
    createEstateMounted: false,
    splitWorkspaceVerified: false,
    persistSucceeded: false,
    resumeAvailable: false,
    factsPresentOnRecord: false,
  };
}

/**
 * Documents today's Event open path: record may exist, bind/mount not yet.
 * Used in tests to prove the architectural gap — not for production speech.
 */
export function receiptAfterRecordOnly(
  eventRecordId: string,
): CreationCompletionReceipt {
  return {
    ...emptyCompletionReceipt(),
    eventRecordId,
    persistSucceeded: true,
  };
}
