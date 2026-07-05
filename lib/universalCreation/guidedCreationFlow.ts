/**
 * Post-discovery flow — draft permission → show draft → revise → approve → deliver.
 */

import {
  formatApprovalMenu,
  formatCompletionMenu,
  parseApprovalChoice,
} from "./phases";
import { pluginById } from "./documentRegistry";
import { applyDraftRevision, composeDocumentDraft } from "./draftComposer";
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

const NO_REVISION_RE =
  /^(?:nothing|no changes|looks good|it'?s good|good as is|nope|no)\b/i;

const SHOW_DRAFT_RE =
  /\b(?:where (?:is|'s) the draft|show (?:me )?(?:the )?draft|i don'?t see (?:the )?draft|didn'?t see (?:the )?draft|can'?t see (?:the )?draft)\b/i;

export function isGuidedCreationAssistantContext(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return (
    DRAFT_PERMISSION_RE.test(t) ||
    REVIEW_PROMPT_RE.test(t) ||
    REVISION_DONE_RE.test(t) ||
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

export function advanceGuidedCreationFlow(
  session: UniversalCreationSession,
  userText: string,
  lastAssistantText?: string | null,
): UniversalCreationTurnResult | null {
  const t = userText.trim();
  if (!t) return null;

  const plugin = pluginById(session.documentType);
  if (!plugin) return null;

  if (session.phase === "guided_creation") {
    if (
      DRAFT_PERMISSION_RE.test(lastAssistantText ?? "") ||
      /discovery is complete/i.test(lastAssistantText ?? "")
    ) {
      if (DRAFT_AFFIRMATIVE_RE.test(t)) {
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
      if (/^no\b|not yet|wait/i.test(t)) {
        return {
          kind: "message",
          message: "No rush — tell me when you're ready, or what you'd like to adjust first.",
          session,
        };
      }
    }
    return null;
  }

  if (session.phase === "review") {
    if (SHOW_DRAFT_RE.test(t)) {
      const draftBody = session.draftContent ?? composeDocumentDraft(session);
      return {
        kind: "draft",
        message: "Here it is — take your time with it.",
        draftBody,
        session: { ...session, draftContent: draftBody },
      };
    }

    if (NO_REVISION_RE.test(t)) {
      const updated: UniversalCreationSession = { ...session, phase: "approval" };
      return {
        kind: "message",
        message: formatApprovalMenu(),
        session: updated,
      };
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
    if (SHOW_DRAFT_RE.test(t)) {
      const draftBody = session.draftContent ?? composeDocumentDraft(session);
      return {
        kind: "draft",
        message: "Here it is — take your time with it.",
        draftBody,
        session,
      };
    }

    if (NO_REVISION_RE.test(t)) {
      const updated: UniversalCreationSession = { ...session, phase: "approval" };
      return {
        kind: "message",
        message: formatApprovalMenu(),
        session: updated,
      };
    }

    const choice = parseApprovalChoice(t);
    if (choice === "yes_ready") {
      const updated: UniversalCreationSession = { ...session, phase: "completion" };
      return {
        kind: "message",
        message: formatCompletionMenu(plugin),
        session: updated,
      };
    }
    if (choice === "continue_later") {
      return {
        kind: "message",
        message:
          "I'll keep this right here — we can pick up whenever you're ready.",
        session: { ...session, phase: "approval" },
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
    if (choice === "yes_ready") {
      const updated: UniversalCreationSession = { ...session, phase: "completion" };
      return {
        kind: "message",
        message: formatCompletionMenu(plugin),
        session: updated,
      };
    }
    if (choice === "one_more_change") {
      const updated: UniversalCreationSession = { ...session, phase: "revision" };
      return {
        kind: "message",
        message: "Tell me what you'd like different — I'll adjust it.",
        session: updated,
      };
    }
  }

  if (session.phase === "completion") {
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
        message: "I can help you print or download a PDF — tell me when you want to do that.",
        session,
      };
    }
    if (/^3\b|template/i.test(t)) {
      return {
        kind: "message",
        message: "Happy to save this as a template you can reuse — we'll do that together.",
        session,
      };
    }
  }

  return null;
}

/** Message shown after draft is first presented — invites revision before approval. */
export function formatPostDraftReviewPrompt(): string {
  return [
    "",
    "Take a look — what would you change, if anything?",
    "",
    "Tell me in your own words, or say it looks good as-is.",
  ].join("\n");
}
