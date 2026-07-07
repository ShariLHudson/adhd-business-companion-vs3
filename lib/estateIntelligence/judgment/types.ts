/**
 * Estate Knowledge Judgment Layer — types (Phase 2).
 * Registry owns facts; judgment owns reasoning.
 */

import type { CanonicalConversationStyle } from "@/lib/estate/canonicalEstateRegistryTypes";

export type EstateEnergyLevel = "low" | "medium" | "high";

export type EstateDiscoveryLevel =
  | "hidden"
  | "gentle"
  | "familiar"
  | "featured";

export type EstateIntentFamily =
  | "create"
  | "organize"
  | "focus"
  | "think"
  | "recover"
  | "learn"
  | "celebrate"
  | "explore";

export type EstateRecommendationKind =
  | "place"
  | "feature"
  | "music"
  | "breathing"
  | "workspace"
  | "stay_in_chat";

export type EstatePurposeProfile = {
  placeId: string;
  displayName: string;
  purpose: string;
  primaryFeeling: string;
  secondaryFeelings: readonly string[];
  energyLevel: EstateEnergyLevel;
  idealActivities: readonly string[];
  conversationStyle: CanonicalConversationStyle | "quiet" | "gentle" | "unhurried";
  recommendedVisitMinutes: { min: number; max: number };
  bestFor: readonly string[];
  notRecommendedFor: readonly string[];
  relatedPlaceIds: readonly string[];
  musicRecommendations: readonly string[];
  featureRecommendations: readonly string[];
  discoveryLevel: EstateDiscoveryLevel;
};

export type EstateEmotionalSignal =
  | "overwhelmed"
  | "stressed"
  | "burnout"
  | "anxious"
  | "tired"
  | "calm"
  | "curious"
  | "celebratory"
  | "uncertain"
  | "neutral";

export type EstateActivityMode = "creation" | "reflection" | "mixed" | "unknown";

export type EstateContextSignals = {
  emotional: EstateEmotionalSignal;
  overwhelmLevel: number;
  intentFamilies: readonly EstateIntentFamily[];
  activityMode: EstateActivityMode;
  wantsReading: boolean;
  wantsWater: boolean;
  wantsFocus: boolean;
  wantsThink: boolean;
  wantsRecover: boolean;
  wantsCatalog: boolean;
  wantsRoomStory: boolean;
  namedPlaceId: string | null;
  confidence: number;
};

export type EstateJudgmentInput = {
  userText: string;
  currentPlaceId?: string | null;
  lastAssistantText?: string | null;
  visitedPlaceIds?: readonly string[];
  timeOfDay?: "morning" | "afternoon" | "evening" | "night";
};

export type EstateRecommendation = {
  kind: EstateRecommendationKind;
  id: string;
  displayName: string;
  why: string;
  confidence: number;
};

export type EstateJudgmentResult = {
  handled: boolean;
  intentFamily: EstateIntentFamily | null;
  signals: EstateContextSignals;
  recommendations: readonly EstateRecommendation[];
  intro: string;
  body: string;
  suggestions: readonly string[];
  shouldAskQuestion: boolean;
  clarifyingQuestion?: string;
  stayInChat: boolean;
  discoveryCategories?: readonly string[];
  matchedPlaceId?: string;
  candidatePlaceIds: readonly string[];
  responseHint: string;
};

export type ScoredPlaceCandidate = {
  placeId: string;
  score: number;
  reasons: string[];
};
