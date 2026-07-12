/**
 * Director relationships — typed graph for Board navigation & future discussions.
 * Never auto-invites. Exposed via API; UI may consume without redesign.
 */

import type { BoardDirectorId } from "@/lib/board/types";

/** How one Director relates to another on the Board. */
export type DirectorRelationshipKind =
  | "often_works_with"
  | "provides_balance"
  | "recommends"
  | "invite_for_decision";

export type DirectorDecisionInviteRule = {
  /** Stable theme ids for matching (not free-form UI copy). */
  themes: readonly string[];
  /** Keyword / phrase cues that activate this invite rule. */
  cues: readonly string[];
  inviteDirectorIds: readonly BoardDirectorId[];
  reason: string;
};

/** Future Board discussion facilitation hints — unused by UI today. */
export type DirectorDiscussionAffinity = {
  /** Lower = tends to speak earlier when assembling a discussion. */
  speakingOrderBias: number;
  challengeTendency: "low" | "medium" | "high";
  pairsWellInDebateWith: readonly BoardDirectorId[];
};

/**
 * Full relationship profile for one Director.
 * Source of truth for recommendations and Board assembly support.
 */
export type DirectorRelationshipProfile = {
  directorId: BoardDirectorId;
  /** Directors this person frequently collaborates with at the table. */
  oftenWorksWith: readonly BoardDirectorId[];
  /** Directors who provide constructive counterweight to this lens. */
  providesBalance: readonly BoardDirectorId[];
  /** Directors this person typically recommends inviting next. */
  recommends: readonly BoardDirectorId[];
  /** Conditional invites for certain decision shapes. */
  inviteForDecisions: readonly DirectorDecisionInviteRule[];
  discussionAffinity: DirectorDiscussionAffinity;
};

export type DirectorRelationshipEdge = {
  fromDirectorId: BoardDirectorId;
  toDirectorId: BoardDirectorId;
  kind: DirectorRelationshipKind;
  reason?: string;
  themes?: readonly string[];
};

export type DirectorRelationshipRecommendation = {
  directorId: BoardDirectorId;
  score: number;
  reasons: string[];
  kinds: DirectorRelationshipKind[];
  sourceDirectorIds: BoardDirectorId[];
};

export type RecommendDirectorsFromRelationshipsInput = {
  decisionText?: string;
  /** Directors already at the table / seeding the recommendation. */
  seedDirectorIds?: readonly BoardDirectorId[];
  /** Never recommend these (already included, declined, etc.). */
  excludeDirectorIds?: readonly BoardDirectorId[];
  limit?: number;
};

export type RecommendDirectorsFromRelationshipsResult = {
  recommendations: DirectorRelationshipRecommendation[];
  /** True when Devil’s Advocate is offered as optional — never auto-added. */
  offerDevilsAdvocate: boolean;
  offerDevilsAdvocateReason?: string;
};
