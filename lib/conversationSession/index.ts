/**
 * Pass 2 — Conversation Session Spine (public API).
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
