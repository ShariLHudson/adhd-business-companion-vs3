export type {
  CanonicalCurrentFocus,
  CurrentFocusResponseType,
  SubmitCurrentFocusResponseInput,
  SubmitCurrentFocusResponseResult,
} from "./types";

export {
  beginCreationDestinationSession,
  clearCreationDestinationSessionForTests,
  endCreationDestinationSession,
  forbidCompanionSidePanelDuringCreation,
  getActiveCreationDestinationSession,
  isCompanionDormantForCreation,
  isCreationDestinationSessionActive,
  mayShowCompanionChatDuringCreation,
} from "./creationSession";

export {
  applyAnswerToRuntimeCreationRecord,
  clearRuntimeCreationRecordsForTests,
  ensureRuntimeCreationRecord,
  getRuntimeCreationRecord,
  mergeRuntimeRecordIntoWorkflow,
  upsertRuntimeCreationRecord,
  verifyRuntimeRecordDurable,
  wasLastRuntimePersistDurable,
  type RuntimeCreationRecord,
} from "./creationRecord";

export {
  BUILD_DRAFT_TIMEOUT_MS,
  buildCreationDraftFromFocus,
  type BuildCreationDraftResult,
} from "./buildCreationDraft";

export {
  buildCanonicalKnownFacts,
  canonicalFactId,
  knownFactDisplayLines,
  migrateLegacyKnownFacts,
  normalizeFactLabelKey,
  WORKSPACE_SCHEMA_VERSION,
  type CanonicalKnownFact,
} from "./canonicalFacts";

export {
  hydrateExactBuilderSession,
  hydrateExactBuilderSessionFromDurable,
  hydrateExactWorkflowFromPersistence,
  verifyHydratedWorkspaceIdentity,
} from "./exactWorkspacePersist";

export {
  CREATION_DESTINATION_QUESTION_MODE,
  assertCreationDestinationQuestionMode,
  coerceCreationDestinationQuestionMode,
  isLegacySplitScreenQuestionMode,
} from "./questionMode";

export {
  getSoleWorkspaceCurrentFocus,
  resolveCanonicalCurrentFocus,
  resolveFocusForCreationDestination,
} from "./resolveCanonicalFocus";

export {
  ideasGuidanceForFocus,
  submitCurrentFocusResponse,
} from "./submitCurrentFocusResponse";
