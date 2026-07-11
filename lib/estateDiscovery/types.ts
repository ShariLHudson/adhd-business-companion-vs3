/**
 * Discovery Key — shared types across library, engine, placement, and UI.
 */

import type { AppSection } from "@/lib/companionUi";

/** Editorial workflow — only Live is member-facing. Future is legacy → Draft. */
export type DiscoveryRegistryStatus =
  | "Draft"
  | "Review"
  | "Approved"
  | "Live"
  | "Hidden"
  | "Retired"
  | "Future";

export type DiscoveryEditorialMeta = {
  reviewNotes?: string | null;
  approvedAt?: string | null;
  reviewedBy?: string | null;
};

/** Future-ready CMS fields — schema only in V1 */
export type DiscoveryFutureMeta = {
  scheduling?: {
    activateAt?: string | null;
    expireAt?: string | null;
  } | null;
  seasonal?: {
    seasonId?: string | null;
  } | null;
  featured?: boolean;
  translations?: Record<string, string> | null;
  memberSegments?: string[] | null;
  difficulty?: "gentle" | "reflective" | "exploratory" | null;
  estimatedReadingMinutes?: number | null;
};

export type DiscoveryPriority =
  | "Essential"
  | "Helpful"
  | "Delight"
  | "Personalized";

export type DiscoveryCategorySlug =
  | "welcome"
  | "estate-discovery"
  | "feature-discovery"
  | "estate-story"
  | "hidden-treasure"
  | "personal-discovery"
  | "new-possibility"
  | "seasonal-discovery";

export type DiscoveryDestinationType =
  | "room"
  | "feature"
  | "tool"
  | "setting"
  | "route"
  | "audio"
  | "activity";

export type DiscoveryTargetRegistry =
  | "estate-rooms"
  | "estate-features"
  | "estate-tools"
  | "estate-settings"
  | "estate-routes";

export type DiscoveryTriggerRuleType =
  | "first-estate-visit"
  | "first-room-visit"
  | "never-visited-room"
  | "feature-never-used"
  | "season-active"
  | "member-pattern-detected"
  | "manual"
  | "time-based"
  | "favorite-room";

export type DiscoveryTriggerRule = {
  type: DiscoveryTriggerRuleType;
  enabled: boolean;
  config: Record<string, unknown>;
};

export type DiscoveryLibraryItem = {
  id: string;
  status: DiscoveryRegistryStatus;
  priority: DiscoveryPriority;
  category: DiscoveryCategorySlug;
  title: string;
  subtitle: string | null;
  image: string | null;
  discoveryText: string;
  whyItMatters: string | null;
  foodForThought: string | null;
  primaryButton: string | null;
  /** What Spark says when the member taps the primary button — turns the card into a conversation. */
  companionResponse: string | null;
  /** Discovery Collection slug — e.g. welcome-to-spark-estate */
  collectionId: string | null;
  destinationRoute: string | null;
  destinationType: DiscoveryDestinationType | null;
  saveAllowed: boolean;
  relatedRoom: string | null;
  relatedFeature: string | null;
  relatedTool: string | null;
  relatedSparkCards: string[];
  targetRegistry: DiscoveryTargetRegistry;
  targetId: string;
  triggerRules: DiscoveryTriggerRule[];
  tags: string[];
  keywords: string[];
  version: number;
  createdAt?: string;
  lastUpdated: string;
  author?: string;
  createdBy: string;
  editorial?: DiscoveryEditorialMeta;
  future?: DiscoveryFutureMeta;
};

export type EstateIntelligenceRegistryItem = {
  id: string;
  status: DiscoveryRegistryStatus;
  route?: string | null;
  navigationDestination?: string | null;
  officialName?: string;
};

export type DiscoveryMemberContext = {
  roomVisitCounts: Record<string, number>;
  featuresUsed: string[];
  activeSeasonId?: string | null;
  favoriteRoomIds?: string[];
};

/** Member-facing-safe statuses — "ignored" is internal only. */
export type DiscoveryHistoryStatus =
  | "shown"
  | "opened"
  | "saved"
  | "completed"
  | "ignored"
  | "destination_visited";

