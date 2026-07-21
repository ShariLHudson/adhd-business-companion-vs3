/**
 * 068 — Creation Commit Coordinator
 * Verifies only. Never performs Creation work.
 */

export const CREATION_COMMIT_COORDINATOR_STANDARD_ID = "068" as const;

export type SuccessClaimKind =
  | "opened"
  | "created"
  | "saved"
  | "organized"
  | "updated"
  | "continue"
  | "added";

/**
 * Facts only — populated by callers after operations complete.
 * The coordinator never fills these itself.
 */
export type CreationCompletionReceipt = {
  eventRecordId: string | null;
  eventRecordBoundToSession: boolean;
  createEstateMounted: boolean;
  /** Legacy split panel verified (home + panel + reveal) — not sufficient for Estate Create */
  splitWorkspaceVerified: boolean;
  persistSucceeded: boolean;
  resumeAvailable: boolean;
  factsPresentOnRecord: boolean;
};

export type AuthorizeSuccessInput = {
  claimKind: SuccessClaimKind;
  receipt: CreationCompletionReceipt;
  /** Optional proposed copy — coordinator may reject even if non-empty */
  proposedMessage?: string | null;
};

export type AuthorizeSuccessResult = {
  allowed: boolean;
  claimKind: SuccessClaimKind;
  missing: string[];
  /** Use when allowed === false */
  honestRecoveryMessage: string;
};

export const CREATION_COMMIT_COORDINATOR_RULE = {
  id: CREATION_COMMIT_COORDINATOR_STANDARD_ID,
  name: "Creation Commit Coordinator",
  performsWork: false,
  principle:
    "Shari may not narrate platform success until the platform has verified that success.",
} as const;
