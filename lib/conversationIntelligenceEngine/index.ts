/**
 * Conversation Intelligence Engine (CIE) — packages 195–199.
 * Shared orchestration across Talk It Out, Create, Chamber, Board, and Shari.
 */

export type {
  CieExperienceId,
  CieFailureCode,
  CieMessage,
  CieTurnInput,
  CieTurnResult,
  ClarificationState,
  ConversationMode,
  ConversationPhase,
  ConversationPlan,
  ConversationRuntimeState,
  CurrentFocus,
  GroundedFact,
  PriorityEvent,
  QualityEvent,
  RejectedInterpretation,
  RetrievedExampleReference,
  UserCorrection,
  ValidationResult,
} from "./types";

export {
  emptyConversationRuntimeState,
  inferPhase,
  runtimeStateFromThinkingMap,
  updateRuntimeStateForUserTurn,
  validateRuntimeState,
} from "./state";

export {
  detectPriorityEvent,
  selectConversationalMove,
  selectPrimaryMode,
} from "./priorityAndMode";

export { buildConversationPlan } from "./planning";
export {
  buildGoldGuidanceBlock,
  retrieveGoldStandardExamples,
  toRetrievedExampleReferences,
} from "./retrieval";
export { validateConversationResponse } from "./validation";
export { repairConversationResponse } from "./repair";
export { isVerbatimGoldCopy } from "./antiCopy";
export {
  getCieTelemetryBuffer,
  recordCieTelemetry,
  resetCieTelemetryForTests,
} from "./telemetry";
export {
  processConversationTurn,
  type CieGenerateContext,
  type ProcessConversationTurnInput,
} from "./processTurn";

/** Package 209 — re-export Human Conversation Validator for experience wiring */
export {
  enforceHumanConversationGate,
  validateHumanConversation,
} from "@/lib/humanConversationValidator";
