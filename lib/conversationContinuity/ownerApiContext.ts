/**
 * Compact owner context for companion-chat API — identifiers only.
 */

import type { ConversationOwner } from "./types";
import { getActiveConversationOwner } from "./resolveActiveOwner";
import type { ResolveActiveOwnerInput } from "./types";

export type ContinuityOwnerApiContext = {
  kind: ConversationOwner["kind"];
  id?: string;
  stepId?: string;
  awaitingAnswer?: boolean;
  topic?: string;
};

export function continuityOwnerApiContextFromOwner(
  owner: ConversationOwner,
): ContinuityOwnerApiContext | null {
  if (owner.kind === "general_chat" || owner.kind === "navigation") {
    return owner.kind === "navigation"
      ? { kind: "navigation", id: owner.destinationId }
      : { kind: "general_chat" };
  }

  switch (owner.kind) {
    case "guided_workflow":
      return {
        kind: owner.kind,
        id: owner.workflowId,
        stepId: owner.currentStepId,
        awaitingAnswer: owner.awaitingAnswer,
      };
    case "artifact":
      return {
        kind: owner.kind,
        id: owner.artifactId,
        stepId: owner.activeSectionId ?? owner.phase,
        awaitingAnswer: owner.awaitingAnswer,
      };
    case "chamber_specialist":
      return {
        kind: owner.kind,
        id: owner.memberId,
        stepId: owner.conversationId,
        topic: owner.topic,
        awaitingAnswer: owner.awaitingAnswer,
      };
    case "board_director":
      return {
        kind: owner.kind,
        id: owner.directorId,
        stepId: owner.conversationId,
        topic: owner.topic,
        awaitingAnswer: owner.awaitingAnswer,
      };
    case "board_intake":
      return {
        kind: owner.kind,
        id: owner.discussionDraftId,
        stepId: owner.currentStepId,
        awaitingAnswer: owner.awaitingAnswer,
      };
    case "board_discussion":
      return {
        kind: owner.kind,
        id: owner.discussionId,
        stepId: owner.currentPhase,
        awaitingAnswer: owner.awaitingAnswer,
      };
    default:
      return null;
  }
}

/** One-line hint for intentHint — no large objects. */
export function continuityOwnerHintForChat(
  input?: ResolveActiveOwnerInput,
): string | null {
  const owner = getActiveConversationOwner(input);
  const ctx = continuityOwnerApiContextFromOwner(owner);
  if (!ctx || ctx.kind === "general_chat") return null;
  const parts = [
    `CONTINUITY OWNER (BINDING): kind=${ctx.kind}`,
    ctx.id ? `id=${ctx.id}` : null,
    ctx.stepId ? `step=${ctx.stepId}` : null,
    ctx.awaitingAnswer ? "awaitingAnswer=true" : null,
    ctx.topic ? `topic=${ctx.topic}` : null,
    "Stay with this owner. Do not reintroduce. Do not restart discovery.",
  ].filter(Boolean);
  return parts.join(" · ");
}
