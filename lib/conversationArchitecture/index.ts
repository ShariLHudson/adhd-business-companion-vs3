/**
 * Packages 210–214 — Conversation Architecture Manifest, Checklist,
 * Governance, and Platform Implementation Roadmap.
 */

export {
  CONVERSATION_OWNERSHIP,
  findDuplicateOwnershipIds,
  getOwner,
  type ConversationOwnershipRecord,
  type ConversationResponsibilityId,
} from "./ownership";

export {
  CONVERSATION_RUNTIME_ORDER,
  CONVERSATION_RUNTIME_ORDER_LABEL,
  type ConversationRuntimeStage,
} from "./runtimeOrder";

export {
  EXPERIENCE_WIRING,
  experiencesFullyWired,
  experiencesBypassingGovernance,
  type ExperienceWiringRecord,
  type ExperienceWiringStatus,
} from "./experienceWiring";

export {
  CONVERSATION_IMPLEMENTATION_CHECKLIST,
  checklistReleaseReady,
  checklistSummary,
  type ChecklistItem,
  type ChecklistStatus,
} from "./checklist";

export {
  CONVERSATION_GOVERNANCE_RULES,
  CONVERSATION_PR_REVIEW_CHECKS,
  getGovernanceSnapshot,
  type ConversationPrReviewCheck,
  type GovernanceSnapshot,
} from "./governance";

export {
  EXPERIENCE_IMPLEMENTATION_TRACKS,
  EXPERIENCE_TRACK_DIMENSIONS,
  PLATFORM_PRIORITIES,
  PLATFORM_ROADMAP_OBJECTIVES,
  getNextPlatformPriority,
  getPlatformRoadmapSnapshot,
  isExperienceProductionReady,
  type ExperienceImplementationTrack,
  type ExperienceTrackDimension,
  type PlatformPriority,
  type PlatformPriorityId,
  type PlatformRoadmapSnapshot,
  type RoadmapTrackStatus,
} from "./platformRoadmap";

export {
  MASTER_FEATURE_CATEGORIES,
  MASTER_FEATURE_REGISTRY,
  assertRegisteredForProduction,
  getMasterFeature,
  getMasterFeatureRegistrySnapshot,
  listFeaturesNotProductionReady,
  listMasterFeaturesByCategory,
  meetsDefinitionOfComplete,
  type CieIntegrationStatus,
  type MasterFeatureCategory,
  type MasterFeatureRecord,
  type MasterFeatureRegistrySnapshot,
  type RegistryStatus,
} from "./masterFeatureRegistry";
