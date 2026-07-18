/**
 * Reflective Conversation Intelligence (RCI) — platform layer.
 * First consumer: Talk It Out. Future: Journal, Decision Compass, debriefs.
 */

export type {
  RciCandidateQuestion,
  RciConversationArchetype,
  RciExperienceId,
  RciMessage,
  RciResponseKind,
  RciTurnInput,
  RciTurnResult,
  ThinkingMap,
} from "./types";
export { RCI_COMPLETION_CHECK } from "./types";

export { classifyConversationArchetype } from "./archetype";
export {
  emptyThinkingMap,
  markQuestionExplored,
  updateThinkingMap,
} from "./thinkingMap";
export {
  alreadyAnswered,
  filterCandidateQuestions,
  passesQuestionQualityFilter,
} from "./questionQuality";
export {
  buildClarification,
  buildConnection,
  buildGentleObservation,
  buildInviteContinue,
  buildSummary,
  buildTentativePattern,
} from "./reflection";
export { selectReflectiveResponse } from "./responseSelection";
export {
  countQuestions,
  ensureSingleQuestion,
  isTooCloseToUser,
  longestSharedPhraseWords,
  sanitizeAgainstUser,
  significantTokens,
  userTokenOverlapRatio,
  usesAvoidedDefaultScript,
} from "./repetitionGuard";
export { runReflectiveTurn } from "./api";
