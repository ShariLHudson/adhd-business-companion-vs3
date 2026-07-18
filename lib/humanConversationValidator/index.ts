/**
 * Package 209 — Human Conversation Validator & Regeneration Standard.
 * Required response-quality gate before user-visible delivery.
 */

export type {
  HumanConversationFailureCode,
  HumanConversationValidationResult,
  HcvMessage,
  HcvValidateInput,
  ValidationFinding,
} from "./types";

export {
  BLOCKED_PHRASE_REGISTRY,
  BLOCKED_PHRASE_REGISTRY_VERSION,
  matchBlockedPhrases,
  type BlockedPhraseEntry,
  type BlockedPhraseSeverity,
} from "./blockedPhraseRegistry";

export {
  validateHumanConversation,
  HCV_CRITICAL_FAILURES,
} from "./validate";

export {
  regenerateHumanConversationDraft,
  buildSafeHumanConversationFallback,
  enforceHumanConversationGate,
} from "./regenerate";

export {
  recordHcvTelemetry,
  getHcvTelemetryBuffer,
  resetHcvTelemetryForTests,
  summarizeHcvTelemetry,
  type HcvTelemetryEvent,
} from "./telemetry";
