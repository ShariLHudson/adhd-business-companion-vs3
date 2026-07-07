export type {
  CurriculumDiscoveryRank,
  CurriculumItemRef,
  CurriculumRefType,
  DiscoveryCollection,
  DiscoveryCollectionsDoc,
  DiscoveryPrerequisite,
  DiscoveryPrerequisitesDoc,
  ProgressiveDiscoveryCurriculum,
  PrerequisiteEngagement,
  PrerequisiteRequirement,
} from "./types";

export {
  collectionIdsForAudience,
  curriculumOrderIndexForDiscovery,
  discoveryCollectionForDiscoveryId,
  getCollectionIdsForJourneyStage,
  getCurriculumRules,
  getDiscoveryCollectionById,
  getDiscoveryCollections,
  getDiscoveryPrerequisites,
  getLiveDiscoveryCollections,
  getPrerequisitesForTarget,
  getProgressiveDiscoveryCurriculum,
  maxCurriculumDiscoveriesPerResponse,
} from "./curriculumConfig";

export {
  arePrerequisitesMet,
  isDiscoveryEligibleByCurriculum,
  isTargetEligibleByPrerequisites,
  unmetPrerequisiteReasons,
} from "./prerequisiteEngine";

export {
  filterDiscoveriesByCurriculumPrerequisites,
  rankDiscoveryForCurriculum,
  sortDiscoveriesByCurriculum,
} from "./curriculumSelector";
