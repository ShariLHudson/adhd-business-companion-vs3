/**
 * 103 — Anywhere-Origin Universal Work Routing (public launch surface).
 */

export type {
  ShariWorkMode,
  UniversalLaunchRequestedMode,
  UniversalLaunchContract,
  AnywhereOriginDecision,
  DuplicateRiskSignal,
  DuplicateRiskAssessment,
  AnywhereOriginAttachedRelationship,
  AnywhereOriginResolution,
  ResolveAnywhereOriginOptions,
} from "./types";

export { resolveAnywhereOriginWork } from "./resolveAnywhereOriginWork";
export {
  inferWorkTypeAndBlueprint,
  mapLegacyCreateBlueprintToUwe,
  listCompatibleBlueprintIds,
} from "./inferWorkTypeAndBlueprint";
export { findRelatedWork } from "./findRelatedWork";
export type { RelatedWorkHit } from "./findRelatedWork";
export { assessDuplicateRisk } from "./duplicateRisk";
export { replyForDecision } from "./memberFacingCopy";
export {
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
} from "./originAdapters";
export type { OriginLaunchHints } from "./originAdapters";
export {
  ANYWHERE_ORIGIN_NL_EXAMPLES,
  resolveNlExample,
} from "./naturalLanguageExamples";
export type { AnywhereNlExample } from "./naturalLanguageExamples";
export { resolvePlatformIntentViaAnywhereOrigin } from "./bridgePlatformIntent";
