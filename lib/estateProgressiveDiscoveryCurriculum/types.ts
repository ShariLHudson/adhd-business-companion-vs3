/**
 * Progressive Discovery Curriculum — shared types.
 */

import type { JourneyStageId } from "@/lib/estateProgressiveDiscoveryJourney";

export type CurriculumRefType =
  | "discovery"
  | "room"
  | "feature"
  | "tool"
  | "setting"
  | "audio"
  | "story";

export type CurriculumItemStatus = "Live" | "Draft" | "Future";

export type CurriculumItemRef = {
  refType: CurriculumRefType;
  refId: string;
  order: number;
  status?: CurriculumItemStatus;
};

export type DiscoveryCollection = {
  collectionId: string;
  officialName: string;
  purpose: string;
  status: CurriculumItemStatus;
  order: number;
  presentationOrder: "sequential" | "curiosity";
  journeyStageId?: JourneyStageId | null;
  items: CurriculumItemRef[];
  relatedCollections?: string[];
  relatedRooms?: string[];
  relatedFeatures?: string[];
  relatedSparkCards?: string[];
};

export type CurriculumAudienceProfile = {
  label: string;
  pace: "gentle" | "steady" | "curious";
  collectionOrder: string[];
};

export type ProgressiveDiscoveryCurriculum = {
  registry: string;
  version: string;
  description: string;
  philosophy: {
    summary: string;
    memberShouldFeel: string;
    memberShouldNeverFeel: string;
    unfolds: string[];
  };
  rules: {
    oneMeaningfulDiscoveryAtATime: boolean;
    curiosityLed: boolean;
    neverSurfaceProgress: boolean;
    neverSurfaceScores: boolean;
    maxDiscoveriesPerResponse: number;
    collectionOrderMatters: boolean;
    prerequisitesEnforced: boolean;
    liveTargetsOnly: boolean;
    deferWhenPrerequisitesUnmet: boolean;
  };
  audienceProfiles: Record<
    "newMember" | "returningMember" | "establishedMember",
    CurriculumAudienceProfile
  >;
  journeyStageToCollections: Record<JourneyStageId, string[]>;
  futureExpansion: Record<string, boolean | string>;
  status: CurriculumItemStatus;
  lastUpdated: string;
};

export type PrerequisiteEngagement =
  | "introduced"
  | "viewed"
  | "visited"
  | "explored"
  | "saved";

export type PrerequisiteRequirement = {
  type: Exclude<CurriculumRefType, "audio" | "story">;
  id: string;
  minEngagement: PrerequisiteEngagement;
};

export type DiscoveryPrerequisite = {
  id: string;
  targetType: CurriculumRefType;
  targetId: string;
  requires: PrerequisiteRequirement[];
  reason?: string;
};

export type DiscoveryPrerequisitesDoc = {
  registry: string;
  version: string;
  description: string;
  rules: {
    enforceForDiscoveryKey: boolean;
    enforceForHelpDiscovery: boolean;
    deferWhenUnmet: boolean;
    neverExplainPrerequisitesToMember: boolean;
  };
  prerequisites: DiscoveryPrerequisite[];
  lastUpdated: string;
};

export type DiscoveryCollectionsDoc = {
  registry: string;
  version: string;
  description: string;
  collections: DiscoveryCollection[];
  lastUpdated: string;
};

export type CurriculumDiscoveryRank = {
  discoveryId: string;
  collectionId: string | null;
  collectionOrder: number;
  itemOrder: number;
  prerequisitesMet: boolean;
};
