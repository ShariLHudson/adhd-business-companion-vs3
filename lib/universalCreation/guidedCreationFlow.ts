/**
 * Post-discovery flow — draft permission → show draft → revise → approve → deliver.
 */

import {
  formatApprovalMenu,
  formatCompletionMenu,
  parseApprovalChoice,
} from "./phases";
import {
  DRAFT_APPROVAL_RE,
  EXPLICIT_EMAIL_START_OVER_RE,
  SHOW_FINISHED_EMAIL_RE,
  formatApprovedEmailReply,
  formatEmailAwaitingActionMenu,
  formatEmailAwaitingActionRecovery,
  hasUsableApprovedEmailDraft,
  parseEmailAwaitingAction,
} from "./emailWorkflowCompletion";
import { formatSparkEstateReviewPrompt } from "./sparkEstateCompletionSystem";
import { pluginById } from "./documentRegistry";
import { applyDraftRevision, composeDocumentDraft } from "./draftComposer";
import { isCreateRevisionInstruction } from "./createRevisionDetect";
import type {
  UniversalCreationSession,
  UniversalCreationTurnResult,
} from "./types";

const DRAFT_PERMISSION_RE =
  /\b(?:want me to start the draft|start the draft now|put the first draft together|want me to write it now|enough to draft this email)\b/i;

