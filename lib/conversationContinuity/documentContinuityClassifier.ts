/**
 * P0 — Document continuity classifier.
 * Before every document response ask: is this message actually about the
 * active document? If confidence is not high → exit document mode.
 */

import {
  isChamberMemberRequest,
  resolveChamberMemberFromText,
} from "@/lib/chamber/chamberMemberAliases";
import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import {
  findActiveWorkspaceByHumanTitle,
  readLastActiveWorkspaceId,
} from "@/lib/activeWorkspaceRegistry";
import { isForceNewCreationRequest } from "@/lib/universalCreationEntrypoint/forceNewIntent";
import { classifyRequestedArtifactType } from "@/lib/conversationStabilization/intentClassificationGate";
import type { RequestedArtifactType } from "@/lib/conversationStabilization/intentWorkflowTypes";
import {
  isExplicitDocumentContinue,
  isExplicitStrategyContinue,
  isDocumentWorkflowRejection,
} from "@/lib/conversationStabilization/workflowResumeDecision";
import { looksLikeKnowledgeQuestion } from "@/lib/platformIntent/classifyPlatformIntent";
import { isCreateIrrelevantUserTurn } from "./createOwnershipGuard";
import { detectWorkflowCorrection } from "./workflowCorrection";
import { isExplicitOwnerExit, isExplicitTaskChange } from "./exitRules";
import type { ConversationOwner } from "./types";

export type DocumentContinuityOutcome =
  | "continue_current"
  | "start_new"
  | "switch_document"
  | "general_conversation"
  | "chamber_member"
  | "clarify";

export type DocumentContinuityDecision = {
  outcome: DocumentContinuityOutcome;
  confidence: "high" | "medium" | "low";
  /** Member-facing clarify when outcome is clarify. */
  clarifyPrompt?: string;
  switchWorkspaceId?: string;
  chamberMemberId?: ChamberMemberId;
};

