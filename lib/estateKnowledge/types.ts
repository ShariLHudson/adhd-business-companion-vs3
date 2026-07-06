/**
 * Estate Knowledge Registry™ — read-only compiled knowledge types (Phase 1).
 *
 * @see docs/ESTATE_KNOWLEDGE_REGISTRY_AUDIT.md
 * @see docs/estate/SPARK_ESTATE_MASTER_WORLD_BIBLE.md
 */

import type { CanonicalEstateCategory, CanonicalEstateStatus } from "@/lib/estate/canonicalEstateRegistryTypes";

/** Member-facing readiness — normalized from canonical status + integrity flags. */
export type EstateKnowledgePlaceStatus = "live" | "planned" | "hidden" | "broken";

export type EstateKnowledgeGuidebookRef = {
  spreadId: string;
  title: string;
  epigraph?: string;
  openingLine?: string;
  tagline?: string;
};

export type EstateKnowledgeRouteDestination = {
  appSection: string | null;
  experienceTier: string;
  navigable: boolean;
  shellComponent: string;
};

export type EstateKnowledgeMediaAssets = {
  /** Primary plate from estatePlaceMedia */
  backgroundImage: string | null;
  backgroundFallbacks: readonly string[];
  /** Canonical registry `backgroundImage` field */
  registryBackgroundImage: string | null;
  audio: { src: string; character?: string } | null;
  videos: readonly string[];
};

export type EstateKnowledgePlaceEntry = {
  id: string;
  displayName: string;
  status: EstateKnowledgePlaceStatus;
  canonicalStatus: CanonicalEstateStatus;
  category: CanonicalEstateCategory;
  /** Semantic + suggestion + category groups for queryPlaces / getPlacesByGroup */
  groups: readonly string[];
  synonyms: readonly string[];
  emotionalUses: readonly string[];
  activities: readonly string[];
  relatedPlaces: readonly string[];
  media: EstateKnowledgeMediaAssets;
  routeDestination: EstateKnowledgeRouteDestination | null;
  guidebook: EstateKnowledgeGuidebookRef | null;
  walkable: boolean;
  chatCanDescribe: boolean;
  /** Listed in ESTATE_WANDER_PLACE_ORDER (menus may offer before navigate succeeds). */
  offeredInWanderMenu: boolean;
  brainEntryId: string | null;
  purpose?: string;
  primaryFeeling: string;
  brokenReasons: readonly string[];
};

export type EstateKnowledgeFeatureEntry = {
  id: string;
  name: string;
  kind: "app-feature" | "estate-experience" | "estate-space-tool";
  howTo?: string;
  navigation?: string;
  relatedPlaceIds?: readonly string[];
};

export type EstateKnowledgePlaceQuery = {
  group?: string;
  status?: EstateKnowledgePlaceStatus;
  walkable?: boolean;
  chatCanDescribe?: boolean;
  /** Substring match on display name, synonyms, or purpose */
  text?: string;
};

export type EstateKnowledgeAnswerIntent =
  | "places_by_need"
  | "room_catalog"
  | "room_story"
  | "feature_catalog"
  | "feature_how_to"
  | "unknown";

export type EstateKnowledgeAnswer = {
  query: string;
  intent: EstateKnowledgeAnswerIntent;
  needGroup?: string;
  matchedPlaceId?: string;
  placeIds: string[];
  featureIds: string[];
  summary: string;
  places: EstateKnowledgePlaceEntry[];
};

export type EstateKnowledgeAuditReport = {
  generatedAt: string;
  registryVersion: string;
  counts: {
    totalPlaces: number;
    live: number;
    planned: number;
    hidden: number;
    broken: number;
    walkable: number;
    chatCanDescribe: number;
    withGuidebook: number;
    withBrainEntry: number;
    features: number;
  };
  canonicalNotKnownToChat: string[];
  mediaKeysWithoutRegistryPlace: string[];
  registryPlacesMissingMedia: string[];
  plannedOfferedAsWalkable: string[];
  featureGaps: string[];
};
