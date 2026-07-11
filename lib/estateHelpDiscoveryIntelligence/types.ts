/**
 * Spark Estate Help & Discovery Intelligence — shared types.
 */

import type { AudioExperience } from "@/lib/estateAudioExperienceFoundation";
import type { EstateNavigationDecision } from "@/lib/estateNavigationIntelligence";
import type { ObjectIntentResolution } from "@/lib/estateObjectIntelligence";
import type { EstateRecommendationDecision } from "@/lib/estateRecommendationIntelligence";

export type HelpDiscoveryRoute =
  | "location"
  | "feature_how_to"
  | "discovery"
  | "experience"
  | "object"
  | "capability_overview"
  | "audio";

export type MemberDiscoveryStage = "new" | "returning" | "established";

export type FeatureHowToGuide = {
  guideId: string;
  targetType: "feature" | "setting" | "tool";
  targetId: string;
  aliases: string[];
  whatItDoes: string;
  whyHelpful: string;
  howToAccess: string;
  accessRoute: string | null;
  offerNavigation: boolean;
  status: string;
};

export type ProgressiveDiscoveryItem = {
  type: "room" | "feature" | "tool" | "setting";
  id: string;
  officialName: string;
  teaser: string;
};

export type DiscoveryLibrarySummary = {
  id: string;
  title: string;
  subtitle: string | null;
  discoveryText: string;
  whyItMatters: string | null;
  targetId: string;
  destinationRoute: string | null;
};

import type { DiscoveryHistoryStore } from "@/lib/estateDiscovery/types";
import type { MemberJourneyProgress } from "@/lib/estateProgressiveDiscoveryJourney";

export type HelpDiscoveryContext = {
  currentLocationId?: string;
  memberStage?: MemberDiscoveryStage;
  memberId?: string;
  journeyProgress?: MemberJourneyProgress;
  historyStore?: DiscoveryHistoryStore;
  exploredDiscoveryIds?: readonly string[];
};

export type HelpDiscoveryDecision = {
  kind: "resolved" | "unresolved";
  query: string;
  route: HelpDiscoveryRoute;
  matchedPhrase?: string;
  memberFacingResponse?: string;
  navigation?: EstateNavigationDecision;
  recommendation?: EstateRecommendationDecision;
  objectResolution?: ObjectIntentResolution;
  howToGuide?: FeatureHowToGuide;
  progressiveItems?: ProgressiveDiscoveryItem[];
  discoveryNote?: DiscoveryLibrarySummary;
  audioExperiences?: AudioExperience[];
  offerNavigation?: boolean;
  navigationPlaceId?: string;
  reason?: string;
};
