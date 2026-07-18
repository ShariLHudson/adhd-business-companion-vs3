/**
 * Topic Continuity & Conversation Anchor Intelligence (TCAI) — package 193.
 */

export type {
  TcaiContinuityResult,
  TcaiFailureCode,
  TcaiMessage,
  TopicAnchor,
  TopicConfidence,
  TopicType,
} from "./types";

export { isClarificationRequest } from "./clarificationDetection";
export {
  buildTopicChangeClarifyQuestion,
  detectsExplicitTopicChange,
} from "./topicChangeDetection";
export {
  extractConversationGoal,
  extractCurrentFocus,
  extractPrimaryTopic,
  inferTopicType,
  isIllegalTopicLabel,
  isShortFocusReply,
  isShortNonTopicReply,
} from "./topicExtraction";
export { isPronounAsTopic, isStopWordTopic, TOPIC_STOP_WORDS } from "./topicLexicon";
export {
  emptyTopicAnchor,
  hasActiveTopicAnchor,
  recoverTopicFromHistory,
  topicAnchorFromLiteral,
  updateTopicAnchor,
} from "./topicAnchor";
export {
  buildTopicSafeClarificationRepair,
  buildUnconfirmedTopicChangePrompt,
} from "./topicSafeRepair";
export {
  applyTopicContinuityValidation,
  certifyTopicContinuity,
} from "./continuityGate";
