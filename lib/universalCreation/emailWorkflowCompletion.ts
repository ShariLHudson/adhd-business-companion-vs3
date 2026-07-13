/**
 * Email workflow completion — approved draft → awaiting final actions.
 * Approval of wording ≠ permission to send.
 */

import type { UniversalCreationSession } from "./types";

/** Explicit Email workflow states mapped onto UniversalCreationPhase. */
export type EmailWorkflowState =
  | "intake"
  | "drafting"
  | "reviewing"
  | "approved"
  | "awaiting_action"
  | "editing"
  | "draft_created"
  | "sent"
  | "saved"
  | "cancelled";

export function emailWorkflowStateFromSession(
  session: UniversalCreationSession | null | undefined,
): EmailWorkflowState | null {
  if (!session || session.documentType !== "email") return null;
  switch (session.phase) {
    case "discovery":
    case "preparation":
      return "intake";
    case "guided_creation":
    case "enhancement":
      return session.draftContent ? "drafting" : "intake";
    case "review":
      return "reviewing";
    case "revision":
      return "editing";
    case "approval":
      return session.approvedDraft ? "approved" : "reviewing";
    case "awaiting_action":
      return "awaiting_action";
    case "completion":
      return session.approvedDraft ? "awaiting_action" : "drafting";
    default:
      return "intake";
  }
}

export const DRAFT_APPROVAL_RE =
  /\b(?:no changes|i like it|that looks good|looks good|use this|that works|it'?s ready|keep it(?: as written)?|let'?s send it|good as is|perfect|ready to (?:go|send)|no(?:pe)?(?:,|\s+i|\s+changes)?)\b/i;

export const SHOW_FINISHED_EMAIL_RE =
  /\b(?:let'?s write(?: the)? email|write(?: the)? email|show(?: me)?(?: the)?(?: finished| approved| final)?(?: email| draft)|where(?:'s| is)(?: the)?(?: email| draft)|open(?: the)?(?: email| draft)|activate(?: the)?(?: email| draft))\b/i;

export const EXPLICIT_EMAIL_START_OVER_RE =
  /\b(?:start over|start again|write a (?:new|different|another) email|different email|new email)\b/i;

export function hasUsableApprovedEmailDraft(
  session: UniversalCreationSession | null | undefined,
): boolean {
  if (!session || session.documentType !== "email") return false;
  if (!session.draftContent?.trim()) return false;
  return (
    Boolean(session.approvedDraft) ||
    session.phase === "awaiting_action" ||
    session.phase === "approval" ||
    session.phase === "completion"
  );
}

export function formatEmailAwaitingActionMenu(): string {
  return [
    "Your email is ready. What would you like to do?",
    "",
    "1. Copy Email",
    "2. Create Gmail Draft",
    "3. Send Email",
    "4. Make Changes",
    "5. Save for Later",
  ].join("\n");
}

export function formatApprovedEmailReply(draftBody: string): string {
  return [
    "Your email is ready.",
    "",
    draftBody.trim(),
    "",
    formatEmailAwaitingActionMenu(),
  ].join("\n");
}

export function formatEmailAwaitingActionRecovery(): string {
  return "Your email is ready. Would you like to copy it, create a Gmail draft, send it, or make changes?";
}

export function parseEmailAwaitingAction(
  reply: string,
):
  | "copy"
  | "gmail_draft"
  | "send"
  | "make_changes"
  | "save"
  | null {
  const t = reply.trim().toLowerCase();
  if (/^1\b|\bcopy\b/.test(t)) return "copy";
  if (/^2\b|gmail|google draft|create (?:a )?draft/.test(t)) return "gmail_draft";
  if (/^3\b|\bsend\b/.test(t) && !/don'?t send|not send/.test(t)) return "send";
  if (/^4\b|make changes|edit|revise|change/.test(t)) return "make_changes";
  if (/^5\b|save for later|save it|save for/.test(t)) return "save";
  return null;
}
