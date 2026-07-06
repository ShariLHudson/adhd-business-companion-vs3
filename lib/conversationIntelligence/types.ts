import type { FrictionlessPendingAction } from "@/lib/frictionlessActionLayer";
import type { PendingChoiceState } from "@/lib/pendingChoice/types";

export type ConversationPriorityWinner =
  | "continue_creation"
  | "accept_last_assistant"
  | "frictionless_pending"
  | "pending_choice"
  | "conversation"
  | "none";

export type StalePendingKind =
  | "frictionless"
  | "pending_choice"
  | "pending_acceptance";

export type ContinuationKind = "yes" | "continue" | "add_more";

export type ConversationPriorityInput = {
  userText: string;
  lastAssistantText: string;
  currentTurn: number;
  hasUniversalCreationSession: boolean;
  pendingChoiceState?: PendingChoiceState | null;
  frictionlessPending?: FrictionlessPendingAction | null;
};

export type ConversationPriorityVerdict = {
  winner: ConversationPriorityWinner;
  continuationKind?: ContinuationKind;
  bindAffirmationTo?: "last_assistant" | "active_session" | "pending" | "none";
  stalePendingsToClear: StalePendingKind[];
  deferPendingChoice: boolean;
  deferFrictionlessYes: boolean;
  /** Dev panel / diagnostics only */
  reason: string;
};
