/**
 * Latest clear intent / correction must override sticky create workflows.
 * Prevents repeating "We were creating your document…" after the member corrects.
 */

import type { ConversationOwner } from "./types";
import { loadUniversalCreationSession } from "@/lib/universalCreation";

const CORRECTION_RE =
  /\b(?:that(?:'?s| is) not what i mean|you misunderstood|i said|i am not|i'?m not|not (?:a |an |the )?(?:document|draft|newsletter|email)|stop|wrong|no[,.]?\s+(?:that|not)|let'?s do something else|not creating a document|creating an? (?:online )?event)\b/i;

const EVENT_INTENT_RE =
  /\b(?:online event|virtual event|webinar|live event|workshop event|host(?:ing)? an? event|create(?: an?)? event)\b/i;

const DOCUMENT_DENY_RE =
  /\b(?:not (?:a |an |the )?document|not creating a document|i am not creating a document|i'?m not creating a document)\b/i;

export type WorkflowCorrectionResult = {
  isCorrection: boolean;
  /** Preferred new intent label for ack copy, if known. */
  correctedIntent?: "online_event" | "other";
  ack: string;
};

/**
 * Detect authoritative corrections that must clear sticky create ownership.
 */
export function detectWorkflowCorrection(
  userText: string,
  owner?: ConversationOwner | null,
): WorkflowCorrectionResult {
  const t = userText.trim();
  if (!t) return { isCorrection: false, ack: "" };

  const session = loadUniversalCreationSession();
  const stickyCreate =
    owner?.kind === "guided_workflow" ||
    owner?.kind === "artifact" ||
    Boolean(session);

  if (!stickyCreate) {
    return { isCorrection: false, ack: "" };
  }

  const deniesDocument = DOCUMENT_DENY_RE.test(t);
  const wantsEvent = EVENT_INTENT_RE.test(t);
  const generalCorrection = CORRECTION_RE.test(t);

  if (!(deniesDocument || wantsEvent || generalCorrection)) {
    return { isCorrection: false, ack: "" };
  }

  // Only treat as correction when it conflicts with sticky document/create flow
  // or clearly names a different creation target.
  const stickyDocument =
    (owner?.kind === "guided_workflow" &&
      /document|draft|newsletter|email/i.test(owner.workflowType ?? "")) ||
    (owner?.kind === "artifact" &&
      /document|draft|newsletter|email/i.test(owner.artifactType ?? "")) ||
    session?.documentType === "document" ||
    !session?.documentType;

  if (!deniesDocument && !wantsEvent && !stickyDocument && !generalCorrection) {
    return { isCorrection: false, ack: "" };
  }

  if (wantsEvent || (deniesDocument && EVENT_INTENT_RE.test(t))) {
    return {
      isCorrection: true,
      correctedIntent: "online_event",
      ack: "You’re right — I misunderstood. We’re creating an online event, not a document. Let’s stay with the event.",
    };
  }

  if (deniesDocument || generalCorrection) {
    return {
      isCorrection: true,
      correctedIntent: "other",
      ack: "You’re right — I misunderstood. Let’s follow what you meant instead.",
    };
  }

  return { isCorrection: false, ack: "" };
}

/** Rejected recovery replies must not repeat. */
const LAST_REJECTED_RECOVERY_KEY = "spark-rejected-workflow-recovery-v1";

export function rememberRejectedRecoveryReply(reply: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(LAST_REJECTED_RECOVERY_KEY, reply.trim());
  } catch {
    /* ignore */
  }
}

export function wasRecoveryReplyJustRejected(reply: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(LAST_REJECTED_RECOVERY_KEY) === reply.trim();
  } catch {
    return false;
  }
}

export function clearRejectedRecoveryReply(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(LAST_REJECTED_RECOVERY_KEY);
  } catch {
    /* ignore */
  }
}
