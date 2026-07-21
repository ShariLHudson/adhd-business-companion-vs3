/**
 * Universal Work Engine — public API.
 * Work Type packages and experiences import from here only.
 */

import "./packages/eventPlan/registerEventPlanWorkType";
import "./packages/eventPlan/registerEventBlueprints";
import "./packages/marketingPlan/registerMarketingPlanWorkType";
import "./packages/marketingPlan/registerMarketingPlanBlueprints";

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
} from "./blueprints";
export type {
  BlueprintHealthSnapshot,
  BlueprintUsageSummary,
  BlueprintImpactPreview,
  BlueprintCertificationResult,
  SparkBlueprintHomeModel,
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
