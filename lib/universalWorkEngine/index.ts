/**
 * Universal Work Engine — public API.
 * Work Type packages and experiences import from here only.
 */

import "./packages/eventPlan/registerEventPlanWorkType";
import "./packages/eventPlan/registerEventBlueprints";
import "./packages/marketingPlan/registerMarketingPlanWorkType";
import "./packages/marketingPlan/registerMarketingPlanBlueprints";
import "./packages/businessPlan/registerBusinessPlanWorkType";
import "./packages/businessPlan/registerBusinessPlanBlueprints";

export type {
  CanonicalWorkId,
  WorkIdentityRecord,
  WorkOrigin,
  AnywhereWorkOrigin,
  WorkTypePackage,
  WorkTypeCapabilityFlags,
  WorkTypeMapGroupConfig,
  WorkTask,
  WorkMilestone,
  WorkTaskStatus,
  ResearchRecord,
  ResearchAttachmentTarget,
  ResearchApprovalStatus,
  WorkRelationship,
  WorkRelationshipKind,
  WorkRelationshipSourceEntityType,
  WorkRelationshipTargetType,
} from "./types";
export { UnknownWorkTypeError, ANYWHERE_WORK_ORIGINS } from "./types";

export {
  allocateCanonicalWorkId,
  CANONICAL_WORK_ID_PREFIX,
  LEGACY_WORK_ID_PREFIXES,
  detectLegacyWorkIdKind,
  isCanonicalWorkIdFormat,
} from "./identity/allocateCanonicalWorkId";
export {
  resolveCanonicalWorkId,
  adoptLegacyWorkIdAsCanonical,
  coalesceWorkflowWorkId,
} from "./identity/resolveWorkIdentity";
export {
  getWorkIdentity,
  listWorkIdentities,
  resetWorkIdentityStoreForTests,
} from "./identity/workIdentityStore";

export {
  registerWorkTypePackage,
  getWorkTypePackage,
  requireWorkTypePackage,
  listWorkTypePackages,
  isWorkTypeRegistered,
  clearWorkTypePackageRegistryForTests,
  resolveWorkTypeIdFromMemberLabel,
} from "./registry/universalWorkTypeRegistry";
export {
  workTypePackageToSchema,
  registerSchemaAsWorkTypePackage,
  requireSchemaForWorkTypeId,
} from "./registry/bridgeWorkTypeSchema";

export {
  listWorkTasks,
  listWorkMilestones,
  addWorkTask,
  addWorkMilestone,
  upsertWorkTask,
  upsertWorkMilestone,
  syncEventTasksIntoUniversalWork,
  resetWorkTasksForTests,
} from "./tasks/workTasksApi";

export {
  createResearchRecord,
  getResearchRecord,
  listResearchForWork,
  submitResearchForReview,
  approveResearch,
  rejectResearch,
  applyApprovedResearch,
  resetResearchAttachmentsForTests,
} from "./research/researchAttachment";

export {
  linkWorkRelationship,
  unlinkWorkRelationship,
  listWorkRelationships,
  cartographyRefsForWork,
  resetWorkRelationshipsForTests,
} from "./cartography/workRelationships";

export {
  APPROVED_DURABLE_REPOSITORY,
  APPROVED_DURABLE_TABLE,
  APPROVED_DURABLE_RUNTIME_MODULES,
  FORBIDDEN_DURABLE_CALLER_GLOBS,
} from "./boundaries/durableAccessGuard";

