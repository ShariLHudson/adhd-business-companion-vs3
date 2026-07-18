/**
 * Conversational Intelligence (CI) — how Shari expresses a reasoned move.
 * Pair with Reflective Conversation Intelligence (RCI) for what comes next.
 */

export type {
  CiDeliveryInput,
  CiDeliveryResult,
  CiExperienceId,
  CiQualityCert,
  ConversationalGoal,
  CuriosityObjective,
  ExpressionToneBand,
} from "./types";

export { detectConversationalGoal, curiosityObjectiveForKind } from "./goalDetection";
export { selectExpressionToneBand, pacingHint } from "./toneSelection";
export {
  stripLeadingFormulaicOpener,
  varyAgainstRecent,
  openerStem,
} from "./variation";
export { certifyConversationalQuality } from "./qualityCert";
export {
  expressConversationalDraft,
  fallbackExpression,
} from "./expressionEngine";
export { deliverConversationalResponse } from "./api";
