/**
 * Conversation Session Spine (public API).
 * Contract: ./SPINE_CONTRACT.md
 */

export type {
  AnsweredQuestion,
  ConversationHistoryEntry,
  ConversationSession,
  ConversationSessionPatch,
  ConversationStage,
  CreationMode,
  JourneyState,
  ResearchState,
  SessionArtifact,
  StudioReadinessLevel,
} from "./types";
export {
  CONVERSATION_SESSION_STORAGE_KEY,
  CONVERSATION_SESSION_UPDATED,
} from "./types";

export {
  applyConversationSessionPatch,
  applyConversationSessionRoomChange,
  clearConversationSession,
  getOrCreateConversationSession,
  isConversationSessionSpineEnabled,
  loadConversationSession,
  mergeConversationSessionPatch,
  resetConversationSessionMemoryForTests,
  saveConversationSession,
} from "./store";

export {
  CONVERSATION_STORE_CLASSIFICATION,
  getOrCreateConversationSpine,
  getConversationSpine,
  getActiveSpineConversationId,
  patchConversationSpine,
  projectionMatchesActiveSpine,
  type ConversationStoreClassification,
} from "./spine";

export {
  appendConversationSpineTurn,
  replaceLastSpineAssistantTurn,
  getSpineTranscriptMessages,
  syncCompanionViewMessagesToSpine,
  assertViewMatchesSpineTranscript,
  assertCertReadsSpineTranscript,
  type SpineTurnAppendInput,
  type SpineTranscriptMessage,
} from "./transcriptAuthority";

export {
  logSpineInvariant,
  markSpineTurnStarted,
  markSpineTurnAuthorityConsumed,
  markSpineTranscriptCommitted,
  assertSpineAssistantEmissionAllowed,
  reportProjectionConversationIdMismatch,
  resetSpineTurnGateForTests,
  getSpineTurnGateForTests,
  type SpineInvariantKind,
} from "./spineInvariants";

export {
  findAnswerForSlot,
  hasDiscoveryBasics,
  isQuestionAnswered,
  mayAskQuestion,
  slotAliases,
} from "./questionGuard";

export { pauseActiveArtifact, resumeArtifact, setActiveArtifact } from "./pauseResume";

export {
  syncUniversalCreationHandoffToSession,
  syncUniversalCreationToSession,
} from "./adapters/universalCreationAdapter";

export {
  itemTypeFromUniversalCreation,
  resolvedArtifactFromSessionContext,
  sessionAwareFollowUpLine,
} from "./adapters/createExperienceAdapter";

// Phase 3 — conversation ownership public API
export * from "./ownership";
