/**
 * Sticky ownership pointer — IDs and awaiting-answer only.
 * Does not duplicate Universal Creation drafts, Board history, or projects.
 * Projection of ConversationSession spine — must match active conversationId.
 */

import {
  CONVERSATION_OWNER_STORAGE_KEY,
  type ConversationOwner,
  type PersistedConversationOwnerPointer,
} from "./types";
import { getActiveSpineConversationId } from "@/lib/conversationSession/spine";
import { reportProjectionConversationIdMismatch } from "@/lib/conversationSession/spineInvariants";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function pointerFromOwner(
  owner: ConversationOwner,
  extras?: { returnDestinationId?: string; topic?: string },
): PersistedConversationOwnerPointer | null {
  if (owner.kind === "general_chat" || owner.kind === "navigation") {
    return null;
  }

  const spineId = getActiveSpineConversationId() ?? undefined;
  const base = {
    awaitingAnswer:
      "awaitingAnswer" in owner ? Boolean(owner.awaitingAnswer) : false,
    returnDestinationId: extras?.returnDestinationId,
    topic: extras?.topic ?? ("topic" in owner ? owner.topic : undefined),
    updatedAt: new Date().toISOString(),
    conversationId: spineId,
  };

  switch (owner.kind) {
    case "guided_workflow":
      return {
        kind: owner.kind,
        id: owner.workflowId,
        stepId: owner.currentStepId,
        ...base,
        awaitingAnswer: owner.awaitingAnswer,
      };
    case "artifact":
      return {
        kind: owner.kind,
        id: owner.artifactId,
        stepId: owner.activeSectionId ?? owner.phase,
        ...base,
        awaitingAnswer: owner.awaitingAnswer,
      };
    case "chamber_specialist":
      return {
        kind: owner.kind,
        id: owner.memberId,
        stepId: owner.conversationId,
        ...base,
      };
    case "board_director":
      return {
        kind: owner.kind,
        id: owner.directorId,
        stepId: owner.conversationId,
        ...base,
      };
    case "board_intake":
      return {
        kind: owner.kind,
        id: owner.discussionDraftId,
        stepId: owner.currentStepId,
        ...base,
        awaitingAnswer: owner.awaitingAnswer,
      };
    case "board_discussion":
      return {
        kind: owner.kind,
        id: owner.discussionId,
        stepId: owner.currentPhase,
        ...base,
      };
    default:
      return null;
  }
}

export function loadConversationOwnerPointer(): PersistedConversationOwnerPointer | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(CONVERSATION_OWNER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedConversationOwnerPointer;
    if (!parsed?.kind || !parsed?.id) return null;
    const spineId = getActiveSpineConversationId();
    const projId = parsed.conversationId?.trim() || "";
    // Explicit foreign spine id → ignore. Legacy pointers without id still load
    // until next persist stamps conversationId (reset already clears Continuity).
    if (projId && spineId && projId !== spineId) {
      reportProjectionConversationIdMismatch({
        projection: "continuityOwner",
        projectionConversationId: projId,
        spineConversationId: spineId,
      });
      s.removeItem(CONVERSATION_OWNER_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function persistConversationOwner(
  owner: ConversationOwner,
  extras?: { returnDestinationId?: string; topic?: string },
): void {
  const s = storage();
  if (!s) return;
  const pointer = pointerFromOwner(owner, extras);
  if (!pointer) {
    s.removeItem(CONVERSATION_OWNER_STORAGE_KEY);
    return;
  }
  s.setItem(CONVERSATION_OWNER_STORAGE_KEY, JSON.stringify(pointer));
}

export function clearConversationOwner(): void {
  const s = storage();
  if (!s) return;
  s.removeItem(CONVERSATION_OWNER_STORAGE_KEY);
}

export function setActiveConversationOwner(
  owner: ConversationOwner,
  extras?: { returnDestinationId?: string; topic?: string },
): ConversationOwner {
  persistConversationOwner(owner, extras);
  return owner;
}
