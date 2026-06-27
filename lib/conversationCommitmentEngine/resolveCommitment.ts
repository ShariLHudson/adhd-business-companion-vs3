/**
 * Resolve yes/no against a Pending Conversation Commitment.
 */

import type { OutcomeThread } from "../companionOutcomeThread";
import {
  continuationForWorkflow,
  createConversationWorkflow,
  type WorkflowContinuationResult,
} from "../conversationWorkflowContinuation";
import { workspaceOpenBesideSuccessCopy } from "../workspaceOpeningRule";
import type { AppSection } from "../companionUi";
import {
  isCommitmentAffirmation,
  isCommitmentDecline,
} from "./affirmation";
import type { PendingConversationCommitment } from "./types";

export const COMMITMENT_DECLINE_MESSAGES = [
  "No problem. We can stay here.",
  "That's okay. We don't have to force it.",
] as const;

export const COMMITMENT_CLARIFY_MESSAGE =
  "Happy to — which of those would help most right now?";

export const DUPLICATE_COMMITMENT_MESSAGE =
  "We already took that step — what's the next piece you'd like to look at?";

export type CommitmentResolution =
  | { outcome: "not_commitment_reply" }
  | { outcome: "no_pending" }
  | { outcome: "expired" }
  | { outcome: "duplicate" }
  | {
      outcome: "decline";
      message: string;
      consumed: PendingConversationCommitment;
    }
  | {
      outcome: "affirm";
      continuation: WorkflowContinuationResult;
      consumed: PendingConversationCommitment;
    }
  | {
      outcome: "affirm_create";
      artifactType: string;
      message: string;
      consumed: PendingConversationCommitment;
    }
  | {
      outcome: "affirm_export";
      message: string;
      consumed: PendingConversationCommitment;
    };

const LEARNING_CONTINUATIONS: { re: RegExp; message: string }[] = [
  {
    re: /\bpinterest\b/i,
    message:
      "Great — for Pinterest, vertical images (2:3 ratio) with one clear focal point tend to perform best. Readable text overlays, warm lighting, and brand-consistent colors help too. Want to dig into pin titles, layouts, or hook lines next?",
  },
  {
    re: /\b(?:instagram|reels?)\b/i,
    message:
      "Let's explore Instagram visuals — strong hooks in the first second, clear subject, and captions that invite saves. Which part feels most useful: hooks, carousel flow, or Reels pacing?",
  },
  {
    re: /\b(?:image|visual|photo|graphic)s?\b/i,
    message:
      "Happy to explore image strategy — clarity beats cleverness: one idea per image, readable at a glance, and aligned with what your audience saves or shares. What platform are you thinking about?",
  },
];

function learningContinuation(
  topic: string | undefined,
  promptText: string,
): string {
  const hay = `${topic ?? ""} ${promptText}`;
  for (const { re, message } of LEARNING_CONTINUATIONS) {
    if (re.test(hay)) return message;
  }
  return topic
    ? `Great — let's explore **${topic}** together here in chat. What's the part you want clarity on first?`
    : "Great — let's keep exploring this together here in chat. What part would help most right now?";
}

function researchContinuation(topic: string | undefined): string {
  return topic
    ? `On it — I'll research **${topic}** and share what I find right here in chat.`
    : "On it — I'll look into that and share what I find right here in chat.";
}

function createContinuation(artifactType: string | undefined): string {
  const label = artifactType ?? "Draft";
  return `Perfect — let's shape your **${label}** together. I'm still here while we work on it. What's the working title or first section you want to tackle?`;
}

function exportContinuation(artifactType: string | undefined): string {
  const label = artifactType ?? "draft";
  return `Your **${label}** is ready — use the save and export buttons in **Create** beside you, or tell me how you'd like to save it.`;
}

function workflowForCommitment(
  commitment: PendingConversationCommitment,
  outcomeThread?: OutcomeThread | null,
): WorkflowContinuationResult | null {
  const workflow = createConversationWorkflow(
    commitment.promptText,
    commitment.offeredAtTurn,
  );
  if (workflow) {
    return continuationForWorkflow(workflow, {
      pendingDecision: outcomeThread?.pendingDecision,
      currentProblem: outcomeThread?.currentProblem,
    });
  }

  if (commitment.type === "open_workspace" && commitment.workspaceId) {
    const section = commitment.workspaceId;
    const view =
      section === "brain-dump" &&
      /\bmy thoughts\b/i.test(commitment.promptText)
        ? ("my-thoughts" as const)
        : undefined;
    return {
      action: "open_section",
      section,
      message: workspaceOpenBesideSuccessCopy(section, {
        view,
        isAffirmative: true,
      }),
      nextWorkflow: null,
      clearMyMindView: view,
    };
  }

  if (commitment.type === "choose_small_task") {
    return {
      action: "reply",
      message:
        "Okay. What's one thing that's been sitting in the back of your mind today?",
      nextWorkflow: null,
    };
  }

  return null;
}

