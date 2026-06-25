export type {
  CompanionAnimationState,
  CompanionPresenceExpression,
  CompanionPresenceInput,
  CompanionPresenceResolved,
  CompanionPresenceResult,
  CompanionSpeechBubbleState,
} from "./types";

export type { ClearMyMindPresencePhase } from "./clearMyMindPresence";

export {
  clearMyMindPresenceIsThinking,
  evaluateClearMyMindPresence,
  resolveClearMyMindPresencePhase,
} from "./clearMyMindPresence";

export { evaluateCompanionPresence } from "./evaluateCompanionPresence";
export { expressionFromShariState } from "./expressionFromState";
export { homeStatePresenceMapping } from "./homeStateToPresence";
export { workspacePresenceMapping } from "./sectionToPhotoContext";
export {
  COMPANION_THINKING_LINES,
  companionThinkingMessage,
} from "./thinkingCopy";