export { ensureEventPlanWorkTypeRegistered } from "./packages/eventPlan/registerEventPlanWorkType";
export { ensureMarketingPlanWorkTypeRegistered } from "./packages/marketingPlan/registerMarketingPlanWorkType";
export { ensureMarketingPlanBlueprintsRegistered } from "./packages/marketingPlan/registerMarketingPlanBlueprints";
export {
  MARKETING_PLAN_BLUEPRINT_IDS,
  MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
  MARKETING_PLAN_BLUEPRINT_DEFINITIONS,
} from "./packages/marketingPlan/marketingPlanBlueprint";
export { MARKETING_PLAN_MAP_GROUPS } from "./packages/marketingPlan/marketingPlanMapGroups";
export { isMarketingPlanCreationRequest } from "./packages/marketingPlan/isMarketingPlanCreationRequest";
export { ensureBusinessPlanWorkTypeRegistered } from "./packages/businessPlan/registerBusinessPlanWorkType";
export { ensureBusinessPlanBlueprintsRegistered } from "./packages/businessPlan/registerBusinessPlanBlueprints";
export {
  BUSINESS_PLAN_BLUEPRINT_IDS,
  CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
  HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
  ETSY_BUSINESS_BLUEPRINT_ID,
  PRODUCT_PHOTOGRAPHY_BUSINESS_BLUEPRINT_ID,
  INVENTORY_PRICING_BUSINESS_BLUEPRINT_ID,
  HOLIDAY_PRODUCT_PLANNER_BUSINESS_BLUEPRINT_ID,
  SPEAKER_BUSINESS_BLUEPRINT_ID,
  COACHING_BUSINESS_BLUEPRINT_ID,
  CONSULTING_BUSINESS_BLUEPRINT_ID,
  SERVICE_BUSINESS_BLUEPRINT_ID,
  AUTHOR_BUSINESS_BLUEPRINT_ID,
  COURSE_CREATOR_BUSINESS_BLUEPRINT_ID,
  MEMBERSHIP_BUSINESS_BLUEPRINT_ID,
  CONTENT_CREATOR_BUSINESS_BLUEPRINT_ID,
  PROFESSIONAL_ORGANIZING_BUSINESS_BLUEPRINT_ID,
  PHYSICAL_SPACE_ORGANIZING_BLUEPRINT_ID,
  DIGITAL_INFORMATION_ORGANIZING_BLUEPRINT_ID,
  OPERATIONAL_PROCEDURAL_ORGANIZING_BLUEPRINT_ID,
  STRATEGIC_MANAGEMENT_ORGANIZING_BLUEPRINT_ID,
  PROFESSIONAL_ORGANIZING_COLLECTION_ID,
  RETAIL_STORE_BUSINESS_BLUEPRINT_ID,
  RETAIL_STORE_MANAGEMENT_BLUEPRINT_ID,
  RETAIL_INVENTORY_PURCHASING_VENDOR_BLUEPRINT_ID,
  RETAIL_MERCHANDISING_PROMOTIONS_CX_BLUEPRINT_ID,
  RETAIL_COLLECTION_ID,
  ECOMMERCE_BUSINESS_BLUEPRINT_ID,
  PRODUCT_BASED_BUSINESS_BLUEPRINT_ID,
  WHOLESALE_BUSINESS_BLUEPRINT_ID,
  SUBSCRIPTION_COMMERCE_BUSINESS_BLUEPRINT_ID,
  PRODUCT_COMMERCE_COLLECTION_ID,
  HOSPITALITY_BUSINESS_BLUEPRINT_ID,
  RESTAURANT_BUSINESS_BLUEPRINT_ID,
  TRAVEL_TOURISM_BUSINESS_BLUEPRINT_ID,
  VENUE_EXPERIENCE_BUSINESS_BLUEPRINT_ID,
  HOSPITALITY_TRAVEL_COLLECTION_ID,
  CONTRACTOR_CONSTRUCTION_BUSINESS_BLUEPRINT_ID,
  HOME_SERVICE_BUSINESS_BLUEPRINT_ID,
  PROPERTY_MANAGEMENT_BUSINESS_BLUEPRINT_ID,
  MOBILE_FIELD_SERVICE_OPERATIONS_BLUEPRINT_ID,
  FIELD_HOME_PROPERTY_COLLECTION_ID,
  WELLNESS_PRACTICE_BUSINESS_BLUEPRINT_ID,
  BEAUTY_PERSONAL_CARE_BUSINESS_BLUEPRINT_ID,
  FITNESS_STUDIO_COACHING_BUSINESS_BLUEPRINT_ID,
  PET_SERVICE_BUSINESS_BLUEPRINT_ID,
  WELLNESS_PERSONAL_CARE_PET_COLLECTION_ID,
  BUSINESS_PLAN_BLUEPRINT_DEFINITIONS,
  BUSINESS_BLUEPRINT_CRAFT_SHOW,
  BUSINESS_BLUEPRINT_HANDMADE_ONLINE_STORE,
  BUSINESS_BLUEPRINT_ETSY,
  BUSINESS_BLUEPRINT_PRODUCT_PHOTOGRAPHY,
  BUSINESS_BLUEPRINT_INVENTORY_PRICING,
  BUSINESS_BLUEPRINT_HOLIDAY_PRODUCT_PLANNER,
  BUSINESS_BLUEPRINT_SPEAKER,
  BUSINESS_BLUEPRINT_COACHING,
  BUSINESS_BLUEPRINT_CONSULTING,
  BUSINESS_BLUEPRINT_SERVICE,
  BUSINESS_BLUEPRINT_AUTHOR,
  BUSINESS_BLUEPRINT_COURSE_CREATOR,
  BUSINESS_BLUEPRINT_MEMBERSHIP,
  BUSINESS_BLUEPRINT_CONTENT_CREATOR,
  BUSINESS_BLUEPRINT_PROFESSIONAL_ORGANIZING,
  BUSINESS_BLUEPRINT_PHYSICAL_SPACE_ORGANIZING,
  BUSINESS_BLUEPRINT_DIGITAL_INFORMATION_ORGANIZING,
  BUSINESS_BLUEPRINT_OPERATIONAL_PROCEDURAL_ORGANIZING,
  BUSINESS_BLUEPRINT_STRATEGIC_MANAGEMENT_ORGANIZING,
  BUSINESS_BLUEPRINT_RETAIL_STORE,
  BUSINESS_BLUEPRINT_RETAIL_STORE_MANAGEMENT,
  BUSINESS_BLUEPRINT_RETAIL_INVENTORY_PURCHASING_VENDOR,
  BUSINESS_BLUEPRINT_RETAIL_MERCHANDISING_PROMOTIONS_CX,
  BUSINESS_BLUEPRINT_ECOMMERCE,
  BUSINESS_BLUEPRINT_PRODUCT_BASED,
  BUSINESS_BLUEPRINT_WHOLESALE,
  BUSINESS_BLUEPRINT_SUBSCRIPTION_COMMERCE,
  BUSINESS_BLUEPRINT_HOSPITALITY,
  BUSINESS_BLUEPRINT_RESTAURANT,
  BUSINESS_BLUEPRINT_TRAVEL_TOURISM,
  BUSINESS_BLUEPRINT_VENUE_EXPERIENCE,
  BUSINESS_BLUEPRINT_CONTRACTOR_CONSTRUCTION,
  BUSINESS_BLUEPRINT_HOME_SERVICE,
  BUSINESS_BLUEPRINT_PROPERTY_MANAGEMENT,
  BUSINESS_BLUEPRINT_MOBILE_FIELD_SERVICE,
  BUSINESS_BLUEPRINT_WELLNESS_PRACTICE,
  BUSINESS_BLUEPRINT_BEAUTY_PERSONAL_CARE,
  BUSINESS_BLUEPRINT_FITNESS_STUDIO_COACHING,
  BUSINESS_BLUEPRINT_PET_SERVICE,
} from "./packages/businessPlan/businessBlueprintDefinitions";
export { BUSINESS_PLAN_MAP_GROUPS } from "./packages/businessPlan/businessPlanMapGroups";
export { isBusinessPlanCreationRequest } from "./packages/businessPlan/isBusinessPlanCreationRequest";

