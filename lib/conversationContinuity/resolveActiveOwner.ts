/**
 * Resolve the active conversation owner from existing domain stores.
 * Prefer live domain state over the sticky pointer; clear stale pointers.
 */

import { loadBoardIntakeDraft } from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import { readActiveChamberMember } from "@/lib/chamber/chamberMemberActivation";
import { isChamberMemberConversationActive } from "@/lib/chamber/chamberConversationLock";
import {
  isPostDiscoveryCreationPhase,
  loadUniversalCreationSession,
} from "@/lib/universalCreation";
import type { UniversalCreationPhase } from "@/lib/universalCreation/types";
import { clearConversationOwner, loadConversationOwnerPointer } from "./ownerStore";
import { compareOwnerKinds, isStickyContinuityOwner } from "./routingPriority";
import type {
  ArtifactOwnerPhase,
  ConversationOwner,
  ResolveActiveOwnerInput,
} from "./types";

function mapUcPhaseToArtifactPhase(
  phase: UniversalCreationPhase,
): ArtifactOwnerPhase {
  switch (phase) {
    case "discovery":
    case "preparation":
      return "discovery";
    case "guided_creation":
    case "enhancement":
      return "drafting";
    case "review":
    case "approval":
      return "review";
    case "revision":
      return "editing";
    case "awaiting_action":
    case "completion":
      return "awaiting_action";
    default:
      return "drafting";
  }
}

function ownerFromUniversalCreation(
  activeSectionId?: string | null,
): ConversationOwner | null {
  const session = loadUniversalCreationSession();
  if (!session) return null;

  const workflowId = `uc:${session.documentType}:t${session.startedAtTurn}`;
  const awaitingAnswer =
    session.phase === "discovery" ||
    session.phase === "preparation" ||
    session.phase === "guided_creation" ||
    session.phase === "review" ||
    session.phase === "approval" ||
    session.phase === "awaiting_action";

  if (!isPostDiscoveryCreationPhase(session.phase)) {
    return {
      kind: "guided_workflow",
      workflowId,
      workflowType: session.documentType,
      currentStepId:
        session.questionIndex != null
          ? `q:${session.questionIndex}`
          : session.phase,
      awaitingAnswer: true,
      draftId: session.draftContent ? workflowId : undefined,
    };
  }

  return {
    kind: "artifact",
    artifactId: workflowId,
    artifactType: session.documentType,
    phase: mapUcPhaseToArtifactPhase(session.phase),
    activeSectionId: activeSectionId ?? undefined,
    awaitingAnswer,
  };
}

function ownerFromChamber(
  input: ResolveActiveOwnerInput,
): ConversationOwner | null {
  const member = readActiveChamberMember();
  if (!member) return null;
  if (
    !isChamberMemberConversationActive({
      activeSection: input.activeSection,
      activeMemberId: member.id,
    })
  ) {
    // Sticky member outside chamber is not an owning conversation.
    return null;
  }
  return {
    kind: "chamber_specialist",
    memberId: member.id,
    conversationId: `chamber:${member.id}`,
    topic: input.pointer?.topic,
    awaitingAnswer: input.pointer?.awaitingAnswer,
  };
}

function ownerFromBoardDirector(
  input: ResolveActiveOwnerInput,
): ConversationOwner | null {
  const directorId = input.activeDirectorId?.trim();
  if (!directorId) return null;
  return {
    kind: "board_director",
    directorId,
    conversationId: `board-director:${directorId}`,
    topic: input.pointer?.topic,
    awaitingAnswer: input.pointer?.awaitingAnswer,
  };
}

function ownerFromBoardIntake(): ConversationOwner | null {
  const draft = loadBoardIntakeDraft();
  if (!draft) return null;
  if (
    draft.currentStep === "discussion" ||
    draft.currentStep === "ready_to_begin"
  ) {
    return null;
  }
  return {
    kind: "board_intake",
    discussionDraftId: `board-intake:${draft.updatedAt}`,
    currentStepId: draft.currentStep,
    awaitingAnswer: true,
  };
}

function ownerFromBoardDiscussion(
  input: ResolveActiveOwnerInput,
): ConversationOwner | null {
  const discussionId = input.boardDiscussionId?.trim();
  if (!discussionId) return null;
  return {
    kind: "board_discussion",
    discussionId,
    selectedDirectorIds: [...(input.selectedDirectorIds ?? [])],
    currentPhase: input.boardDiscussionPhase ?? "discussion",
    awaitingAnswer: input.pointer?.awaitingAnswer,
  };
}

function candidatesFromDomain(
  input: ResolveActiveOwnerInput,
): ConversationOwner[] {
  const list: ConversationOwner[] = [];
  const uc = ownerFromUniversalCreation(input.activeArtifactSectionId);
  if (uc) list.push(uc);
  const chamber = ownerFromChamber(input);
  if (chamber) list.push(chamber);
  const director = ownerFromBoardDirector(input);
  if (director) list.push(director);
  const intake = ownerFromBoardIntake();
  if (intake) list.push(intake);
  const discussion = ownerFromBoardDiscussion(input);
  if (discussion) list.push(discussion);
  return list;
}

function pickStrongest(owners: ConversationOwner[]): ConversationOwner | null {
  if (owners.length === 0) return null;
  return [...owners].sort((a, b) => compareOwnerKinds(a.kind, b.kind))[0]!;
}

/**
 * Single read API for “who owns the next message?”
 * Domain stores win; sticky pointer only fills gaps / awaitingAnswer metadata.
 */
export function getActiveConversationOwner(
  input: ResolveActiveOwnerInput = {},
): ConversationOwner {
  const pointer = input.pointer ?? loadConversationOwnerPointer();
  const domain = candidatesFromDomain({ ...input, pointer });
  const strongest = pickStrongest(domain);

  if (strongest) {
    if (
      pointer &&
      isStickyContinuityOwner(pointer.kind) &&
      pointer.kind !== strongest.kind
    ) {
      // Domain moved on — drop stale pointer on next clear opportunity.
    }
    if (
      pointer &&
      pointer.kind === strongest.kind &&
      "awaitingAnswer" in strongest
    ) {
      return {
        ...strongest,
        awaitingAnswer:
          strongest.awaitingAnswer || pointer.awaitingAnswer,
        ...(pointer.topic && "topic" in strongest
          ? { topic: strongest.topic ?? pointer.topic }
          : {}),
      } as ConversationOwner;
    }
    return strongest;
  }

  if (pointer && isStickyContinuityOwner(pointer.kind)) {
    // Stale pointer with no backing domain record — clear and fall through.
    clearConversationOwner();
  }

  if (input.destinationId?.trim()) {
    return {
      kind: "navigation",
      destinationId: input.destinationId.trim(),
    };
  }

  return { kind: "general_chat" };
}

export function resolveActiveConversationOwner(
  input?: ResolveActiveOwnerInput,
): ConversationOwner {
  return getActiveConversationOwner(input);
}
