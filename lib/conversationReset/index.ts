export {
  resetActiveConversation,
  messagesForFreshAiRequest,
  type ResetActiveConversationInput,
  type ResetActiveConversationMode,
  type ResetActiveConversationResult,
} from "./resetActiveConversation";

export {
  CONTEXTUAL_HELP_SESSION_STORAGE_KEY,
  beginContextualHelpSession,
  endContextualHelpSession,
  recoverContextualHelpSessionAfterRefresh,
  isContextualHelpSessionActive,
  getContextualHelpSession,
  contextualHelpMemoryHintForChat,
  resetContextualHelpSessionForTests,
  type ContextualHelpPlaceContext,
  type ContextualHelpSession,
  type BeginContextualHelpSessionResult,
  type EndContextualHelpSessionResult,
} from "./contextualHelpSession";