export type {
  WorkSection,
  WorkSectionStatus,
  AssembledWorkOutput,
  AssembleWorkValidation,
} from "./sectionRuntime/types";
export {
  listOrderedWorkSections,
  resolveActiveSectionId,
  getActiveWorkSection,
  selectWorkSection,
  updateWorkSectionContent,
  completeWorkSection,
  reopenWorkSection,
  resolveWorkIdFromWorkflow,
  completeItNow,
  createUniversalSectionRuntime,
} from "./sectionRuntime/universalSectionRuntime";
export {
  assembleWorkFromWorkflow,
  validateWorkForAssembly,
  applyAssembledOutputToWorkflow,
  markAssembledOutputStale,
} from "./sectionRuntime/assembleWork";

/** Universal Blueprint Framework */
export type {
  BlueprintCategory,
  BlueprintDepthMode,
  BlueprintComplexity,
  BlueprintDefinition,
  BlueprintSectionDef,
  BlueprintGroup,
  BlueprintAdaptiveQuestion,
  WorkBlueprintState,
  AdaptiveQuestionDecision,
  SaveAsBlueprintReview,
  BuildFromPreviousOptions,
  BlueprintAuditEvent,
  BlueprintProvenance,
  WorkshopMapGroupView,
  SaveStructureAsBlueprintInput,
} from "./blueprints";
export {
  UnknownBlueprintError,
  IncompatibleBlueprintError,
  ALL_BLUEPRINT_DEPTH_MODES,
  DEFAULT_GROUP_MAP_THRESHOLD,
  registerBlueprint,
  getBlueprint,
  requireBlueprint,
  resolveBlueprintVersion,
  listBlueprints,
  listBlueprintVersions,
  isBlueprintRegistered,
  isBlueprintCompatibleWithWorkType,
  clearBlueprintRegistryForTests,
  evaluateBlueprintCondition,
  resolveActiveSections,
  recordBlueprintAudit,
  listBlueprintAudit,
  resetBlueprintAuditForTests,
  getWorkBlueprintState,
  requireWorkBlueprintState,
  listWorkBlueprintStates,
  resetWorkBlueprintStateForTests,
  evaluateAdaptiveQuestion,
  listAdaptiveQuestionDecisions,
  answerBlueprintQuestion,
  skipBlueprintQuestion,
  recoverSkippedQuestion,
  mergeKnownContext,
  questionsForDepthMode,
  assertBlueprintCompatible,
  initializeWorkFromBlueprint,
  changeBlueprintDepthMode,
  upgradeWorkBlueprint,
  approveBlueprintOverwrite,
  adaptBlueprintForContext,
  updateWorkSectionFromBlueprintState,
  sanitizeInstanceSpecificContent,
  prepareSaveAsBlueprint,
  confirmSaveAsBlueprint,
  buildWorkFromPreviousWork,
  provenanceForWork,
  duplicateBlueprint,
  inheritBlueprint,
  shouldUseGroupedMap,
  buildWorkshopMapGroups,
  resolveInitiallyOpenGroupIds,
  resolveWorkshopMapForWorkflow,
  addBlueprintSection,
  renameBlueprintSection,
  duplicateBlueprintSection,
  softDeleteBlueprintSection,
  restoreBlueprintSection,
  setBlueprintSectionRole,
  moveBlueprintSection,
  moveBlueprintSectionToGroup,
  addBlueprintGroup,
  renameBlueprintGroup,
  deleteBlueprintGroup,
  moveBlueprintGroup,
  undoBlueprintStructure,
  previewBlueprintStructureUpdate,
  listStructureUndo,
  resetStructureUndoForTests,
  saveStructureAsBlueprint,
  evaluateBlueprintHealth,
  assertHealthDoesNotMutate,
  setBlueprintSuggestionDisposition,
  resetBlueprintSuggestionDispositionsForTests,
  summarizeBlueprintUsage,
  previewBlueprintImpact,
  formatWhereThisIsUsed,
  certifyBlueprint,
  resetBlueprintProfilesForTests,
  upsertBlueprintIntelligenceProfile,
  buildSparkBlueprintHome,
  publishBlueprintVersion,
  clearBlueprintIntelligencePackagesForTests,
  certifyBlueprintCreateability,
  buildBlueprintCreateabilityAudit,
  resolveCreateabilityManifest,
  seedCreateabilityManifestFromDeliverables,
  validateCreateabilityManifest,
  BLUEPRINT_CREATEABILITY_STANDARD_ID,
  BLUEPRINT_CREATEABILITY_CERTIFICATION_ID,
} from "./blueprints";
export type {
  BlueprintHealthSnapshot,
  BlueprintUsageSummary,
  BlueprintImpactPreview,
  BlueprintCertificationResult,
  SparkBlueprintHomeModel,
  BlueprintCreateabilityManifest,
  BlueprintCreateabilityCertification,
  BlueprintCreateabilityAuditBundle,
} from "./blueprints";
export { ensureEventBlueprintsRegistered } from "./packages/eventPlan/registerEventBlueprints";
export {
  EVENT_PLAN_BLUEPRINT_IDS,
  NETWORKING_EVENT_BLUEPRINT_ID,
  EVENT_BLUEPRINT_NETWORKING_EVENT,
  WORKSHOP_EVENT_BLUEPRINT_ID,
  EVENT_BLUEPRINT_WORKSHOP,
  WEBINAR_EVENT_BLUEPRINT_ID,
  EVENT_BLUEPRINT_WEBINAR,
  RETREAT_EVENT_BLUEPRINT_ID,
  EVENT_BLUEPRINT_RETREAT,
  CONFERENCE_EVENT_BLUEPRINT_ID,
  EVENT_BLUEPRINT_CONFERENCE,
  SUMMIT_EVENT_BLUEPRINT_ID,
  EVENT_BLUEPRINT_SUMMIT,
  PRODUCT_LAUNCH_EVENT_BLUEPRINT_ID,
  EVENT_BLUEPRINT_PRODUCT_LAUNCH,
  BOOK_LAUNCH_EVENT_BLUEPRINT_ID,
  EVENT_BLUEPRINT_BOOK_LAUNCH,
  CHALLENGE_EVENT_BLUEPRINT_ID,
  EVENT_BLUEPRINT_CHALLENGE,
  MASTERCLASS_EVENT_BLUEPRINT_ID,
  EVENT_BLUEPRINT_MASTERCLASS,
  FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
  EVENT_BLUEPRINT_FUNDRAISER_GALA,
} from "./packages/eventPlan/eventBlueprintDefinitions";
export { EVENT_PLAN_MAP_GROUPS } from "./packages/eventPlan/eventPlanMapGroups";
export { ensureEventBlueprintIntelligenceRegistered } from "./packages/eventPlan/eventBlueprintIntelligence";