const DRAFT_AFFIRMATIVE_RE =
  /^(?:yes|yeah|yep|yup|sure|ok(?:ay)?|please|go ahead|start|let'?s|do it|sounds good|ready)\b/i;

const REVIEW_PROMPT_RE =
  /\b(?:take a look|what would you change|review it|here'?s the draft|first draft)\b/i;

const REVISION_DONE_RE =
  /\b(?:does this feel ready|feel ready|ready to print|save to google)\b/i;

const SHOW_DRAFT_RE =
  /\b(?:where (?:is|'s) the draft|show (?:me )?(?:the )?draft|i don'?t see (?:the )?draft|didn'?t see (?:the )?draft|can'?t see (?:the )?draft)\b/i;

const POST_DISCOVERY_PHASES = new Set([
  "guided_creation",
  "enhancement",
  "review",
  "revision",
  "approval",
  "awaiting_action",
  "completion",
]);

export function isPostDiscoveryCreationPhase(
  phase: UniversalCreationSession["phase"],
): boolean {
  return POST_DISCOVERY_PHASES.has(phase);
}

export function isGuidedCreationAssistantContext(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return (
    DRAFT_PERMISSION_RE.test(t) ||
    REVIEW_PROMPT_RE.test(t) ||
    REVISION_DONE_RE.test(t) ||
    /your email is ready/i.test(t) ||
    /copy email|create gmail draft|send email/i.test(t) ||
    formatApprovalMenu()
      .slice(0, 40)
      .split("\n")
      .some((line) => {
        const trimmed = line.trim();
        return trimmed.length > 0 && t.includes(trimmed);
      }) ||
    /\bwhat would you like to do with it\b/i.test(t)
  );
}

function approveDraftSession(
  session: UniversalCreationSession,
): UniversalCreationSession {
  const draftBody = session.draftContent ?? composeDocumentDraft(session);
  return {
    ...session,
    draftContent: draftBody,
    approvedDraft: true,
    phase: "awaiting_action",
  };
}

function showApprovedArtifact(
  session: UniversalCreationSession,
): UniversalCreationTurnResult {
  const updated = approveDraftSession(session);
  const draftBody = updated.draftContent ?? "";
  if (session.documentType === "email") {
    return {
      kind: "draft",
      message: "Your email is ready.",
      draftBody,
      session: updated,
    };
  }
  const plugin = pluginById(session.documentType)!;
  return {
    kind: "message",
    message: [
      "This is ready.",
      "",
      draftBody,
      "",
      formatCompletionMenu(plugin),
    ].join("\n"),
    session: updated,
  };
}

export function advanceGuidedCreationFlow(
  session: UniversalCreationSession,
  userText: string,
  lastAssistantText?: string | null,
): UniversalCreationTurnResult | null {
  const t = userText.trim();
  if (!t) return null;

  const plugin = pluginById(session.documentType);
  if (!plugin) return null;

  // Explicit start-over only — never restart intake from "write the email".
  if (
    EXPLICIT_EMAIL_START_OVER_RE.test(t) &&
    session.documentType === "email"
  ) {
    return null;
  }

  // Approved / awaiting artifact: show finished work, never restart discovery.
  if (
    hasUsableApprovedEmailDraft(session) ||
    (session.approvedDraft && session.draftContent?.trim())
  ) {
    if (SHOW_FINISHED_EMAIL_RE.test(t) || DRAFT_APPROVAL_RE.test(t)) {
      return showApprovedArtifact(session);
    }

    if (session.phase === "awaiting_action" || session.phase === "completion") {
      const action = parseEmailAwaitingAction(t);
      if (action === "copy") {
        return {
          kind: "draft",
          message:
            "Copied — your approved email is still here whenever you need it.",
          draftBody: session.draftContent ?? "",
          session: { ...session, phase: "awaiting_action", approvedDraft: true },
        };
      }
      if (action === "gmail_draft") {
        return {
          kind: "message",
          message:
            "I can create a Gmail draft for you to review — it won't send. Say the word when you want me to prepare it.",
          session: { ...session, phase: "awaiting_action", approvedDraft: true },
        };
      }
      if (action === "send") {
        return {
          kind: "message",
          message: [
            "Before anything goes out, I need your explicit send confirmation.",
            "",
            `Recipient: ${session.answers["email-recipient"] ?? "not set yet"}`,
            "",
            session.draftContent?.trim() ?? "",
            "",
            "Reply with the recipient email address if needed, then say “Yes, send it” to confirm.",
          ].join("\n"),
          session: { ...session, phase: "awaiting_action", approvedDraft: true },
        };
      }
      if (action === "make_changes") {
        return {
          kind: "message",
          message: "Tell me what you'd like different — I'll adjust this draft.",
          session: {
            ...session,
            phase: "revision",
            approvedDraft: false,
          },
        };
      }
      if (action === "save") {
        return {
          kind: "message",
          message:
            "I'll keep this approved draft saved here — we can copy, draft in Gmail, or send whenever you're ready.",
          session: { ...session, phase: "awaiting_action", approvedDraft: true },
        };
      }
      // Direct revision while menu is showing — update the existing draft in place.
      if (isCreateRevisionInstruction(t) && session.draftContent?.trim()) {
        const revised = applyDraftRevision(session.draftContent, t);
        const updated: UniversalCreationSession = {
          ...session,
          phase: "awaiting_action",
          approvedDraft: true,
          draftContent: revised,
        };
        return {
          kind: "draft",
          message:
            "Updated — here's the same email with that change. What would you like to do next?",
          draftBody: revised,
          session: updated,
        };
      }
      if (SHOW_FINISHED_EMAIL_RE.test(t)) {
        return showApprovedArtifact(session);
      }
    }
  }

  if (session.phase === "guided_creation") {
    if (
      DRAFT_PERMISSION_RE.test(lastAssistantText ?? "") ||
      /discovery is complete/i.test(lastAssistantText ?? "") ||
      Boolean(session.preparationReady)
    ) {
      if (DRAFT_AFFIRMATIVE_RE.test(t) || SHOW_FINISHED_EMAIL_RE.test(t)) {
        const draftBody = composeDocumentDraft(session);
        const updated: UniversalCreationSession = {
          ...session,
          phase: "review",
          draftContent: draftBody,
        };
        return {
          kind: "draft",
          message: "Here's a first draft — take your time with it.",
          draftBody,
          session: updated,
        };
      }
      if (/^no\b|not yet|wait/i.test(t) && !DRAFT_APPROVAL_RE.test(t)) {
        return {
          kind: "message",
          message:
            "No rush — tell me when you're ready, or what you'd like to adjust first.",
          session,
        };
      }
    }
    return null;
  }

  if (session.phase === "review") {
    if (SHOW_DRAFT_RE.test(t) || SHOW_FINISHED_EMAIL_RE.test(t)) {
      const draftBody = session.draftContent ?? composeDocumentDraft(session);
      return {
        kind: "draft",
        message: "Here it is — take your time with it.",
        draftBody,
        session: { ...session, draftContent: draftBody },
      };
    }

    if (DRAFT_APPROVAL_RE.test(t)) {
      return showApprovedArtifact(session);
    }

    const revised = applyDraftRevision(session.draftContent ?? "", t);
    const updated: UniversalCreationSession = {
      ...session,
      phase: "revision",
      draftContent: revised,
    };
    return {
      kind: "draft",
      message: "Updated — here's how it reads now.",
      draftBody: revised,
      session: updated,
    };
  }

  if (session.phase === "revision") {
    if (SHOW_DRAFT_RE.test(t) || SHOW_FINISHED_EMAIL_RE.test(t)) {
      const draftBody = session.draftContent ?? composeDocumentDraft(session);
      return {
        kind: "draft",
        message: "Here it is — take your time with it.",
        draftBody,
        session: { ...session, draftContent: draftBody },
      };
    }

    if (DRAFT_APPROVAL_RE.test(t)) {
      return showApprovedArtifact(session);
    }

    const choice = parseApprovalChoice(t);
    if (choice === "yes_ready") {
      return showApprovedArtifact(session);
    }
    if (choice === "continue_later") {
      return {
        kind: "message",
        message:
          "I'll keep this right here — we can pick up whenever you're ready.",
        session: {
          ...session,
          phase: "awaiting_action",
          approvedDraft: true,
        },
      };
    }

    const revised = applyDraftRevision(session.draftContent ?? "", t);
    const updated: UniversalCreationSession = {
      ...session,
      draftContent: revised,
    };
    return {
      kind: "draft",
      message: "Got it — here's the updated version.",
      draftBody: revised,
      session: updated,
    };
  }

  if (session.phase === "approval") {
    const choice = parseApprovalChoice(t);
    if (choice === "yes_ready" || DRAFT_APPROVAL_RE.test(t)) {
      return showApprovedArtifact(session);
    }
    if (choice === "one_more_change") {
      return {
        kind: "message",
        message: "Tell me what you'd like different — I'll adjust it.",
        session: { ...session, phase: "revision", approvedDraft: false },
      };
    }
    if (SHOW_FINISHED_EMAIL_RE.test(t)) {
      return showApprovedArtifact(session);
    }
  }

  if (session.phase === "awaiting_action") {
    if (SHOW_FINISHED_EMAIL_RE.test(t) || DRAFT_APPROVAL_RE.test(t)) {
      return showApprovedArtifact(session);
    }
    if (isCreateRevisionInstruction(t) && session.draftContent?.trim()) {
      const revised = applyDraftRevision(session.draftContent, t);
      const updated: UniversalCreationSession = {
        ...session,
        approvedDraft: true,
        draftContent: revised,
      };
      return {
        kind: "draft",
        message:
          "Updated — here's the same email with that change. What would you like to do next?",
        draftBody: revised,
        session: updated,
      };
    }
    return {
      kind: "message",
      message:
        session.documentType === "email"
          ? formatEmailAwaitingActionRecovery()
          : formatApprovalMenu(),
      session,
    };
  }

  if (session.phase === "completion") {
    if (SHOW_FINISHED_EMAIL_RE.test(t) || DRAFT_APPROVAL_RE.test(t)) {
      return showApprovedArtifact({
        ...session,
        approvedDraft: true,
        phase: "awaiting_action",
      });
    }
    if (/^1\b|google/i.test(t)) {
      return {
        kind: "message",
        message:
          "We can save this to Google Docs whenever you're ready — just say the word.",
        session,
      };
    }
    if (/^2\b|pdf|print/i.test(t)) {
      return {
        kind: "message",
        message:
          "I can help you print or download a PDF — tell me when you want to do that.",
        session,
      };
    }
    if (/^3\b|template/i.test(t)) {
      return {
        kind: "message",
        message:
          "Happy to save this as a template you can reuse — we'll do that together.",
        session,
      };
    }
  }

  return null;
}

/** Message shown after draft is first presented — invites revision before approval. */
export function formatPostDraftReviewPrompt(): string {
  return ["", formatSparkEstateReviewPrompt()].join("\n");
}

export {
  formatEmailAwaitingActionMenu,
  formatApprovedEmailReply,
  hasUsableApprovedEmailDraft,
};
