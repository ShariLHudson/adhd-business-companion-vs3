/**
 * Conversation Quality & Rhythm Intelligence (CQRI) — package 186.
 */

export type {
  ConversationPhase,
  CqriExperienceId,
  CqriInput,
  CqriLengthCategory,
  CqriMessage,
  CqriQualityFailure,
  CqriQualityResult,
  CqriResponseShape,
  CqriResult,
  CqriTelemetry,
} from "./types";

export { runConversationQualityAndRhythm } from "./api";
export {
  detectConversationPhase,
  phasePreferredShapes,
} from "./conversationPhase";
export { selectResponseShape } from "./rhythmSelector";
export { selectLengthCategory, applyLengthBudget } from "./lengthSelector";
export {
  shouldSuppressQuestion,
  lastAssistantAskedQuestion,
} from "./questionFrequency";
export {
  preferObservationOverQuestion,
  stripTrailingQuestion,
} from "./observationVsQuestion";
export {
  shouldOfferCompletionCheck,
  pickCompletionCheck,
} from "./completionRhythm";
export { runQualityGate } from "./qualityGate";
export { buildSafeFallback, isBannedFallbackPhrase } from "./safeFallback";
export {
  recordCqriTelemetry,
  getCqriTelemetryBuffer,
  resetCqriTelemetryForTests,
} from "./telemetry";
