/**
 * P0.25 — Workflow Ownership Authority™
 * The most recent active workflow owns generic affirmations (yes / sure / okay).
 * Stale Strategic Direction / outcome-thread state must never intercept.
 */

import { assistantEndsWithQuestion } from "./conversationIntervention";
import type { OutcomeThread } from "./companionOutcomeThread";
import type { ConversationWorkflow } from "./conversationWorkflowContinuation";
import { inferConversationWorkflowFromAssistant } from "./conversationWorkflowContinuation";
import {
  detectStructuredTeachingMenu,
  extractMenuTopicFromContext,
  type PendingMenuSelection,
} from "./menuContinuationIntelligence";
import {
  isLearningPathMenuOffer,
} from "./learningPathMenu";
import {
  isReminderIntakeMessage,
  isReminderSetupOfferMessage,
} from "./reminderIntelligence";
import {
  isArtifactExecutionOfferMessage,
} from "./artifactExecutionAuthority";
import { isStrategyIntelligenceOfferMessage } from "./strategyOfferContinuation";
import { isVisualThinkingMenuOfferMessage } from "./visualThinkingContinuation";
import {
  isBareGenericAcceptance,
  isAcceptanceAttempt,
} from "./pendingAcceptanceAuthority";

export type WorkflowOwnerId =
  | "reminder_workflow"
  | "artifact_execution_workflow"
  | "learning_workflow"
  | "create_workflow"
  | "visual_workflow"
  | "strategy_workflow"
  | "decision_workflow"
  | "workspace_workflow"
  | "conversation_workflow";

export type WorkflowOwnerDetection = {
  owner: WorkflowOwnerId;
  source: "assistant_message" | "active_session";
  assistantQuestion?: string;
};

const CONSENT_OFFER_RE =
  /\b(?:would you like|want me to|shall (?:i|we)|do you want|ready to|like to|can i|should (?:i|we)|want to)\b/i;

const LEARN_MORE_CONSENT_RE =
  /\b(?:learn more|teach me more|go deeper|continue learning|explore (?:this|that) (?:topic|subject)|more about)\b/i;

const CREATE_WORKFLOW_QUESTION_RE =
  /\b(?:opening line|title to be|use this|use that|use these|this draft|the draft|rewrite|continue (?:draft|building|writing)|would you like to use|sounds good for the|put that in|add (?:this|that|them))\b/i;

const DECISION_THREAD_QUESTION_RE =
  /\b(?:decision compass|strategic direction|which path|keep your current offer|replace it|offer both|product line|expansion|pricing models?|which feels closest)\b/i;

export function isWorkflowContinuationReply(text: string): boolean {
  return isAcceptanceAttempt(text.trim());
}

export function detectWorkflowOwnerFromAssistant(
  assistantText: string,
): WorkflowOwnerDetection | null {
  const t = assistantText.trim();
  if (!t) return null;

  if (isReminderIntakeMessage(t) || isReminderSetupOfferMessage(t)) {
    return {
      owner: "reminder_workflow",
      source: "assistant_message",
      assistantQuestion: t,
    };
  }

  if (isArtifactExecutionOfferMessage(t)) {
    return {
      owner: "artifact_execution_workflow",
      source: "assistant_message",
      assistantQuestion: t,
    };
  }

  if (
    isLearningPathMenuOffer(t) ||
    detectStructuredTeachingMenu(t) ||
    (assistantEndsWithQuestion(t) &&
      CONSENT_OFFER_RE.test(t) &&
      LEARN_MORE_CONSENT_RE.test(t))
  ) {
    return {
      owner: "learning_workflow",
      source: "assistant_message",
      assistantQuestion: t,
    };
  }

  if (isStrategyIntelligenceOfferMessage(t)) {
    return {
      owner: "strategy_workflow",
      source: "assistant_message",
      assistantQuestion: t,
    };
  }

  if (isVisualThinkingMenuOfferMessage(t)) {
    return {
      owner: "visual_workflow",
      source: "assistant_message",
      assistantQuestion: t,
    };
  }

  if (assistantEndsWithQuestion(t) && CREATE_WORKFLOW_QUESTION_RE.test(t)) {
    return {
      owner: "create_workflow",
      source: "assistant_message",
      assistantQuestion: t,
    };
  }

  if (
    assistantEndsWithQuestion(t) &&
    CONSENT_OFFER_RE.test(t) &&
    /\b(?:remind|reminder|notify|nudge)\b/i.test(t)
  ) {
    return {
      owner: "reminder_workflow",
      source: "assistant_message",
      assistantQuestion: t,
    };
  }

  if (assistantEndsWithQuestion(t) && DECISION_THREAD_QUESTION_RE.test(t)) {
    return {
      owner: "decision_workflow",
      source: "assistant_message",
      assistantQuestion: t,
    };
  }

  const inferred = inferConversationWorkflowFromAssistant(t);
  if (inferred) {
    const owner: WorkflowOwnerId =
      inferred.kind === "open_workspace"
        ? "workspace_workflow"
        : inferred.kind === "open_decision_compass" ||
            inferred.kind === "guided_continue"
          ? "decision_workflow"
          : "conversation_workflow";
    return {
      owner,
      source: "assistant_message",
      assistantQuestion: t,
      ...(owner === "decision_workflow" ? {} : {}),
    };
  }

  return null;
}