export function resolveConversationCommitment(input: {
  userText: string;
  commitment: PendingConversationCommitment | null;
  lastConsumedId?: string | null;
  currentTurn: number;
  maxTurnsSinceOffer?: number;
  outcomeThread?: OutcomeThread | null;
  hasRealArtifactDraft?: boolean;
}): CommitmentResolution {
  const t = input.userText.trim();
  if (!t) return { outcome: "not_commitment_reply" };
  if (!isCommitmentAffirmation(t) && !isCommitmentDecline(t)) {
    return { outcome: "not_commitment_reply" };
  }

  if (!input.commitment) {
    if (isCommitmentAffirmation(t)) return { outcome: "no_pending" };
    return { outcome: "not_commitment_reply" };
  }

  const commitment = input.commitment;

  if (commitment.consumed || commitment.id === input.lastConsumedId) {
    if (isCommitmentAffirmation(t)) {
      return { outcome: "duplicate" };
    }
    return { outcome: "not_commitment_reply" };
  }

  const turnsSince = input.currentTurn - commitment.offeredAtTurn;
  const limit = input.maxTurnsSinceOffer ?? 3;
  if (turnsSince > limit) {
    return { outcome: "expired" };
  }

  if (isCommitmentDecline(t)) {
    const idx = commitment.offeredAtTurn % COMMITMENT_DECLINE_MESSAGES.length;
    const message =
      commitment.expectedNoAction === "Stay in conversation"
        ? COMMITMENT_DECLINE_MESSAGES[idx]!
        : (commitment.expectedNoAction ?? COMMITMENT_DECLINE_MESSAGES[idx]!);
    return {
      outcome: "decline",
      message,
      consumed: { ...commitment, consumed: true },
    };
  }

  if (
    (commitment.type === "save_artifact" ||
      commitment.type === "export_artifact") &&
    !input.hasRealArtifactDraft
  ) {
    return {
      outcome: "affirm",
      continuation: {
        action: "reply",
        message:
          "We don't have a finished draft ready to save yet — want to keep building it first?",
        nextWorkflow: null,
      },
      consumed: { ...commitment, consumed: true },
    };
  }

  if (commitment.type === "continue_learning_topic") {
    return {
      outcome: "affirm",
      continuation: {
        action: "reply",
        message: learningContinuation(commitment.topic, commitment.promptText),
        nextWorkflow: null,
      },
      consumed: { ...commitment, consumed: true },
    };
  }

  if (commitment.type === "research_topic") {
    return {
      outcome: "affirm",
      continuation: {
        action: "reply",
        message: researchContinuation(commitment.topic),
        nextWorkflow: null,
      },
      consumed: { ...commitment, consumed: true },
    };
  }

  if (commitment.type === "create_artifact") {
    const artifactType = commitment.artifactType ?? "Draft";
    return {
      outcome: "affirm_create",
      artifactType,
      message: createContinuation(artifactType),
      consumed: { ...commitment, consumed: true },
    };
  }

  if (
    commitment.type === "save_artifact" ||
    commitment.type === "export_artifact"
  ) {
    return {
      outcome: "affirm_export",
      message: exportContinuation(commitment.artifactType),
      consumed: { ...commitment, consumed: true },
    };
  }

  if (commitment.type === "clarify_choice") {
    const workflowHit = workflowForCommitment(commitment, input.outcomeThread);
    if (workflowHit) {
      return {
        outcome: "affirm",
        continuation: workflowHit,
        consumed: { ...commitment, consumed: true },
      };
    }
    return {
      outcome: "affirm",
      continuation: {
        action: "reply",
        message: COMMITMENT_CLARIFY_MESSAGE,
        nextWorkflow: null,
      },
      consumed: { ...commitment, consumed: true },
    };
  }

  const continuation = workflowForCommitment(commitment, input.outcomeThread);
  if (!continuation) {
    return {
      outcome: "affirm",
      continuation: {
        action: "reply",
        message: COMMITMENT_CLARIFY_MESSAGE,
        nextWorkflow: null,
      },
      consumed: { ...commitment, consumed: true },
    };
  }

  return {
    outcome: "affirm",
    continuation,
    consumed: { ...commitment, consumed: true },
  };
}

/** Ready to Export surfaces only after explicit save/export invitation acceptance. */
export function commitmentAllowsArtifactExport(
  commitment: PendingConversationCommitment | null,
): boolean {
  if (!commitment || commitment.consumed) return false;
  return (
    commitment.type === "save_artifact" || commitment.type === "export_artifact"
  );
}

export function sectionForCommitment(
  commitment: PendingConversationCommitment,
): AppSection | undefined {
  return commitment.workspaceId;
}
