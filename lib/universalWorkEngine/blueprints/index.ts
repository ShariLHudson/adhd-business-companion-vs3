/**
 * Universal Blueprint Framework — public surface (also re-exported from UWE index).
 */

export type {
  BlueprintCategory,
  BlueprintDepthMode,
  BlueprintComplexity,
  BlueprintSectionRole,
  BlueprintCondition,
  BlueprintSectionDef,
  BlueprintGroup,
  BlueprintAdaptiveQuestion,
  BlueprintSuggestedTask,
  BlueprintSuggestedMilestone,
  BlueprintCartographyRecommendation,
  BlueprintDomainExtensions,
  BlueprintDefinition,
  BlueprintProvenance,
  WorkBlueprintState,
  AdaptiveQuestionDecision,
  SaveAsBlueprintReview,
  BuildFromPreviousOptions,
  BlueprintAuditEvent,
} from "./types";
export {
  UnknownBlueprintError,
  IncompatibleBlueprintError,
  ALL_BLUEPRINT_DEPTH_MODES,
  DEPTH_RANK,
} from "./types";

export {
  registerBlueprint,
  getBlueprint,
  requireBlueprint,
  resolveBlueprintVersion,
  listBlueprints,
  listBlueprintVersions,
  isBlueprintRegistered,
  isBlueprintCompatibleWithWorkType,
  clearBlueprintRegistryForTests,
} from "./registry";

export {
  evaluateBlueprintCondition,
  resolveActiveSections,
} from "./conditions";

export {
  recordBlueprintAudit,
  listBlueprintAudit,
  resetBlueprintAuditForTests,
} from "./auditHistory";

export {
  getWorkBlueprintState,
  requireWorkBlueprintState,
  putWorkBlueprintState,
  refreshConditionalSections,
  listWorkBlueprintStates,
  resetWorkBlueprintStateForTests,
} from "./workBlueprintStateStore";

export {
  evaluateAdaptiveQuestion,
  listAdaptiveQuestionDecisions,
  answerBlueprintQuestion,
  skipBlueprintQuestion,
  recoverSkippedQuestion,
  mergeKnownContext,
  questionsForDepthMode,
} from "./adaptiveQuestions";

export {
  assertBlueprintCompatible,
  initializeWorkFromBlueprint,
  changeBlueprintDepthMode,
  upgradeWorkBlueprint,
  approveBlueprintOverwrite,
  adaptBlueprintForContext,
  updateWorkSectionFromBlueprintState,
  workIdsUsingBlueprint,
} from "./initializeFromBlueprint";
export type { InitializeWorkFromBlueprintInput } from "./initializeFromBlueprint";

export {
  sanitizeInstanceSpecificContent,
} from "./sanitizeInstanceSpecific";
export type { SanitizeOptions } from "./sanitizeInstanceSpecific";

export {
  prepareSaveAsBlueprint,
  confirmSaveAsBlueprint,
} from "./saveAsBlueprint";
export type {
  PrepareSaveAsBlueprintInput,
  ConfirmSaveAsBlueprintInput,
} from "./saveAsBlueprint";

export {
  buildWorkFromPreviousWork,
  provenanceForWork,
} from "./buildFromPreviousWork";

export { duplicateBlueprint, inheritBlueprint } from "./inheritance";

export {
  DEFAULT_GROUP_MAP_THRESHOLD,
  shouldUseGroupedMap,
  buildWorkshopMapGroups,
  resolveInitiallyOpenGroupIds,
  flattenSectionsFromGroups,
} from "./mapGrouping";
export type {
  WorkshopMapGroupView,
  WorkshopMapSectionInput,
} from "./mapGrouping";

export { resolveWorkshopMapForWorkflow } from "./resolveWorkshopMap";

export {
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
} from "./structureEditing";

export {
  saveStructureAsBlueprint,
} from "./saveStructureAsBlueprint";
export type { SaveStructureAsBlueprintInput } from "./saveStructureAsBlueprint";

export type {
  BlueprintVisibility,
  BlueprintLifecycleStatus,
  BlueprintHealthFinding,
  BlueprintHealthSnapshot,
  BlueprintUsageSummary,
  BlueprintImpactPreview,
  BlueprintCertificationResult,
  SparkBlueprintHomeModel,
  BlueprintSuggestionDisposition,
} from "./intelligence";
export {
  evaluateBlueprintHealth,
  evaluateBlueprintHealthRaw,
  assertHealthDoesNotMutate,
  registerBlueprintIntelligencePackage,
  getBlueprintIntelligencePackage,
  clearBlueprintIntelligencePackagesForTests,
  resetBlueprintSuggestionDispositionsForTests,
  listBlueprintSuggestionDispositions,
  setBlueprintSuggestionDisposition,
  filterVisibleHealthFindings,
  summarizeBlueprintUsage,
  previewBlueprintImpact,
  formatWhereThisIsUsed,
  certifyBlueprint,
  certifyBlueprintDefinition,
  resetBlueprintProfilesForTests,
  getBlueprintIntelligenceProfile,
  upsertBlueprintIntelligenceProfile,
  buildSparkBlueprintHome,
  publishBlueprintVersion,
} from "./intelligence";