const REFERENTIAL_DOCUMENT_RE =
  /\b(?:the above|that section|number (?:one|two|three|\d)|what you just wrote|expand that|make it shorter|use that|no changes|i like it|write (?:it|that|the email)|continue|yes|good so far|draft it|build it out|add more detail|show me the finished|same document|this document|that document|keep going|next section|next question|let'?s write the email)\b/i;

const GENERAL_CONVERSATION_RE =
  /\b(?:i(?:'m| am) overwhelmed|feeling (?:stuck|lost|anxious)|good morning|good evening|how(?:'s| is) it going|how are you|just checking in|i need to vent|talk with me|listen|what should i do today|plan my day|clear my mind|i'?m stuck)\b/i;

/** Casual / trivia / off-topic chat — must exit Create. */
const CASUAL_OFF_TOPIC_RE =
  /\b(?:fun fact|trivia|joke|octop(?:us|uses)|dinosaur|weather|how(?:'s| is) (?:your|the) day|what(?:'s| is) (?:a |your )?favorite|tell me something (?:fun|interesting|random)|random question)\b/i;

const NEW_CREATE_TOPIC_RE =
  /\b(?:help me (?:create|plan|build|write|make)|i (?:want|need) (?:to )?(?:create|plan|build|write)|let'?s (?:create|build|write) (?:a|an|my|the)|create (?:a|an|my|the) (?:new )?(?:sop|course|email|newsletter|proposal|strategy|retreat|webinar|event)|write (?:a|an|my|the) (?:new )?(?:sop|course|newsletter|proposal|strategy))\b/i;

const CHAMBER_NAV_RE =
  /\b(?:talk to|ask|take me to|bring me to|go to|open|show(?:\s+me)?)\b/i;

/** Legal / risk language → Chamber invite. */
export const LEGAL_RISK_TOPIC_RE =
  /\b(?:legal|liability|contract|compliance|risk(?:\s+management)?|lawsuit|attorney|terms of service|nda)\b/i;

function isCreateDocumentOwner(
  owner: ConversationOwner | null | undefined,
): boolean {
  if (!owner) return false;
  return owner.kind === "guided_workflow" || owner.kind === "artifact";
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isCasualOrOffTopicChat(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (GENERAL_CONVERSATION_RE.test(t)) return true;
  if (CASUAL_OFF_TOPIC_RE.test(t)) return true;
  // Any clear question that isn't about the document leaves Create.
  if (
    /\?\s*$/.test(t) &&
    !/\b(?:document|workshop|retreat|section|draft|agenda|audience|outcome|newsletter|email|checklist|this|that)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (
    /\?\s*$/.test(t) &&
    looksLikeKnowledgeQuestion(t) &&
    !/\b(?:document|workshop|retreat|section|draft|agenda|audience|outcome|newsletter|email)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  return false;
}

/**
 * High-confidence document answer only.
 * Questions, trivia, and ambiguous prose never count.
 */
function isHighConfidenceDocumentAnswer(
  userText: string,
  awaitingAnswer: boolean,
): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (isCasualOrOffTopicChat(t)) return false;
  if (/\?\s*$/.test(t)) return false;
  if (NEW_CREATE_TOPIC_RE.test(t)) return false;
  if (isForceNewCreationRequest(t)) return false;
  if (LEGAL_RISK_TOPIC_RE.test(t)) return false;
  if (CHAMBER_NAV_RE.test(t) && isChamberMemberRequest(t)) return false;
  if (REFERENTIAL_DOCUMENT_RE.test(t)) return true;
  // Focus / discovery answers while awaiting win over knowledge-question heuristics
  // (e.g. "…and explain how it works" as newsletter purpose — not trivia).
  if (
    awaitingAnswer &&
    wordCount(t) <= 40 &&
    !/^(?:hey|hi|hello)\b/i.test(t)
  ) {
    return true;
  }
  if (looksLikeKnowledgeQuestion(t)) return false;
  return false;
}

/**
 * Classify whether this turn continues the sticky document.
 * Rule: only high-confidence continue stays in document mode.
 */
export function classifyDocumentContinuity(input: {
  userText: string;
  activeOwner?: ConversationOwner | null;
  hasStickyDocument?: boolean;
  awaitingAnswer?: boolean;
  currentArtifactType?: RequestedArtifactType;
  activeDocumentTitle?: string | null;
  activeWorkspaceId?: string | null;
}): DocumentContinuityDecision {
  const userText = input.userText.trim();
  const owner = input.activeOwner ?? null;
  const sticky =
    input.hasStickyDocument ??
    (isCreateDocumentOwner(owner) || Boolean(input.activeWorkspaceId));

  if (!userText) {
    return { outcome: "general_conversation", confidence: "low" };
  }

  // Chamber / legal always win — even without sticky document.
  if (LEGAL_RISK_TOPIC_RE.test(userText)) {
    return {
      outcome: "chamber_member",
      confidence: "high",
      chamberMemberId: "strategy",
    };
  }

  if (CHAMBER_NAV_RE.test(userText) && isChamberMemberRequest(userText)) {
    const chamber = resolveChamberMemberFromText(userText);
    if (chamber.kind === "match") {
      return {
        outcome: "chamber_member",
        confidence: "high",
        chamberMemberId: chamber.match.memberId,
      };
    }
    if (chamber.kind === "ambiguous") {
      return {
        outcome: "clarify",
        confidence: "medium",
        clarifyPrompt: chamber.clarifyQuestion,
      };
    }
  }

  if (!sticky) {
    return { outcome: "general_conversation", confidence: "high" };
  }

  if (isExplicitDocumentContinue(userText)) {
    return { outcome: "continue_current", confidence: "high" };
  }

  if (isForceNewCreationRequest(userText)) {
    return { outcome: "start_new", confidence: "high" };
  }

  if (REFERENTIAL_DOCUMENT_RE.test(userText)) {
    return { outcome: "continue_current", confidence: "high" };
  }

  if (isCasualOrOffTopicChat(userText)) {
    return { outcome: "general_conversation", confidence: "high" };
  }

  const correction = detectWorkflowCorrection(userText, owner);
  if (
    correction.isCorrection ||
    isDocumentWorkflowRejection(userText) ||
    isCreateIrrelevantUserTurn(userText)
  ) {
    return { outcome: "general_conversation", confidence: "high" };
  }

  if (isExplicitOwnerExit(userText) || isExplicitTaskChange(userText)) {
    return { outcome: "general_conversation", confidence: "high" };
  }

  const awaiting =
    input.awaitingAnswer ??
    (owner && "awaitingAnswer" in owner ? Boolean(owner.awaitingAnswer) : false);

  // Permanent rule: only high-confidence document answers continue.
  if (isHighConfidenceDocumentAnswer(userText, awaiting)) {
    return { outcome: "continue_current", confidence: "high" };
  }

  const artifactType =
    input.currentArtifactType ?? classifyRequestedArtifactType(userText);

  if (artifactType === "strategy" || isExplicitStrategyContinue(userText)) {
    return { outcome: "general_conversation", confidence: "high" };
  }

  const titled = findActiveWorkspaceByHumanTitle(userText);
  const currentId =
    input.activeWorkspaceId ?? readLastActiveWorkspaceId() ?? null;
  if (
    titled &&
    currentId &&
    titled.workspaceId !== currentId &&
    /\b(?:open|continue|resume|switch|work on|go back to|that|the)\b/i.test(
      userText,
    )
  ) {
    return {
      outcome: "switch_document",
      confidence: "high",
      switchWorkspaceId: titled.workspaceId,
    };
  }

  if (GENERAL_CONVERSATION_RE.test(userText) || looksLikeKnowledgeQuestion(userText)) {
    return { outcome: "general_conversation", confidence: "high" };
  }

  if (NEW_CREATE_TOPIC_RE.test(userText)) {
    const title = input.activeDocumentTitle?.trim();
    if (title && userText.toLowerCase().includes(title.toLowerCase())) {
      // Same titled work — still not high enough without explicit continue.
      return {
        outcome: "clarify",
        confidence: "medium",
        clarifyPrompt: `Are you still working on “${title}”, or starting something new?`,
      };
    }
    return {
      outcome: "clarify",
      confidence: "medium",
      clarifyPrompt: title
        ? `Are you still working on “${title}”, or starting something new?`
        : "Are you still working on the current document, or starting something new?",
    };
  }

  if (
    artifactType !== "unknown" &&
    artifactType !== "document" &&
    artifactType !== "email" &&
    artifactType !== "note" &&
    artifactType !== "message"
  ) {
    return { outcome: "general_conversation", confidence: "high" };
  }

  // Ambiguous create-family text while sticky → clarify, never auto-continue.
  if (
    artifactType === "document" ||
    artifactType === "email" ||
    artifactType === "note" ||
    artifactType === "message"
  ) {
    const title = input.activeDocumentTitle?.trim();
    return {
      outcome: "clarify",
      confidence: "medium",
      clarifyPrompt: title
        ? `Should I keep this with “${title}”, or start a separate document?`
        : "Should I keep this with the current document, or start a separate one?",
    };
  }

  // Not high confidence about the document → exit document mode.
  return { outcome: "general_conversation", confidence: "high" };
}

/** True when the sticky document owner should handle this turn (high only). */
export function shouldContinueStickyDocument(
  decision: DocumentContinuityDecision,
): boolean {
  return (
    decision.outcome === "continue_current" && decision.confidence === "high"
  );
}

/**
 * Standalone Chamber / legal routing — wins over coaching even without Create.
 */
export function classifyChamberRoutingIntent(userText: string): {
  kind: "none" | "chamber_member" | "legal_risk" | "clarify";
  memberId?: ChamberMemberId;
  clarifyPrompt?: string;
} {
  const t = userText.trim();
  if (!t) return { kind: "none" };
  if (LEGAL_RISK_TOPIC_RE.test(t)) {
    return { kind: "legal_risk", memberId: "strategy" };
  }
  if (CHAMBER_NAV_RE.test(t) && isChamberMemberRequest(t)) {
    const chamber = resolveChamberMemberFromText(t);
    if (chamber.kind === "match") {
      return { kind: "chamber_member", memberId: chamber.match.memberId };
    }
    if (chamber.kind === "ambiguous") {
      return { kind: "clarify", clarifyPrompt: chamber.clarifyQuestion };
    }
  }
  return { kind: "none" };
}
