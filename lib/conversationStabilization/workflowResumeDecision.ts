/**
 * CB-022 addendum — authoritative WorkflowResumeDecision.
 * Call before Continuity sticky UC resume and CREATE fast path.
 */

import type { ConversationOwner } from "@/lib/conversationContinuity/types";
import type { UniversalCreationSession } from "@/lib/universalCreation/types";
import type {
  IntentWorkflowState,
  RequestedArtifactType,
  WorkflowResumeDecision,
} from "./intentWorkflowTypes";

const EXPLICIT_DOCUMENT_CONTINUE_RE =
  /\b(?:go back to (?:the |my )?document|continue (?:the |my |with (?:the |my )?)?document|finish (?:the |my )?document|resume (?:the |my )?document|continue where we left off(?: with (?:the |my )?document)?|let'?s finish that document)\b/i;

const EXPLICIT_STRATEGY_CONTINUE_RE =
  /\b(?:continue (?:the |my |with (?:the |my )?)?strategy|finish (?:the |my )?strategy|resume (?:the |my )?strategy|go back to (?:the |my )?strategy|let'?s finish that strategy|continue the strategy we were building)\b/i;

const REJECT_DOCUMENT_RE =
  /\b(?:i am not|i'?m not|not)\s+creating\s+(?:a\s+)?document\b|\b(?:wrong|stop|don'?t)\b.{0,24}\bdocument\b|\bnot\s+(?:a\s+)?document\b/i;

function isCreateDocumentOwner(owner: ConversationOwner | null | undefined): boolean {
  if (!owner) return false;
  return owner.kind === "guided_workflow" || owner.kind === "artifact";
}

function ownerWorkflowType(owner: ConversationOwner): string {
  if (owner.kind === "guided_workflow") return owner.workflowType;
  if (owner.kind === "artifact") return owner.artifactType;
  return owner.kind;
}

function ownerWorkflowId(owner: ConversationOwner): string | undefined {
  if (owner.kind === "guided_workflow") return owner.workflowId;
  if (owner.kind === "artifact") return owner.artifactId;
  return undefined;
}

export function isExplicitDocumentContinue(userText: string): boolean {
  return EXPLICIT_DOCUMENT_CONTINUE_RE.test(userText.trim());
}

export function isExplicitStrategyContinue(userText: string): boolean {
  return EXPLICIT_STRATEGY_CONTINUE_RE.test(userText.trim());
}

export function isDocumentWorkflowRejection(userText: string): boolean {
  return REJECT_DOCUMENT_RE.test(userText.trim());
}

/**
 * Semantic resume gate: sticky Continuity must not resume UC/document when
 * current intent requests a different artifact (e.g. strategy).
 */
export function resolveWorkflowResumeDecision(input: {
  userText: string;
  activeOwner: ConversationOwner | null;
  ucSession?: UniversalCreationSession | null;
  intentState?: IntentWorkflowState | null;
  currentArtifactType: RequestedArtifactType;
}): WorkflowResumeDecision {
  const userText = input.userText.trim();
  const owner = input.activeOwner;
  const hasUc = Boolean(input.ucSession);
  const createOwner = isCreateDocumentOwner(owner);

  if (!createOwner && !hasUc) {
    return {
      shouldResume: false,
      reason: "insufficient_evidence",
      confidence: "low",
    };
  }

  if (isDocumentWorkflowRejection(userText)) {
    return {
      shouldResume: false,
      workflowId: owner ? ownerWorkflowId(owner) : undefined,
      workflowType: owner ? ownerWorkflowType(owner) : "document",
      reason: "workflow_conflict",
      confidence: "high",
    };
  }

  if (isExplicitDocumentContinue(userText)) {
    return {
      shouldResume: true,
      workflowId: owner ? ownerWorkflowId(owner) : undefined,
      workflowType: owner ? ownerWorkflowType(owner) : "document",
      reason: "explicit_continue",
      confidence: "high",
    };
  }

  // New strategy (or other non-document) intent beats stale document/UC.
  if (
    input.currentArtifactType === "strategy" ||
    input.intentState?.artifactType === "strategy" ||
    input.intentState?.strategyEntryMode === "create" ||
    input.intentState?.strategyEntryMode === "browse" ||
    input.intentState?.strategyEntryMode === "apply" ||
    input.intentState?.strategyEntryMode === "resume"
  ) {
    // Resume strategy is not the same as resuming a document.
    if (
      input.currentArtifactType === "strategy" ||
      input.intentState?.artifactType === "strategy"
    ) {
      return {
        shouldResume: false,
        workflowId: owner ? ownerWorkflowId(owner) : undefined,
        workflowType: owner ? ownerWorkflowType(owner) : "document",
        reason: "new_intent",
        confidence: "high",
      };
    }
  }

  if (
    input.currentArtifactType !== "unknown" &&
    input.currentArtifactType !== "document" &&
    input.currentArtifactType !== "email" &&
    input.currentArtifactType !== "note" &&
    input.currentArtifactType !== "message"
  ) {
    // Reminder / project / plan etc. vs document create — conflict.
    if (createOwner || hasUc) {
      return {
        shouldResume: false,
        workflowId: owner ? ownerWorkflowId(owner) : undefined,
        workflowType: owner ? ownerWorkflowType(owner) : "document",
        reason: "workflow_conflict",
        confidence: "high",
      };
    }
  }

  // Explicit strategy continue while UC sticky — still do not resume document.
  if (isExplicitStrategyContinue(userText) && (createOwner || hasUc)) {
    return {
      shouldResume: false,
      workflowId: owner ? ownerWorkflowId(owner) : undefined,
      workflowType: owner ? ownerWorkflowType(owner) : "document",
      reason: "new_intent",
      confidence: "high",
    };
  }

  // Short answers / awaitingAnswer with no conflicting artifact → allow resume.
  if (createOwner && owner) {
    if (owner.awaitingAnswer && input.currentArtifactType === "unknown") {
      return {
        shouldResume: true,
        workflowId: ownerWorkflowId(owner),
        workflowType: ownerWorkflowType(owner),
        reason: "high_confidence_match",
        confidence: "medium",
      };
    }
    if (
      input.currentArtifactType === "document" ||
      input.currentArtifactType === "email" ||
      input.currentArtifactType === "note" ||
      input.currentArtifactType === "message"
    ) {
      return {
        shouldResume: true,
        workflowId: ownerWorkflowId(owner),
        workflowType: ownerWorkflowType(owner),
        reason: "high_confidence_match",
        confidence: "high",
      };
    }
    // Stale sticky with unrelated / unclear new text — do not auto-hijack.
    if (input.currentArtifactType === "unknown" && userText.split(/\s+/).length >= 6) {
      return {
        shouldResume: false,
        workflowId: ownerWorkflowId(owner),
        workflowType: ownerWorkflowType(owner),
        reason: "stale_state",
        confidence: "medium",
      };
    }
    return {
      shouldResume: true,
      workflowId: ownerWorkflowId(owner),
      workflowType: ownerWorkflowType(owner),
      reason: "high_confidence_match",
      confidence: "low",
    };
  }

  return {
    shouldResume: false,
    reason: "insufficient_evidence",
    confidence: "low",
  };
}
