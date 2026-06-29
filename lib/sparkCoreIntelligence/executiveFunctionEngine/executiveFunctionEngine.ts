/**
 * Spark Executive Function Engine™
 * Reduce cognitive load before asking the user to do more cognitive work.
 */

import { scoreCognitiveLoad } from "./cognitiveLoad";
import { reduceDecisionFatigue } from "./decisionFatigue";
import {
  detectExecutiveFunctionState,
  isLargeProjectRequest,
  isOverwhelmMessage,
  isStuckRequest,
} from "./detection";
import {
  bridgeToMemory,
  bridgeToMomentum,
  integrationHintsForWorkspace,
  suggestWorkspaceForEF,
} from "./integrations";
import { simplifyNextStep } from "./nextStep";
import { buildRestartRecovery } from "./restartRecovery";
import { buildResponseGuidance, groundedEncouragement } from "./responses";
import { breakdownLargeTask } from "./taskBreakdown";
import type {
  EFResponsePattern,
  ExecutiveFunctionInput,
  ExecutiveFunctionResult,
  OpenLoop,
} from "./types";
import { SPARK_EXECUTIVE_FUNCTION_ENGINE_VERSION } from "./types";

export function runExecutiveFunction(
  input: ExecutiveFunctionInput,
): ExecutiveFunctionResult {
  const state = detectExecutiveFunctionState(input.memberMessage, {
    emotionalState: input.emotionalState,
    daysSinceLastActivity: input.daysSinceLastActivity,
  });

  const openLoopsRecalled = input.openLoops ?? [];
  const cognitiveLoad = scoreCognitiveLoad({
    state,
    message: input.memberMessage,
    openLoopCount: openLoopsRecalled.length,
    externalLevel: input.externalCognitiveLoad,
  });

  const decisionReduction = reduceDecisionFatigue(input.memberMessage);
  const restartRecovery =
    state.primary === "returning_after_absence" &&
    input.daysSinceLastActivity != null &&
    input.daysSinceLastActivity >= 2
      ? buildRestartRecovery({
          daysSinceLastActivity: input.daysSinceLastActivity,
          lastObjectiveSummary: input.lastObjectiveSummary,
          lastSparkMessage: input.lastSparkMessage,
          openLoops: openLoopsRecalled,
        })
      : undefined;

  const taskBreakdown = isLargeProjectRequest(input.memberMessage)
    ? breakdownLargeTask(input.memberMessage)
    : undefined;

  const nextStep = simplifyNextStep({
    message: input.memberMessage,
    objectiveSummary: input.lastObjectiveSummary ?? taskBreakdown?.projectLabel,
    openLoopLabel: openLoopsRecalled[0]?.label,
    primarySignal: state.primary,
  });

  let pattern: EFResponsePattern = "gentle_encouragement";
  if (isOverwhelmMessage(input.memberMessage) || state.primary === "overwhelm") {
    pattern = "empathy_then_one_step";
  } else if (restartRecovery) {
    pattern = "welcome_back";
  } else if (taskBreakdown) {
    pattern = "phased_project";
  } else if (isStuckRequest(input.memberMessage) || state.primary === "task_paralysis") {
    pattern = "starting_point";
  } else if (decisionReduction || state.primary === "decision_fatigue") {
    pattern = "single_recommendation";
  }

  const encouragement = groundedEncouragement({
    openLoopCount: openLoopsRecalled.length,
    returnedAfterAbsence: state.primary === "returning_after_absence",
  });

  const guidance = buildResponseGuidance({
    state,
    pattern,
    nextStep,
    taskBreakdown,
    restartRecovery,
    singleRecommendation: decisionReduction?.rationale,
    encouragement,
  });

  guidance.decisionReduction = decisionReduction;
  guidance.restartRecovery = restartRecovery;
  guidance.integrationHints = integrationHintsForWorkspace(
    input.activeWorkspace ?? suggestWorkspaceForEF({
      state,
      cognitiveLoad,
      guidance,
      openLoopsRecalled,
      engineVersion: SPARK_EXECUTIVE_FUNCTION_ENGINE_VERSION,
    }),
  );

  return {
    state,
    cognitiveLoad,
    guidance,
    openLoopsRecalled,
    engineVersion: SPARK_EXECUTIVE_FUNCTION_ENGINE_VERSION,
  };
}

export { bridgeToMomentum, bridgeToMemory, enrichConversationTurn } from "./integrations";
export type { MomentumEFBridge, MemoryEFBridge } from "./integrations";
