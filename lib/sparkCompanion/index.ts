/**
 * Spark Companion V4 — public facade.
 * Single Decision Engine path for hints, prompts, and runtime actions.
 */

export { evaluateSparkDecisionEngine } from "./sparkDecisionEngine/evaluateDecisionEngine";
export { buildSparkCompanionHint } from "./buildSparkCompanionHint";
export { mapDecisionToRuntimeAction } from "./mapDecisionToRuntimeAction";
export {
  getSparkCompanionPromptBlock,
  SPARK_COMPANION_CONSOLIDATED_PROMPT_BLOCK,
} from "./getSparkCompanionPromptBlock";
export {
  measureCompanionPromptLoad,
  logCompanionPromptLoad,
} from "./measureCompanionPromptLoad";

export {
  mapStyleRoleToCanonicalRole,
  mapDynamicRoleToCanonicalRole,
  mapRightHelpToCanonicalRole,
  canonicalRoleLabel,
  canonicalRoleInstruction,
} from "./canonicalRole";

export {
  mapSparkIntentToPrimaryType,
  primaryTurnFromDecisionEngine,
  reconcilePrimaryTurnWithDecisionEngine,
} from "./intentAdapter";

export type {
  SparkCanonicalRole,
  SparkRuntimeMode,
  SparkConversationDepth,
  SparkCompanionSessionContext,
  SparkCompanionHintInput,
  SparkRuntimeAction,
  MapDecisionToRuntimeActionInput,
  SparkCompanionPromptMetrics,
} from "./types";

export type {
  SparkDecisionEngineDecision,
  SparkDecisionEngineInput,
  SparkPrimaryIntent,
} from "./sparkDecisionEngine/types";
