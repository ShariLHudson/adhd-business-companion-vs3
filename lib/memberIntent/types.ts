/**
 * Authoritative Intent Classification buckets.
 *
 * User Utterance → Intent Classification → exactly one of these.
 * Downstream systems (Continuity gate, Create, Chamber, coaching) execute
 * the bucket — they do not invent a competing taxonomy.
 */

export const MEMBER_INTENT_BUCKETS = [
  "conversation",
  "active_document",
  "new_document",
  "chamber_member",
  "board_member",
  "navigation",
  "research",
  "project",
  "clarification",
] as const;

export type MemberIntentBucket = (typeof MEMBER_INTENT_BUCKETS)[number];

export type MemberIntentConfidence = "high" | "medium" | "low";

export type MemberIntentClassification = {
  bucket: MemberIntentBucket;
  confidence: MemberIntentConfidence;
  /** Short internal reason for diagnostics — never member-facing. */
  reason: string;
  /** Optional refs for executors (Chamber id, Board director id, clarify prompt…). */
  refs?: {
    chamberMemberId?: string;
    boardDirectorId?: string;
    clarifyPrompt?: string;
    switchWorkspaceId?: string;
    destinationKind?: string;
  };
};
