/**
 * Sprint T1 — Platform Creation evidence → Action Receipt.
 * Facts only from completed runtime state — never intent or assumption.
 */

import {
  emptyCompletionReceipt,
  type CreationCompletionReceipt,
} from "@/lib/creationCommitCoordinator";
import type { ActionReceipt, ActionReceiptStage } from "./types";

export type PlatformCreationEvidence = {
  actionId: string;
  requestId: string;
  turnId: string;
  conversationThreadId: string | null;
  creationId: string | null;
  creationType: string | null;
  operation: string;
  intentRecognized: boolean;
  recordCreated: boolean;
  recordPersisted: boolean;
  workspaceBound: boolean;
  workspaceMounted: boolean;
  memberVisible: boolean;
  resumeIndexed: boolean;
  currentFocusAvailable: boolean;
  failureState: string | null;
  recoveryAvailable: boolean;
  contextVersion: number;
  verifiedAt: string;
};

export const CREATION_PENDING_LANGUAGE = {
  gettingReady: "I'm getting your workshop ready.",
  mountFailed:
    "Your workshop details are safe, but the workspace didn't finish opening.",
  persistFailed: "I received that, but I couldn't finish saving it.",
  resumeNotReady:
    "Your workshop is here — we can keep working from this exact plan.",
  genericRecovery:
    "Something got tangled for a second, but your work is still here.",
} as const;

export function emptyCreationEvidence(
  partial?: Partial<PlatformCreationEvidence>,
): PlatformCreationEvidence {
  return {
    actionId: partial?.actionId ?? `action-${Date.now()}`,
    requestId: partial?.requestId ?? "",
    turnId: partial?.turnId ?? "",
    conversationThreadId: partial?.conversationThreadId ?? null,
    creationId: partial?.creationId ?? null,
    creationType: partial?.creationType ?? null,
    operation: partial?.operation ?? "unknown",
    intentRecognized: partial?.intentRecognized ?? false,
    recordCreated: partial?.recordCreated ?? false,
    recordPersisted: partial?.recordPersisted ?? false,
    workspaceBound: partial?.workspaceBound ?? false,
    workspaceMounted: partial?.workspaceMounted ?? false,
    memberVisible: partial?.memberVisible ?? false,
    resumeIndexed: partial?.resumeIndexed ?? false,
    currentFocusAvailable: partial?.currentFocusAvailable ?? false,
    failureState: partial?.failureState ?? null,
    recoveryAvailable: partial?.recoveryAvailable ?? true,
    contextVersion: partial?.contextVersion ?? 0,
    verifiedAt: partial?.verifiedAt ?? new Date().toISOString(),
  };
}

export function toCreationCompletionReceipt(
  evidence: PlatformCreationEvidence,
): CreationCompletionReceipt {
  return {
    ...emptyCompletionReceipt(),
    eventRecordId: evidence.creationId,
    eventRecordBoundToSession: evidence.workspaceBound,
    createEstateMounted: evidence.workspaceMounted && evidence.memberVisible,
    persistSucceeded: evidence.recordPersisted,
    resumeAvailable: evidence.resumeIndexed && Boolean(evidence.creationId),
    factsPresentOnRecord: evidence.recordPersisted,
  };
}

export function resolveReceiptStage(
  evidence: PlatformCreationEvidence,
): ActionReceiptStage {
  if (evidence.failureState === "state_lost") {
    return "action_failed_without_state_loss";
  }
  if (evidence.failureState) {
    return "action_failed_recoverably";
  }
  if (
    evidence.resumeIndexed &&
    evidence.memberVisible &&
    evidence.workspaceBound &&
    evidence.recordPersisted
  ) {
    return "resume_available";
  }
  if (evidence.memberVisible && evidence.workspaceMounted) {
    return "member_visible";
  }
  if (evidence.workspaceBound) {
    return "workspace_bound";
  }
  if (evidence.recordPersisted) {
    return "creation_persisted";
  }
  if (evidence.recordCreated || evidence.intentRecognized) {
    return evidence.recordCreated
      ? "creation_initialized"
      : "intent_recognized";
  }
  return "intent_recognized";
}

export function buildActionReceiptFromEvidence(
  evidence: PlatformCreationEvidence,
): ActionReceipt {
  return {
    stage: resolveReceiptStage(evidence),
    creationId: evidence.creationId,
    eventRecordId: evidence.creationId,
    requestId: evidence.requestId,
    turnId: evidence.turnId,
    conversationThreadId: evidence.conversationThreadId,
    contextVersion: evidence.contextVersion,
    at: evidence.verifiedAt,
    creationReceipt: toCreationCompletionReceipt(evidence),
  };
}

/** Honest recovery copy from incomplete evidence. */
export function honestCreationFailureMessage(
  evidence: PlatformCreationEvidence,
): string {
  if (
    evidence.failureState === "mount_failed" ||
    (evidence.recordPersisted && !evidence.memberVisible)
  ) {
    return CREATION_PENDING_LANGUAGE.mountFailed;
  }
  // 072 — only speak persist failure after an explicit failureState.
  // Do not replay "couldn't finish saving" for async mount races.
  if (evidence.failureState === "persist_failed") {
    return CREATION_PENDING_LANGUAGE.persistFailed;
  }
  if (!evidence.recordPersisted && evidence.intentRecognized) {
    return CREATION_PENDING_LANGUAGE.gettingReady;
  }
  if (evidence.memberVisible && !evidence.resumeIndexed) {
    return CREATION_PENDING_LANGUAGE.resumeNotReady;
  }
  if (!evidence.memberVisible) {
    return CREATION_PENDING_LANGUAGE.gettingReady;
  }
  return CREATION_PENDING_LANGUAGE.genericRecovery;
}
