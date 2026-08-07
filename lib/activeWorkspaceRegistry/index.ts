export type {
  ActiveWorkspaceDraftState,
  ActiveWorkspaceEntry,
  ActiveWorkspaceResumeResult,
  ActiveWorkspaceStatus,
} from "./types";

/** Light Continueread/archive APIs — safe for Project Homes. */
export {
  archiveActiveWorkspace,
  clearActiveWorkspaceRegistryForTests,
  getActiveWorkspace,
  getMostRecentActiveWorkspace,
  listActiveWorkspaces,
  listRecoverableWorkspaces,
  moveActiveWorkspaceToTrash,
  peekRegistryWorkspaceEntry,
  readLastActiveWorkspaceId,
  removeActiveWorkspaceFromContinue,
  restoreActiveWorkspace,
  setLastActiveWorkspaceId,
  touchActiveWorkspace,
  upsertActiveWorkspace,
  wasLastRegistryPersistDurable,
} from "./registryCore";

/** Durable variants live in registryDurable (not registryCore). */
export {
  removeActiveWorkspaceFromContinueDurable,
  restoreActiveWorkspaceDurable,
} from "./registryDurable";

/** Create-heavy APIs — pull creationRecord / Event hydrate. */
export {
  hydrateActiveWorkspaceRegistryFromRuntimeRecords,
  permanentlyDeleteActiveWorkspace,
  registerCreationDestinationWorkspace,
  renameActiveWorkspaceTitle,
  renameActiveWorkspaceTitleDurable,
  syncRegistryFromRuntimeRecord,
  verifyCreationWorkspaceDurable,
} from "./registry";

export {
  canonicalStatusFromEntry,
  canonicalStatusFromWorkflow,
  resolveCanonicalWorkspaceStatus,
  type CanonicalStatusInput,
  type CanonicalWorkspaceStatus,
} from "./canonicalStatus";

export {
  buildActiveWorkspaceClarifyGuidance,
  buildActiveWorkspaceResumeGuidance,
  findActiveWorkspaceByHumanTitle,
  isActiveWorkspaceResumeRequest,
  matchActiveWorkspaceResume,
  matchActiveWorkspaceResumeDetailed,
  referencesCreationType,
  resetTypeReferenceCacheForTests,
  type ActiveWorkspaceMatchResult,
} from "./matchResumeIntent";

export {
  buildWorkspaceIdentityCard,
  extractTitleFromDraftContent,
  formatLastWorkedLabel,
  generateTemporaryTitleFromRequest,
  isBareCreationTypeTitle,
  isTechnicalWorkspaceTitle,
  isUsableHumanTitle,
  memberStatusLabel,
  resolveHumanReadableTitle,
  safeUntitledLabel,
  sanitizeMemberFacingTitle,
  type HumanReadableTitleSources,
  type WorkspaceIdentityCard,
} from "./humanReadableIdentity";

export {
  getContinueProjection,
  getMostRecentContinueWorkspace,
  listActiveContinueProjection,
  listArchivedContinueProjection,
  listRecentContinueProjection,
  listResumableContinueProjection,
  listTrashedContinueProjection,
  type ContinueProjectionKind,
} from "./projections";

/** Persist trace leaf — safe for Continue / Project Homes. */
export {
  getWorkspacePersistTraces,
  traceWorkspacePersist,
  type WorkspacePersistPhase,
  type WorkspacePersistTraceEntry,
} from "./workspacePersistTrace";

/**
 * Heavy dump/explain stays off the barrel so Project Homes never loads
 * diagnostics → creationRecord → circular init on Vercel/Turbopack.
 * Import from `@/lib/activeWorkspaceRegistry/workspacePersistenceDiagnostics`.
 */
