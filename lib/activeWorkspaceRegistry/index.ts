export type {
  ActiveWorkspaceDraftState,
  ActiveWorkspaceEntry,
  ActiveWorkspaceResumeResult,
  ActiveWorkspaceStatus,
} from "./types";

export {
  archiveActiveWorkspace,
  clearActiveWorkspaceRegistryForTests,
  getActiveWorkspace,
  getMostRecentActiveWorkspace,
  hydrateActiveWorkspaceRegistryFromRuntimeRecords,
  listActiveWorkspaces,
  listRecoverableWorkspaces,
  moveActiveWorkspaceToTrash,
  peekRegistryWorkspaceEntry,
  permanentlyDeleteActiveWorkspace,
  readLastActiveWorkspaceId,
  removeActiveWorkspaceFromContinue,
  removeActiveWorkspaceFromContinueDurable,
  restoreActiveWorkspace,
  restoreActiveWorkspaceDurable,
  setLastActiveWorkspaceId,
  registerCreationDestinationWorkspace,
  renameActiveWorkspaceTitle,
  renameActiveWorkspaceTitleDurable,
  syncRegistryFromRuntimeRecord,
  touchActiveWorkspace,
  upsertActiveWorkspace,
  verifyCreationWorkspaceDurable,
  wasLastRegistryPersistDurable,
} from "./registry";

export {
  canonicalStatusFromEntry,
  canonicalStatusFromWorkflow,
  resolveCanonicalWorkspaceStatus,
  type CanonicalStatusInput,
  type CanonicalWorkspaceStatus,
} from "./canonicalStatus";

export {
  ACTIVE_WORKSPACE_RESUME_RE,
  buildActiveWorkspaceClarifyGuidance,
  buildActiveWorkspaceResumeGuidance,
  findActiveWorkspaceByHumanTitle,
  isActiveWorkspaceResumeRequest,
  matchActiveWorkspaceResume,
  matchActiveWorkspaceResumeDetailed,
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
