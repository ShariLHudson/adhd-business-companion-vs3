/**
 * Saved Work completion-integrity claims (Beta Blocker 2).
 *
 * The single place that turns a durable receipt into a member-facing claim.
 * Governing rule: Spark Estate may say work was saved ONLY when
 *   receipt.ok === true && receipt.durable === true.
 * LocalStorage success, optimistic state, an attempted request, or a background
 * task beginning must never produce a durable-success claim.
 *
 * This is the small, proven pattern for the Trust Kernel boundary in this slice
 * (it mirrors trustKernel/authorizeClaim's intent for the durable-record world)
 * and can later be generalized across domains. Technical `cause`/error codes are
 * never placed in member-facing copy.
 */

import type { SavedWorkItem } from "@/lib/savedWorkStore";
import type { DurableRecordResult } from "./types";

export type SavedWorkAction =
  | "save"
  | "create"
  | "update"
  | "delete"
  | "archive"
  | "unarchive";

export type SavedWorkClaimStatus =
  | "durably_saved"
  | "retained_for_retry"
  | "failed";

export type SavedWorkClaim = {
  status: SavedWorkClaimStatus;
  /** True ONLY when durably saved — the one gate for any "saved" claim. */
  durable: boolean;
  /** Calm, member-safe copy. Never contains technical cause or codes. */
  message: string;
  /** Whether a single retry is a sensible recovery action. */
  retryable: boolean;
};

const SUCCESS_COPY: Record<SavedWorkAction, string> = {
  save: "Saved to My Work.",
  create: "Saved to My Work.",
  update: "Saved.",
  delete: "Removed from My Work.",
  archive: "Moved to your archive.",
  unarchive: "Back in My Work.",
};

export function resolveSavedWorkClaim(
  receipt: DurableRecordResult<SavedWorkItem>,
  action: SavedWorkAction,
): SavedWorkClaim {
  // The governing rule — success copy only on verified durable success.
  if (receipt.ok && receipt.durable) {
    return {
      status: "durably_saved",
      durable: true,
      message: SUCCESS_COPY[action],
      retryable: false,
    };
  }
  // Failure: surface only the calm, member-safe message (never `cause`).
  return {
    status: receipt.retryable ? "retained_for_retry" : "failed",
    durable: false,
    message: receipt.message,
    retryable: receipt.retryable,
  };
}

/** True when the interface is allowed to state the work was saved. */
export function mayClaimSaved(
  receipt: DurableRecordResult<SavedWorkItem>,
): boolean {
  return receipt.ok === true && receipt.durable === true;
}
