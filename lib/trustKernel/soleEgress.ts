/**
 * Sprint T1 — Sole member-visible Creation claim egress.
 * Every Creation success line must pass authorizeMemberClaim here.
 */

import { scrubUnverifiedPromises } from "@/lib/trustContract";
import { authorizeMemberClaim } from "./authorizeClaim";
import {
  buildActionReceiptFromEvidence,
  CREATION_PENDING_LANGUAGE,
  honestCreationFailureMessage,
  type PlatformCreationEvidence,
} from "./creationEvidence";
import type { ActionReceipt, MemberClaimKind } from "./types";
import { isContextFresh } from "./authorizeClaim";

export type CreationEgressResult = {
  text: string;
  authorized: boolean;
  receipt: ActionReceipt;
  claimDelivered: MemberClaimKind | "pending" | "recovery";
  missing: string[];
};

const SUCCESS_CLAIM_RE =
  /\bI(?:'ve|’ve| have)? (?:opened|created|saved|organized|updated|added)\b|\bworkspace is ready\b|\bis open(?:ed)?\b|\bWe can continue where\b|\bContinue Where You Left Off\b/i;

/** In-flight Creation ops — one actionId per operation key. */
const inflightOps = new Map<string, string>();

export function beginCreationOperation(
  operationKey: string,
  actionId: string,
): boolean {
  const existing = inflightOps.get(operationKey);
  if (existing && existing !== actionId) return false;
  inflightOps.set(operationKey, actionId);
  return true;
}

export function endCreationOperation(
  operationKey: string,
  actionId: string,
): void {
  if (inflightOps.get(operationKey) === actionId) {
    inflightOps.delete(operationKey);
  }
}

export function isCreationOperationInFlight(operationKey: string): boolean {
  return inflightOps.has(operationKey);
}

/** Test helper */
export function clearCreationOperationLocks(): void {
  inflightOps.clear();
}

export function isCreationResultApplicable(input: {
  resultRequestId: string | null;
  activeRequestId: string;
  resultContextVersion: number | null;
  activeContextVersion: number;
  resultCreationId: string | null;
  activeCreationId: string | null;
}): boolean {
  if (
    !isContextFresh({
      resultRequestId: input.resultRequestId,
      activeRequestId: input.activeRequestId,
      resultContextVersion: input.resultContextVersion,
      activeContextVersion: input.activeContextVersion,
    })
  ) {
    return false;
  }
  if (
    input.activeCreationId &&
    input.resultCreationId &&
    input.resultCreationId !== input.activeCreationId
  ) {
    return false;
  }
  return true;
}

/**
 * Strip leftover success phrasing when evidence cannot support it.
 */
function hardenCreationCopy(
  text: string,
  evidence: PlatformCreationEvidence,
): string {
  let result = scrubUnverifiedPromises(text, {
    workspaceVerified: evidence.memberVisible && evidence.workspaceMounted,
    eventRecordBound: evidence.workspaceBound,
    persistSucceeded: evidence.recordPersisted,
    resumeAvailable: evidence.resumeIndexed && Boolean(evidence.creationId),
    factsOrganized: evidence.recordPersisted,
  });

  if (!evidence.memberVisible || !evidence.workspaceMounted) {
    result = result
      .replace(/\b(?:Your |Event )?workspace is ready\b[^.!?\n]*/gi, "")
      .replace(
        /\bI(?:'ve|’ve| have)? shaped an Event Creation Workspace\b[^.!?\n]*/gi,
        "",
      )
      .replace(/\bI(?:'ve|’ve| have)? opened\b[^.!?\n]*/gi, "")
      .replace(/\bis open(?:ed)?\b[^.!?\n]*/gi, "");
  }

  if (!evidence.resumeIndexed) {
    result = result.replace(
      /\b(?:We can )?continue where you left off\b[^.!?\n]*/gi,
      "",
    );
  }

  // 066 — never describe chat beside / over workspace
  result = result
    .replace(/\bbeside (?:chat|your conversation)\b/gi, "with you")
    .replace(/\bsplit (?:view|screen)\b/gi, "workspace")
    .replace(/\bfloating chat\b/gi, "guidance")
    .replace(/\bpanel on the right\b/gi, "workspace");

  return result.replace(/\s{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Sole egress: authorize Creation claim → return member-safe text.
 */
export function authorizeCreationEgress(input: {
  claim: MemberClaimKind;
  proposedMessage: string;
  evidence: PlatformCreationEvidence;
}): CreationEgressResult {
  const receipt = buildActionReceiptFromEvidence(input.evidence);
  const decision = authorizeMemberClaim(input.claim, receipt);

  if (!decision.allowed) {
    // Prefer evidence-specific recovery (mount/persist) over generic Kernel copy
    const recovery =
      honestCreationFailureMessage(input.evidence) ||
      decision.honestRecoveryMessage?.trim() ||
      CREATION_PENDING_LANGUAGE.genericRecovery;
    return {
      text: recovery,
      authorized: false,
      receipt,
      claimDelivered: input.evidence.failureState ? "recovery" : "pending",
      missing: decision.missing,
    };
  }

  let text = hardenCreationCopy(input.proposedMessage, input.evidence);
  // If proposed was empty after harden, use a verified ready line (066)
  if (!text.trim()) {
    text = input.evidence.memberVisible
      ? "Let's work on your workshop together."
      : CREATION_PENDING_LANGUAGE.gettingReady;
  }

  return {
    text,
    authorized: true,
    receipt,
    claimDelivered: input.claim,
    missing: [],
  };
}

/**
 * Infer whether proposed copy is making a success claim that needs Kernel.
 */
export function proposedMessageNeedsCreationAuthorization(
  text: string,
): boolean {
  return SUCCESS_CLAIM_RE.test(text);
}
