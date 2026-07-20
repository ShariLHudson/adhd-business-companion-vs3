/**
 * 055 — Universal Creation Entrypoint
 * Users begin anywhere. Spark Estate finds one Creation Workspace.
 */

export type {
  CreationEntrySource,
  EntrypointConfidence,
  EntrypointAction,
  ExistingWorkMatch,
  UniversalCreationEntrypointResult,
  ResolveEntrypointInput,
} from "./types";

export { assessEntrypointConfidence } from "./entryConfidence";
export {
  searchExistingCreationWork,
  detectAssetEntryHint,
} from "./existingWorkSearch";
export { resolveUniversalCreationEntrypoint } from "./resolveUniversalCreationEntrypoint";
export {
  FORCE_NEW_CREATION_ACKNOWLEDGMENT,
  FORCE_NEW_CREATION_RE,
  containsResumeClaimCopy,
  forceNewCreationAcknowledgment,
  isForceNewCreationRequest,
} from "./forceNewIntent";

export {
  CREATION_ENTRY_SOURCES,
  enterCreationFromShari,
  enterCreationFromCreate,
  enterCreationFromProjects,
  enterCreationFromChamber,
  enterCreationFromBoard,
  enterCreationFromCartography,
  enterCreationFromDashboard,
  enterCreationFromHome,
  enterCreationFromSearch,
  enterCreationFromConversation,
  enterCreationFromNotification,
  enterCreationFromRecommendation,
} from "./enterFromSource";
