/**
 * 051 — Universal Creation Engine
 * One engine. Many blueprints. Many workspaces. One coherent experience.
 */

export type {
  UniversalCreationIntent,
  UniversalCreationContext,
  CreationResolution,
  NextBestStep,
  UniversalCreationEngineResult,
  CreationKnownFact,
  CreationReadinessSummary,
} from "./types";

export {
  resolveUniversalCreationIntent,
  type UniversalIntentClassification,
} from "./creationIntentResolver";
export { resolveCreation, wouldDuplicateAsset } from "./creationResolver";
export {
  resolveCreationBlueprint,
  isEventsBlueprint,
} from "./blueprintResolver";
export { resolveCreationWorkspace } from "./workspaceResolver";
export { resolveCreationOwnership } from "./ownershipResolver";
export { assembleUniversalCreationContext } from "./creationContextAssembler";
export {
  selectNextBestStep,
  isForbiddenCreationPrompt,
  assertConversationSafe,
} from "./nextBestStepEngine";
export {
  processUniversalCreationTurn,
  seedKnownFactsFromUserText,
} from "./eventAdapter";
export { coordinateAssetCreation } from "./assetCreationCoordinator";
export {
  coordinateCollaboration,
  synthesizeCollaboratorConflict,
} from "./collaborationCoordinator";
export { syncCreationToProjects } from "./projectSync";
export { syncCreationToCartography } from "./cartographySync";
export { coordinateCreationReadiness } from "./readinessCoordinator";
export { evaluateChangeImpact } from "./changeImpactEngine";
export { resolveResumeState } from "./resumeResolver";
export { planArchiveOrReuse } from "./archiveReuseCoordinator";
export {
  certifyUniversalCreationResult,
  type EngineCertification,
} from "./certification";

/** 054 — Connected editors (Agenda is the reference implementation) */
export {
  openConnectedAssetEditor,
  openAgendaEditor,
  saveConnectedAsset,
  resumeConnectedAssetEditor,
} from "@/lib/connectedAssetEditor";
