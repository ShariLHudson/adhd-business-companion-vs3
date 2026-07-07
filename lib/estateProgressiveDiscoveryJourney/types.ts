/**
 * Progressive Discovery Journey™ — shared types.
 * Progress is tracked quietly — never surfaced as scores or checklists.
 */

import type { DiscoveryPriority } from "@/lib/estateDiscovery/types";

export type JourneyStageId =
  | "welcome"
  | "explore"
  | "discover-features"
  | "personalize"
  | "deeper-discovery";

export type JourneyItemType =
  | "room"
  | "feature"
  | "tool"
  | "setting"
  | "discovery";

export type JourneyItemRef = {
  type: JourneyItemType;
  id: string;
};

export type JourneyStage = {
  stageId: JourneyStageId;
  order: number;
  label: string;
  purpose: string;
  intro: string;
  priorityBands: string[];
  itemIds: JourneyItemRef[];
  status: string;
};

export type MemberJourneyProgress = {
  memberId: string;
  discoveriesViewed: string[];
  roomsVisited: string[];
  featuresExplored: string[];
  savedDiscoveries: string[];
  interestsShown: string[];
  journeyItemsIntroduced: string[];
  updatedAt: string;
};

export type JourneyProgressStore = {
  load(memberId: string): MemberJourneyProgress;
  save(progress: MemberJourneyProgress): void;
};

export type JourneyStageItem = {
  stageId: JourneyStageId;
  type: JourneyItemType;
  id: string;
  itemKey: string;
  officialName: string;
  teaser: string;
};

export type JourneyRecommendationContext = {
  progress: MemberJourneyProgress;
  currentRoomId?: string;
  activeSeasonId?: string | null;
};

export type JourneyDiscoveryPick = {
  discoveryId: string;
  title: string;
  discoveryText: string;
  whyItMatters: string | null;
  priority: DiscoveryPriority;
  stageId: JourneyStageId;
};

export type MemberTenure = "new" | "returning" | "established";
