/**
 * Infer Pending Conversation Commitment from assistant invitation text.
 */

import { assistantOfferedConsent } from "../conversationWorkflowContinuation";
import {
  inferWorkspaceSectionFromConsent,
  type ConversationWorkflowKind,
} from "../conversationWorkflowContinuation";
import { assistantEndsWithQuestion } from "../conversationIntervention";
import type { AppSection } from "../companionUi";
import type {
  ConversationCommitmentType,
  PendingConversationCommitment,
} from "./types";

const CONSENT_OFFER_RE =
  /\b(?:would you like|want me to|shall (?:i|we)|do you want|ready to|like to|can i|should (?:i|we)|want to|open .+ beside)\b/i;

const RESEARCH_OFFER_RE =
  /\b(?:would you like|want me to|shall i|should i)\s+(?:me to )?(?:research|look (?:that |this )?up|find (?:out|current|the latest))\b/i;

const LEARNING_OFFER_RE =
  /\b(?:would you like|want to|shall we)\s+(?:to )?(?:explore|learn (?:about|more)|dig into|walk through what)\b/i;

const CREATE_OFFER_RE =
  /\b(?:would you like|want me to|shall i)\s+(?:me to )?(?:create|build|write|draft|generate)\b/i;

const SAVE_OFFER_RE =
  /\b(?:would you like|want to|shall i)\s+(?:to )?(?:save (?:this|that|it|the)|save your)\b/i;

const EXPORT_OFFER_RE =
  /\b(?:would you like|want to|ready to)\s+(?:to )?(?:export|print|create (?:the|a)? ?google doc)\b/i;

const ARTIFACT_TYPE_RE =
  /\b(sop|standard operating procedure|proposal|checklist|template|marketing plan|content plan|funnel|email sequence|newsletter|lead magnet|sales page|social post|client avatar|playbook|guide|report|document|article)\b/i;

function extractTopic(text: string): string | undefined {
  const patterns = [
    /\b(?:explore|research|learn (?:about|more on)|look (?:up|into))\s+(.+?)(?:\?|$)/i,
    /\b(?:about|on|for)\s+(.+?)(?:\?|$)/i,
    /\*\*([^*]+)\*\*/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    const topic = m?.[1]?.trim();
    if (topic && topic.length >= 3 && topic.length <= 120) {
      return topic.replace(/\s+(?:right now|today)\b.*$/i, "").trim();
    }
  }
  return undefined;
}

