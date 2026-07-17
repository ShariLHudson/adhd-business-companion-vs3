/**
 * CB-022 — Authoritative active-topic state for Chamber / specialist turns.
 * Conversation Engine owns this. Members, routers, and arrival hosts must not
 * maintain competing topic state.
 */

export type ActiveTopicStatus =
  | "identified"
  | "awaiting_clarification"
  | "ready_to_answer"
  | "answered"
  | "completed"
  | "cancelled";

export type ActiveTopicConfidence = "high" | "medium" | "low";

export type ActiveTopicState = {
  topicId: string;
  domain?: string;
  userGoal: string;
  lastAnsweredQuestion?: string;
  unresolvedNeed?: string;
  selectedKnowledgeSources: string[];
  /** Always Shari — Chamber contributes; Shari speaks. */
  responseOwner: "shari";
  status: ActiveTopicStatus;
  confidence: ActiveTopicConfidence;
  startedAtTurn: number;
  updatedAtTurn: number;
  /** Chamber member id when knowledge maps to a specialist (not a speaker id). */
  chamberMemberId?: string;
};

export function isActiveTopicUnresolved(
  topic: ActiveTopicState | null | undefined,
): boolean {
  if (!topic) return false;
  return (
    topic.status === "identified" ||
    topic.status === "awaiting_clarification" ||
    topic.status === "ready_to_answer"
  );
}
