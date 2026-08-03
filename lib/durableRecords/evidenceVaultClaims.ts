/**
 * Evidence Vault completion-integrity claims.
 *
 * The single place that turns a durable receipt into a member-facing claim for
 * the Saved Evidence view, mirroring savedWorkClaims.ts. Governing rule: Spark
 * Estate may say a discovery was saved ONLY when
 *   receipt.ok === true && receipt.durable === true.
 * LocalStorage success, optimistic state, or an attempted request must never
 * produce a durable-success claim. Technical `cause`/error codes are never
 * placed in member-facing copy.
 */

import type { EvidenceEntry } from "@/lib/evidenceBankStore";
import type { DurableRecordResult } from "./types";

export type EvidenceVaultAction = "save" | "create" | "update" | "delete";

export type EvidenceVaultClaimStatus =
  | "durably_saved"
  | "retained_for_retry"
  | "failed";

export type EvidenceVaultClaim = {
  status: EvidenceVaultClaimStatus;
  /** True ONLY when durably saved — the one gate for any "saved" claim. */
  durable: boolean;
  /** Calm, member-safe copy. Never contains technical cause or codes. */
  message: string;
  /** Whether a single retry is a sensible recovery action. */
  retryable: boolean;
};

const SUCCESS_COPY: Record<EvidenceVaultAction, string> = {
  save: "Saved to your Evidence Vault.",
  create: "Saved to your Evidence Vault.",
  update: "Saved.",
  delete: "Removed from your Evidence Vault.",
};

export function resolveEvidenceVaultClaim(
  receipt: DurableRecordResult<EvidenceEntry>,
  action: EvidenceVaultAction,
): EvidenceVaultClaim {
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

/** True when the interface is allowed to state the discovery was saved. */
export function mayClaimEvidenceSaved(
  receipt: DurableRecordResult<EvidenceEntry>,
): boolean {
  return receipt.ok === true && receipt.durable === true;
}