function extractArtifactType(text: string): string | undefined {
  const m = text.match(ARTIFACT_TYPE_RE);
  if (!m?.[1]) return undefined;
  const raw = m[1].trim();
  if (/standard operating procedure/i.test(raw)) return "SOP";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function workflowKindToCommitmentType(
  kind: ConversationWorkflowKind,
  text: string,
): ConversationCommitmentType {
  if (kind === "choose_focus_task") return "choose_small_task";
  if (
    kind === "open_my_thoughts" ||
    kind === "open_clear_my_mind" ||
    kind === "open_decision_compass" ||
    kind === "open_breathe" ||
    kind === "open_adjust_my_day" ||
    kind === "open_plan_my_day" ||
    kind === "open_focus_timer" ||
    kind === "open_workspace"
  ) {
    return "open_workspace";
  }
  if (LEARNING_OFFER_RE.test(text)) return "continue_learning_topic";
  return "clarify_choice";
}

function expectedYesForType(
  type: ConversationCommitmentType,
  _text: string,
  section?: AppSection,
  topic?: string,
  artifactType?: string,
): string {
  switch (type) {
    case "choose_small_task":
      return "Ask for one small task";
    case "open_workspace":
      return section ? `Open ${section} beside chat` : "Open workspace beside chat";
    case "continue_learning_topic":
      return topic ? `Continue learning about ${topic}` : "Continue learning in chat";
    case "research_topic":
      return topic ? `Research ${topic}` : "Research topic in chat";
    case "create_artifact":
      return artifactType ? `Create ${artifactType}` : "Start creating artifact";
    case "save_artifact":
      return "Save artifact";
    case "export_artifact":
      return "Show export options";
    case "clarify_choice":
      return "Clarify next step";
  }
}

export function inferCommitmentFromAssistant(
  assistantText: string,
): Omit<
  PendingConversationCommitment,
  "id" | "createdAt" | "offeredAtTurn" | "consumed"
> | null {
  const t = assistantText.trim();
  if (!t || !assistantEndsWithQuestion(t)) return null;
  if (!CONSENT_OFFER_RE.test(t) && !assistantOfferedConsent(t)) return null;

  if (SAVE_OFFER_RE.test(t)) {
    const artifactType = extractArtifactType(t);
    return {
      type: "save_artifact",
      promptText: t,
      expectedYesAction: expectedYesForType(
        "save_artifact",
        t,
        undefined,
        undefined,
        artifactType,
      ),
      expectedNoAction: "Stay in conversation",
      artifactType,
      expiresWhenConsumed: true,
    };
  }

  if (EXPORT_OFFER_RE.test(t)) {
    const artifactType = extractArtifactType(t);
    return {
      type: "export_artifact",
      promptText: t,
      expectedYesAction: expectedYesForType(
        "export_artifact",
        t,
        undefined,
        undefined,
        artifactType,
      ),
      expectedNoAction: "Stay in conversation",
      artifactType,
      expiresWhenConsumed: true,
    };
  }

  if (CREATE_OFFER_RE.test(t) && ARTIFACT_TYPE_RE.test(t)) {
    const artifactType = extractArtifactType(t);
    return {
      type: "create_artifact",
      promptText: t,
      expectedYesAction: expectedYesForType(
        "create_artifact",
        t,
        undefined,
        undefined,
        artifactType,
      ),
      expectedNoAction: "Stay in conversation",
      artifactType,
      expiresWhenConsumed: true,
    };
  }

  if (RESEARCH_OFFER_RE.test(t)) {
    const topic = extractTopic(t);
    return {
      type: "research_topic",
      promptText: t,
      expectedYesAction: expectedYesForType(
        "research_topic",
        t,
        undefined,
        topic,
      ),
      expectedNoAction: "Stay in conversation",
      topic,
      expiresWhenConsumed: true,
    };
  }

  if (LEARNING_OFFER_RE.test(t)) {
    const topic = extractTopic(t);
    return {
      type: "continue_learning_topic",
      promptText: t,
      expectedYesAction: expectedYesForType(
        "continue_learning_topic",
        t,
        undefined,
        topic,
      ),
      expectedNoAction: "Stay in conversation",
      topic,
      expiresWhenConsumed: true,
    };
  }

  if (
    /\b(?:choose|pick|select)\s+(?:one\s+)?(?:small\s+)?task\b/i.test(t) &&
    CONSENT_OFFER_RE.test(t)
  ) {
    const section = /\bmy thoughts\b/i.test(t) ? "brain-dump" : undefined;
    return {
      type: section ? "open_workspace" : "choose_small_task",
      promptText: t,
      expectedYesAction: section
        ? "Open My Thoughts beside chat"
        : expectedYesForType("choose_small_task", t),
      expectedNoAction: "Stay in conversation",
      workspaceId: section,
      expiresWhenConsumed: true,
    };
  }

  if (/\bmy thoughts\b/i.test(t) && CONSENT_OFFER_RE.test(t)) {
    return {
      type: "open_workspace",
      promptText: t,
      expectedYesAction: "Open My Thoughts beside chat",
      expectedNoAction: "Stay in conversation",
      workspaceId: "brain-dump",
      expiresWhenConsumed: true,
    };
  }

  const workspaceSection = inferWorkspaceSectionFromConsent(t);
  if (workspaceSection && CONSENT_OFFER_RE.test(t)) {
    return {
      type: "open_workspace",
      promptText: t,
      expectedYesAction: expectedYesForType(
        "open_workspace",
        t,
        workspaceSection,
      ),
      expectedNoAction: "Stay in conversation",
      workspaceId: workspaceSection,
      expiresWhenConsumed: true,
    };
  }

  if (assistantOfferedConsent(t)) {
    return {
      type: "clarify_choice",
      promptText: t,
      expectedYesAction: expectedYesForType("clarify_choice", t),
      expectedNoAction: "Stay in conversation",
      expiresWhenConsumed: true,
    };
  }

  return null;
}

export function createConversationCommitment(
  assistantText: string,
  offeredAtTurn: number,
): PendingConversationCommitment | null {
  const inferred = inferCommitmentFromAssistant(assistantText);
  if (!inferred) return null;
  return {
    ...inferred,
    id: `commitment:${offeredAtTurn}:${Date.now()}`,
    createdAt: Date.now(),
    offeredAtTurn,
  };
}

/** Map legacy workflow kind to commitment for unified tracking. */
export function commitmentTypeFromWorkflowKind(
  kind: ConversationWorkflowKind,
  assistantText: string,
): ConversationCommitmentType {
  return workflowKindToCommitmentType(kind, assistantText);
}
