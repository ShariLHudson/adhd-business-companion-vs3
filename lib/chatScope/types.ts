/**
 * Conversational scopes — one primary active scope owns chat at a time.
 * Member-facing copy never exposes these IDs.
 */

export type ChatScopeKind =
  | "global_companion"
  | "estate_destination"
  | "guided_creation"
  | "project"
  | "chamber_member"
  | "board_discussion"
  | "reflective"
  | "new_day";

export type ChatScopeRecord = {
  scopeId: string;
  kind: ChatScopeKind;
  /** Destination / Board / Chamber / Create record id when applicable. */
  sourceId: string | null;
  active: boolean;
  createdAt: number;
  lastActiveAt: number;
  resumable: boolean;
  pendingQuestion: boolean;
  /** When true, this scope may initiate Estate navigation. */
  navigationOwner: boolean;
};

export type DaySession = {
  daySessionId: string;
  startedAt: number;
  conversationId: string | null;
};

export type ChatRequestIdentity = {
  conversationId: string;
  daySessionId: string;
  requestId: string;
  scopeId: string;
  destinationId?: string | null;
};

/** Binding intent priority for Estate chat (highest first). */
export const CHAT_INTENT_PRIORITY = [
  "safety_or_account",
  "direct_navigation",
  "workflow_management",
  "create_open_start",
  "awaiting_answer_same_scope",
  "current_destination",
  "general_conversation",
  "suggested_routing",
] as const;

export type ChatIntentPriorityStep = (typeof CHAT_INTENT_PRIORITY)[number];
