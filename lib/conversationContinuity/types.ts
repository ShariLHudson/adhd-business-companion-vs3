/**
 * Conversation Continuity — single source of truth for who owns the next turn.
 *
 * Domain data still lives in existing stores (UC session, board intake, chamber).
 * This model is the ownership pointer + routing contract used before broad classifiers.
 */

export type ArtifactOwnerPhase =
  | "discovery"
  | "drafting"
  | "review"
  | "approved"
  | "awaiting_action"
  | "editing";

export type ConversationOwner =
  | {
      kind: "guided_workflow";
      workflowId: string;
      workflowType: string;
      currentStepId: string;
      awaitingAnswer: boolean;
      draftId?: string;
    }
  | {
      kind: "artifact";
      artifactId: string;
      artifactType: string;
      phase: ArtifactOwnerPhase;
      activeSectionId?: string;
      awaitingAnswer: boolean;
    }
  | {
      kind: "chamber_specialist";
      memberId: string;
      conversationId: string;
      topic?: string;
      awaitingAnswer?: boolean;
    }
  | {
      kind: "board_director";
      directorId: string;
      conversationId: string;
      topic?: string;
      awaitingAnswer?: boolean;
    }
  | {
      kind: "board_intake";
      discussionDraftId: string;
      currentStepId: string;
      awaitingAnswer: boolean;
    }
  | {
      kind: "board_discussion";
      discussionId: string;
      selectedDirectorIds: string[];
      currentPhase: string;
      awaitingAnswer?: boolean;
    }
  | {
      kind: "navigation";
      destinationId: string;
    }
  | {
      kind: "general_chat";
    };

export type ConversationOwnerKind = ConversationOwner["kind"];

/** Sticky pointer only — never duplicates draft bodies or Board history. */
export type PersistedConversationOwnerPointer = {
  kind: ConversationOwnerKind;
  id: string;
  stepId?: string;
  awaitingAnswer: boolean;
  returnDestinationId?: string;
  topic?: string;
  updatedAt: string;
};

export type ResolveActiveOwnerInput = {
  activeSection?: string | null;
  activeDirectorId?: string | null;
  boardDiscussionId?: string | null;
  boardDiscussionPhase?: string | null;
  selectedDirectorIds?: string[] | null;
  activeArtifactSectionId?: string | null;
  destinationId?: string | null;
  /** Optional sticky overlay from persistConversationOwner. */
  pointer?: PersistedConversationOwnerPointer | null;
};

export const CONVERSATION_OWNER_STORAGE_KEY =
  "spark:conversation-owner:v1" as const;