/** Work lifecycle — archive / restore (same Work ID) */
export {
  archiveWork,
  restoreWork,
  getWorkLifecycleStatus,
  listArchivedWorkIds,
  resetWorkArchiveForTests,
  assertNoOrphanArchivedWorks,
} from "./lifecycle/workArchive";
export type { WorkLifecycleStatus } from "./lifecycle/workArchive";

/** 103 — Anywhere-Origin Universal Work Routing */
export type {
  ShariWorkMode,
  UniversalLaunchRequestedMode,
  UniversalLaunchContract,
  AnywhereOriginDecision,
  DuplicateRiskAssessment,
  AnywhereOriginResolution,
  OriginLaunchHints,
  AnywhereNlExample,
} from "./launch";
export {
  resolveAnywhereOriginWork,
  inferWorkTypeAndBlueprint,
  mapLegacyCreateBlueprintToUwe,
  findRelatedWork,
  assessDuplicateRisk,
  launchFromOrigin,
  launchFromCreate,
  launchFromProjects,
  launchFromStrategies,
  launchFromBlueprints,
  launchFromCartography,
  launchFromBodyDoubling,
  launchFromShari,
  launchFromChamber,
  launchFromBoard,
  launchFromResearch,
  launchFromClearMyMind,
  launchFromTasks,
  launchFromWelcomeHome,
  launchFromTemplates,
  REQUIRED_ANYWHERE_ORIGINS,
  ANYWHERE_ORIGIN_NL_EXAMPLES,
  resolveNlExample,
  resolvePlatformIntentViaAnywhereOrigin,
} from "./launch";
