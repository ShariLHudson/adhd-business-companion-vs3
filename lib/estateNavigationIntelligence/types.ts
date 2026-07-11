/**
 * Estate Navigation Intelligence — connects member intent to Estate destinations.
 *
 * @see docs/estate-knowledge-base/ (Estate Knowledge Base)
 */

import type { LocationOption } from "@/lib/estateKnowledgeBase/types";

export type EstateNavigationIntentKind =
  | "specific_location"
  | "alias_match"
  | "experience_request"
  | "ambiguous_location"
  | "feature_request"
  | "recommendation"
  | "unresolved";

export type EstateNavigationDecisionKind =
  | "navigate_direct"
  | "offer_choices"
  | "need_clarification"
  | "unresolved";

/** One thoughtful destination option (max 4 — T-003 allows 2–4). */
export type EstateNavigationChoice = {
  locationId: string;
  placeId: string;
  officialDisplayName: string;
  memberFacingHint: string;
  primaryAssetFileName: string;
  route: string | null;
  buttonText: "Take Me There";
};

export type EstateNavigationPreferences = {
  /** Future: member favorites */
  favorites?: readonly string[];
  /** Future: recently visited location ids */
  recentlyVisited?: readonly string[];
  /** Future: seasonal space hints */
  seasonal?: readonly string[];
  /** Future: accessibility preferences */
  accessibility?: readonly string[];
};

export type EstateNavigationDecision = {
  kind: EstateNavigationDecisionKind;
  query: string;
  intentKind: EstateNavigationIntentKind;
  matchedPhrase?: string;
  experienceGroup?: string;
  experienceGroupId?: string;
  /** Validated canonical place id when kind === navigate_direct */
  placeId?: string;
  locationId?: string;
  choices?: EstateNavigationChoice[];
  memberFacingPrompt?: string;
  clarificationQuestion?: string;
  reason?: string;
};

export type ValidatedNavigationTarget = {
  locationId: string;
  placeId: string;
  option: LocationOption;
};
