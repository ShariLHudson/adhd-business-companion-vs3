/**
 * Conversation Commitment Engine — Yes Belongs To The Last Invitation
 */

import type { AppSection } from "../companionUi";

export type ConversationCommitmentType =
  | "choose_small_task"
  | "open_workspace"
  | "continue_learning_topic"
  | "research_topic"
  | "create_artifact"
  | "save_artifact"
  | "export_artifact"
  | "clarify_choice";

export type PendingConversationCommitment = {
  id: string;
  type: ConversationCommitmentType;
  promptText: string;
  expectedYesAction: string;
  expectedNoAction?: string;
  workspaceId?: AppSection;
  topic?: string;
  artifactType?: string;
  createdAt: number;
  offeredAtTurn: number;
  expiresWhenConsumed: true;
  /** Set when yes/no has been handled — duplicate affirmations must not re-run. */
  consumed?: boolean;
};

export type CommitmentStore = {
  pending: PendingConversationCommitment | null;
  lastConsumedId: string | null;
};
