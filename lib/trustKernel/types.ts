/**
 * 069 — Trust Kernel
 * Truth and completion boundary — not a Creation engine.
 */

import type { CreationCompletionReceipt } from "@/lib/creationCommitCoordinator";

export const TRUST_KERNEL_STANDARD_ID = "069" as const;

export const TRUST_KERNEL_RULE = {
  id: TRUST_KERNEL_STANDARD_ID,
  name: "Trust Kernel",
  isCreationEngine: false,
  principle:
    "Shari’s words, visible UI, persisted state, and resume must describe the same reality.",
} as const;

/** Structured stages that authorize member-visible claims. */
export type ActionReceiptStage =
  | "intent_recognized"
  | "creation_initialized"
  | "creation_persisted"
  | "workspace_bound"
  | "member_visible"
  | "resume_available"
  | "action_failed_recoverably"
  | "action_failed_without_state_loss";

export type ActionReceipt = {
  stage: ActionReceiptStage;
  creationId: string | null;
  eventRecordId: string | null;
  requestId: string | null;
  turnId: string | null;
  conversationThreadId: string | null;
  contextVersion: number | null;
  at: string;
  /** Optional Creation receipt composed into Kernel checks */
  creationReceipt?: CreationCompletionReceipt | null;
};

export type MessageOutboxState =
  | "pending"
  | "accepted"
  | "processing"
  | "completed"
  | "failed";

export type MessageOutboxEntry = {
  id: string;
  state: MessageOutboxState;
  userText: string;
  requestId: string;
  turnId: string;
  conversationThreadId: string | null;
  creationId: string | null;
  contextVersion: number;
  acceptedAt: string | null;
  completedAt: string | null;
  failureMemberMessage: string | null;
};

export type MemberClaimKind =
  | "opened"
  | "created"
  | "saved"
  | "organized"
  | "updated"
  | "continue"
  | "added"
  | "ready"
  | "intent_only";

export type TrustKernelDecision = {
  allowed: boolean;
  missing: string[];
  requiredStage: ActionReceiptStage | null;
  honestRecoveryMessage: string | null;
};
