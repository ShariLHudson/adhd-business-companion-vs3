/**
 * Estate Recommendation Intelligence — connects human need to Estate invitation.
 *
 * Answers: "Why would this person want to go there right now?"
 */

import type { EstateKnowledgeStatus } from "@/lib/estateKnowledgeBase/types";

export type MemberNeedTone =
  | "recovery"
  | "clarity"
  | "creation"
  | "celebration"
  | "connection"
  | "rest"
  | "focus"
  | "exploration";

export type MemberNeedSignal = {
  signalId: string;
  label: string;
  memberMaySay: string[];
  keywords: string[];
  emotionalTone: MemberNeedTone;
  status: EstateKnowledgeStatus;
};

export type EstateRecommendationReason = {
  signalId: string;
  locationId: string;
  whyNow: string;
  priority: number;
  status: EstateKnowledgeStatus;
};

export type EstateRecommendationChoice = {
  locationId: string;
  placeId: string;
  officialDisplayName: string;
  memberFacingHint: string;
  whyNow: string;
};

export type EstateRecommendationContext = {
  currentLocationId?: string;
  /** Future: time-of-day weighting */
  timeOfDay?: "morning" | "afternoon" | "evening";
  /** Future: deprioritize recent visits */
  recentLocationIds?: readonly string[];
};

export type EstateRecommendationDecisionKind =
  | "invitation"
  | "unresolved";

export type EstateRecommendationDecision = {
  kind: EstateRecommendationDecisionKind;
  query: string;
  signalId?: string;
  signalLabel?: string;
  emotionalTone?: MemberNeedTone;
  matchedPhrase?: string;
  primary?: EstateRecommendationChoice;
  alternatives?: EstateRecommendationChoice[];
  memberFacingInvitation?: string;
  /** Spec 108 — staying is always valid */
  stayHereOffered: boolean;
  reason?: string;
};