export type MemberDiscoveryHistoryEntry = {
  userId: string;
  discoveryId: string;
  status: DiscoveryHistoryStatus;
  shownAt?: string;
  openedAt?: string;
  savedAt?: string;
  completedAt?: string;
  ignoredAt?: string;
  destinationVisitedAt?: string;
  roomWhereShown?: string;
  placementLocation?: string;
  destinationRoute?: string;
  updatedAt: string;
};

export type DiscoveryHistoryContext = {
  roomWhereShown?: string;
  placementLocation?: string;
  destinationRoute?: string;
};

export type DiscoveryHistoryStore = {
  list(userId: string): MemberDiscoveryHistoryEntry[];
  get(userId: string, discoveryId: string): MemberDiscoveryHistoryEntry | null;
  upsert(entry: MemberDiscoveryHistoryEntry): void;
};

/** @deprecated event-log shape — migrated to MemberDiscoveryHistoryEntry */
export type DiscoveryInteractionState =
  | "shown"
  | "opened"
  | "completed"
  | "saved-for-later"
  | "ignored"
  | "destination-visited";

/** @deprecated use MemberDiscoveryHistoryEntry */
export type DiscoveryHistoryRecord = {
  discoveryId: string;
  memberId: string;
  state: DiscoveryInteractionState;
  recordedAt: string;
  roomId?: string;
};

export type DiscoveryEngineSelection = {
  discoveryId: string;
  category: DiscoveryCategorySlug;
  title: string;
  subtitle: string | null;
  destinationRoute: string | null;
  destinationSection: AppSection | null;
  image: string | null;
  discoveryText: string;
  whyItMatters: string | null;
  foodForThought: string | null;
  primaryButton: string;
  companionResponse: string | null;
  saveAllowed: boolean;
  relatedRoom: string | null;
  priority: DiscoveryPriority;
};

export type DiscoveryNoteData = {
  discoveryId: string;
  category: DiscoveryCategorySlug;
  title: string;
  subtitle: string | null;
  image: string | null;
  discoveryText: string;
  whyItMatters: string | null;
  foodForThought: string | null;
  primaryButtonLabel: string;
  showPrimaryButton: boolean;
  showSaveForLater: boolean;
};

export type DiscoveryKeySession = {
  discoveryId: string;
  placementRoomId: string;
  selection: DiscoveryEngineSelection;
  placement: RoomPlacementSelection;
};

export type RoomPlacementAnchor = "center" | "bottom-left" | "bottom-right";

export type ApprovedKeyLocation = {
  id: string;
  label: string;
  surfaceType: string;
  status: DiscoveryRegistryStatus;
  description: string | null;
  placementScale: number | null;
  rotationDegrees: number;
  depthLayer: "scene" | "object" | "foreground";
  position: {
    xPercent: number;
    yPercent: number;
    anchor: RoomPlacementAnchor;
  };
  shadow: {
    enabled: boolean;
    opacity: number;
    blurPx: number;
    offsetYPercent: number;
  };
  lightingAdjustment: {
    warmth: number;
    highlight: string;
  };
  safePlacementZone: {
    notes: string;
    avoidOverlapWith: string[];
  };
  priority: number;
  seasonalOnly?: string | null;
};

export type RoomPlacementProfile = {
  roomId: string;
  officialName: string;
  status: DiscoveryRegistryStatus;
  sceneImage: string | null;
  defaultPlacementScale: number;
  approvedLocations: ApprovedKeyLocation[];
  seasonalVariants?: Array<{
    seasonId: string;
    enabledLocationIds: string[];
  }>;
};

export type RoomPlacementSelection = {
  roomId: string;
  locationId: string;
  label: string;
  xPercent: number;
  yPercent: number;
  anchor: RoomPlacementAnchor;
  scale: number;
  rotationDegrees: number;
  shadow: ApprovedKeyLocation["shadow"];
  depthLayer: ApprovedKeyLocation["depthLayer"];
};
