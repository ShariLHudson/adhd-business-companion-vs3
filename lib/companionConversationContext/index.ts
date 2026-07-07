export type {
  CompanionConversationState,
  CompanionLocationContext,
  CompanionPendingAction,
  CompanionPendingActionType,
  CompanionTurnTrace,
  DiscussedEntityKind,
  KnowledgeAnswerType,
  LastDiscussedEntity,
} from "./types";
export {
  COMPANION_CONTEXT_STORAGE_KEY,
  PENDING_ACTION_TURN_LIMIT,
} from "./types";

export {
  clearCompanionConversationState,
  isCompanionConversationContextEnabled,
  isCompanionPendingExpired,
  readCompanionConversationState,
  resetCompanionConversationStateForTests,
  writeCompanionConversationState,
} from "./store";

export { isAffirmativeReply, AFFIRMATIVE_REPLY_RE } from "./isAffirmativeReply";
export { isLocationHereQuery, namedLocationFamilyFromQuery } from "./detectLocationHereQuery";
export {
  formatLocationAreasReply,
  formatLocationHereReply,
  getAreasInFamily,
  locationFamilyPrefix,
  resolveParentLocationId,
} from "./locationAreas";
export {
  detectEmotionalPivot,
  formatEmotionalPivotReply,
  type EmotionalPivotResult,
  type EmotionalPivotSignal,
} from "./detectEmotionalPivot";
export { resolveActiveCompanionPending } from "./companionPending";
export { resolveObjectNavigationTarget } from "./objectNavigation";
export {
  detectCompoundOverwhelmTask,
  formatCompoundOverwhelmTaskReply,
} from "./detectCompoundIntent";
export { buildCompanionTurnTrace, logCompanionTurnTrace } from "./trace";
export {
  resolveCompanionTurn,
  type CompanionTurnInput,
  type CompanionTurnResolution,
} from "./resolveCompanionTurn";
export {
  updateCompanionContextFromDecision,
  updateCompanionContextFromEstateRuntime,
} from "./updateContextFromDecision";
