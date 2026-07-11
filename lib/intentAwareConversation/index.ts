/**
 * Intent-Aware Conversation Framework
 * @see docs/estate/INTENT_AWARE_CONVERSATION_FRAMEWORK.md
 */

export type {
  ConversationDepth,
  ConversationPurpose,
  IntentAwareConversationInput,
  IntentAwareEvaluation,
  IntentAwareSessionStore,
} from "./types";

export { INTENT_AWARE_CONVERSATION_PRINCIPLE } from "./types";

export {
  detectConversationDepth,
  detectConversationPurpose,
  depthAllowsCoaching,
  depthAllowsPersonalQuestions,
  memberChangedPurpose,
} from "./detection";

export {
  appropriateQuestionsFor,
  depthLabel,
  maxQuestionsForDepth,
  purposeLabel,
  TASK_FORBIDDEN_QUESTIONS,
} from "./depthRules";

export {
  clearIntentAwareSession,
  loadIntentAwareSession,
  saveIntentAwareSession,
  updateIntentAwareSession,
} from "./session";

export {
  evaluateIntentAwareConversation,
  intentAwareConversationHintForChat,
  shouldSuppressCoachingForIntentAware,
  shouldSuppressPersonalizationForIntentAware,
} from "./engine";

export {
  CELEBRATION_HIGH_CONFIDENCE_PATTERNS,
  RELATIONSHIP_CONVERSATION_PATTERNS,
  hasHighConfidenceCelebrationIntent,
  isPositiveSentimentWithoutCelebration,
  isRelationshipConversation,
  memberIsAskingToDoSomething,
  routingGateHintForChat,
} from "./routingGate";

export type {
  ImpliedNeedChoice,
  ImpliedNeedEvaluation,
  ImpliedNeedPath,
} from "./impliedNeed";

export {
  evaluateImpliedNeed,
  formatImpliedNeedReply,
  impliedNeedDiagnosticLabel,
  isImpliedNeedOfferMessage,
  resolveImpliedNeedContinuation,
} from "./impliedNeed";

export type { ImpliedNeedSession } from "./impliedNeedSession";

export {
  clearImpliedNeedSession,
  loadImpliedNeedSession,
  saveImpliedNeedSession,
} from "./impliedNeedSession";
