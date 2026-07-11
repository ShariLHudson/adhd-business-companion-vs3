/**
 * Estate Knowledge Base — shared types.
 * Permanent source of truth for rooms, features, tools, routes, and mappings.
 */

export type EstateKnowledgeStatus =
  | "Live"
  | "Draft"
  | "Future"
  | "Hidden"
  | "Retired";

export type EstateKnowledgeRegistryId =
  | "rooms"
  | "features"
  | "tools"
  | "settings"
  | "routes";

export type EstateKnowledgeItem = {
  id: string;
  officialName: string;
  category: string;
  description: string;
  purpose: string;
  memberBenefits: string[];
  primaryProblemSolved: string | null;
  status: EstateKnowledgeStatus;
  route: string | null;
  image: string | null;
  relatedRooms: string[];
  relatedFeatures: string[];
  relatedTools: string[];
  relatedDiscoveries: string[];
  relatedSparkCards: string[];
  relatedMomentum: string[];
  recommendedWhen: string | null;
  buttonText: string | null;
  keywords: string[];
  tags: string[];
  version: number;
  lastUpdated: string;
};

export type EstateKnowledgeRegistryFile = {
  registry: string;
  version: string;
  description: string;
  statusValues?: EstateKnowledgeStatus[];
  items: EstateKnowledgeItem[];
};

export type DiscoveryMapping = {
  id: string;
  sourceType: "room" | "feature" | "tool";
  sourceId: string;
  status: EstateKnowledgeStatus;
  relatedDiscoveries: string[];
  relatedSparkCards: string[];
  relatedMomentum: string[];
  relatedAudio: string[];
  relatedStories: string[];
  relatedJournalPrompts: string[];
  lastUpdated: string;
};

export type SparkCardMapping = {
  id: string;
  sourceType: "room" | "feature" | "tool" | "discovery";
  sourceId: string;
  status: EstateKnowledgeStatus;
  relatedSparkCards: string[];
  recommendedWhen: string | null;
  lastUpdated: string;
};

export type MomentumActivity = {
  id: string;
  officialName: string;
  status: EstateKnowledgeStatus;
  description: string;
  relatedRooms: string[];
  relatedFeatures: string[];
  relatedDiscoveries: string[];
  recommendedWhen: string | null;
  route: string | null;
  lastUpdated: string;
};

export type MomentumEntityMapping = {
  id: string;
  sourceType: "room" | "feature" | "tool";
  sourceId: string;
  status: EstateKnowledgeStatus;
  relatedMomentum: string[];
  lastUpdated: string;
};

export type ExperienceGroupLocation = {
  placeId: string;
  image: string;
  aliases?: string[];
};

export type ExperienceGroup = {
  id: string;
  experienceGroup: string;
  status: EstateKnowledgeStatus;
  userMayAsk: string[];
  possibleLocations: string[];
  relatedRoomIds: string[];
  keywords: string[];
  lastUpdated: string;
};

export type ExperienceGroupsFile = {
  registry: string;
  version: string;
  description: string;
  locationRegistry?: Record<string, ExperienceGroupLocation>;
  groups: ExperienceGroup[];
};

export type EstateAsset = {
  assetFileName: string;
  assetType: "image" | "video";
  officialDisplayName: string;
  status: EstateKnowledgeStatus;
  description: string;
  locationType: string;
  primaryPlaceId: string;
  sharedByPlaceIds: string[];
  relatedExperienceGroups: string[];
  lastUpdated: string;
};

export type EstateLocation = {
  locationId: string;
  primaryAssetFileName: string;
  officialDisplayName: string;
  canonicalPlaceId: string;
  status: EstateKnowledgeStatus;
  description: string;
  locationType: string;
  memberFacingHint: string;
  relatedExperienceGroups: string[];
  route: string | null;
  lastUpdated: string;
};

export type EstateAlias = {
  phrase: string;
  locationId: string;
  matchType: "nickname" | "experience" | "colloquial" | "approved";
  status: EstateKnowledgeStatus;
};

export type EstateExperienceGroup = {
  id: string;
  experienceGroup: string;
  status: EstateKnowledgeStatus;
  userMayAsk: string[];
  locationIds: string[];
  presentationOrder: string[];
  keywords: string[];
  maxOptions: number;
  lastUpdated: string;
};

export type LocationIntentKind = "direct" | "experience_options" | "unresolved";

export type LocationOption = {
  locationId: string;
  officialDisplayName: string;
  memberFacingHint: string;
  primaryAssetFileName: string;
  route: string | null;
};

export type LocationIntentResolution = {
  kind: LocationIntentKind;
  query: string;
  matchedPhrase?: string;
  directLocation?: LocationOption;
  experienceGroup?: string;
  experienceGroupId?: string;
  options?: LocationOption[];
  memberFacingPrompt?: string;
};

export type EstateVocabulary = {
  registry: string;
  version: string;
  description: string;
  rules: {
    oneOfficialNamePerEntity: boolean;
    aliasesRequireExplicitApproval: boolean;
    canonWinsOnConflict: string;
    liveOnlyForRecommendation: boolean;
  };
  officialNames: {
    rooms: Record<string, string>;
    features: Record<string, string>;
    tools: Record<string, string>;
    settings: Record<string, string>;
    buttons: Record<string, string>;
  };
  approvedAliases: Array<{
    entityType: string;
    entityId: string;
    alias: string;
    notes?: string;
  }>;
  forbiddenSubstitutions: Array<{
    insteadOf: string;
    doNotUse: string[];
  }>;
  lastUpdated: string;
};

/** Legacy discovery engine registry keys */
export type DiscoveryTargetRegistry =
  | "estate-rooms"
  | "estate-features"
  | "estate-tools"
  | "estate-settings"
  | "estate-routes";
