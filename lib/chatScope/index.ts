export type {
  ChatIntentPriorityStep,
  ChatRequestIdentity,
  ChatScopeKind,
  ChatScopeRecord,
  DaySession,
} from "./types";
export { CHAT_INTENT_PRIORITY } from "./types";

export {
  bindDaySessionConversation,
  getDaySession,
  startNewDaySession,
  __resetDaySessionForTests,
} from "./daySession";

export {
  activateNewDayChatScope,
  getActiveChatScope,
  setActiveChatScope,
  suspendActiveChatScope,
  __resetActiveChatScopeForTests,
} from "./activeScope";

export {
  createChatRequestIdentity,
  shouldAcceptAssistantResponse,
  type StaleResponseCheckInput,
  type StaleResponseCheckResult,
} from "./staleResponseGuard";

export {
  directNavigationTransitionLine,
  isDirectNavigationPriorityTurn,
} from "./directNavigationPriority";