export type ActiveWorkflowOwnerInput = {
  lastAssistantText: string;
  reminderIntakeActive?: boolean;
  artifactExecutionIntakeActive?: boolean;
  menuPending?: PendingMenuSelection | null;
  createBuilderActive?: boolean;
  conversationWorkflow?: ConversationWorkflow | null;
};

/** Priority-ordered owner for the current turn. */
export function getActiveWorkflowOwner(
  input: ActiveWorkflowOwnerInput,
): WorkflowOwnerDetection | null {
  if (input.reminderIntakeActive) {
    return { owner: "reminder_workflow", source: "active_session" };
  }

  if (input.artifactExecutionIntakeActive) {
    return { owner: "artifact_execution_workflow", source: "active_session" };
  }

  if (input.menuPending) {
    return { owner: "learning_workflow", source: "active_session" };
  }

  if (input.createBuilderActive) {
    return { owner: "create_workflow", source: "active_session" };
  }

  const fromAssistant = detectWorkflowOwnerFromAssistant(input.lastAssistantText);
  if (fromAssistant) return fromAssistant;

  if (input.conversationWorkflow) {
    const owner: WorkflowOwnerId =
      input.conversationWorkflow.kind === "open_decision_compass" ||
      input.conversationWorkflow.kind === "guided_continue"
        ? "decision_workflow"
        : input.conversationWorkflow.kind === "open_workspace"
          ? "workspace_workflow"
          : "conversation_workflow";
    return { owner, source: "active_session" };
  }

  return null;
}

/** Stale outcome-thread decision context must not override an unrelated active owner. */
export function outcomeThreadAllowedForOwner(
  owner: WorkflowOwnerDetection | null,
  thread: OutcomeThread | null,
): boolean {
  if (!thread?.pendingDecision) return true;
  if (!owner) return true;
  return owner.owner === "decision_workflow";
}

export function filteredOutcomeThreadForAcceptance(
  owner: WorkflowOwnerDetection | null,
  thread: OutcomeThread | null,
): OutcomeThread | null {
  if (!thread) return null;
  if (outcomeThreadAllowedForOwner(owner, thread)) return thread;
  return {
    ...thread,
    pendingDecision: undefined,
    pendingAction:
      owner?.owner === "decision_workflow" ? thread.pendingAction : undefined,
  };
}

export function assistantQuestionOwnsDecisionContext(assistantText: string): boolean {
  const t = assistantText.trim();
  if (!t) return false;
  return DECISION_THREAD_QUESTION_RE.test(t);
}

export function workflowOwnerBlocksStrategyPending(
  owner: WorkflowOwnerDetection | null,
): boolean {
  if (!owner) return false;
  return owner.owner !== "strategy_workflow";
}

export function workflowOwnerBlocksFrictionlessPending(
  owner: WorkflowOwnerDetection | null,
  pendingType?: string,
): boolean {
  if (!owner) return false;
  if (owner.owner === "strategy_workflow" && pendingType === "strategy_offer") {
    return false;
  }
  if (owner.owner === "visual_workflow" && pendingType?.startsWith("visual")) {
    return false;
  }
  if (
    owner.owner === "artifact_execution_workflow" &&
    pendingType !== "artifact_execution"
  ) {
    return true;
  }
  return true;
}

export function workflowOwnerContinuationFallback(
  owner: WorkflowOwnerDetection,
  priorUserText?: string,
): string {
  switch (owner.owner) {
    case "learning_workflow": {
      const topic = owner.assistantQuestion
        ? extractMenuTopicFromContext(owner.assistantQuestion, priorUserText)
        : priorUserText?.trim();
      return topic
        ? `Let's keep learning about **${topic}**. Which part would you like to go deeper on first?`
        : "Let's keep learning — which part would you like to go deeper on first?";
    }
    case "reminder_workflow":
      return "When would you like me to remind you? You can say a time like **2 PM**, **in 30 minutes**, or **every day at 9**.";
    case "artifact_execution_workflow":
      return "Creating your file now — one moment.";
    case "create_workflow":
      return "Got it — let's keep building. Tell me what you'd like to use or change next.";
    case "visual_workflow":
      return "Which visual would help most — reply with **1**, **2**, **3**, or **4**.";
    case "strategy_workflow":
      return "Opening that strategy — one moment.";
    case "workspace_workflow":
      return "Opening that workspace beside us — we'll pick up right there.";
    case "decision_workflow":
      return "Let's keep working through this decision — which option feels closest right now?";
    case "conversation_workflow":
      return "Great — let's keep going. What's the next piece?";
  }
}

export function isGenericAffirmationInterceptedByOwner(
  userText: string,
  owner: WorkflowOwnerDetection | null,
): boolean {
  if (!owner) return false;
  return isBareGenericAcceptance(userText.trim());
}
