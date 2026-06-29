/**
 * Spark Core Intelligence v1.0 — Executive Discipline Orchestrator
 */

import { resolveConflicts } from "./conflicts";
import { runExecutiveDebate } from "./debate";
import { executeDisciplinesParallel } from "./execution";
import {
  buildActivationLog,
  logActivation,
  scoreDisciplinePerformance,
} from "./logging";
import { selectExecutiveDisciplines } from "./selection";
import { synthesizeUnifiedRecommendation } from "./synthesis";
import { rankContributions } from "./weighting";
import type { CoreOrchestratorInput, CoreOrchestratorResult } from "./types";
import { SPARK_CORE_DISCIPLINE_ORCHESTRATOR_VERSION } from "./types";
import { MAX_DISCIPLINES_BY_SCENARIO } from "./disciplines";

export function runExecutiveDisciplineOrchestrator(
  input: CoreOrchestratorInput,
): CoreOrchestratorResult {
  const selection = selectExecutiveDisciplines(input.memberMessage, {
    emotionalState: input.emotionalState,
    businessContextEmerging: input.businessContextEmerging,
  });

  const rawContributions = executeDisciplinesParallel(
    selection.disciplines,
    input.memberMessage,
  );
  const contributions = rankContributions(rawContributions);

  const debateRounds =
    selection.debateRequired && contributions.length >= 2
      ? runExecutiveDebate(contributions)
      : undefined;

  const conflicts = resolveConflicts(contributions);
  const performanceScores = scoreDisciplinePerformance(
    contributions,
    selection.scenario,
  );

  const activationLog = buildActivationLog({
    turnId: input.turnId,
    scenario: selection.scenario,
    activated: selection.disciplines,
    supportModes: selection.supportModes,
    reason: selection.reason,
  });
  logActivation(activationLog);

  const exposeDisciplines = input.exposeDisciplines === true;
  const unified = synthesizeUnifiedRecommendation({
    scenario: selection.scenario,
    contributions,
    conflicts,
    supportModes: selection.supportModes,
    exposeDisciplines,
  });

  return {
    ingress: {
      scenario: selection.scenario,
      selectedDisciplines: selection.disciplines,
      supportModes: selection.supportModes,
      estateSupport: selection.estateSupport,
      maxDisciplines: MAX_DISCIPLINES_BY_SCENARIO[selection.scenario] ?? 4,
      debateRequired: selection.debateRequired,
    },
    internal: {
      contributions,
      debateRounds,
      conflicts,
      performanceScores,
      activationLog,
    },
    egress: {
      unified,
      rawContributions: exposeDisciplines ? contributions : undefined,
    },
    readyToCompose: true,
    engineVersion: SPARK_CORE_DISCIPLINE_ORCHESTRATOR_VERSION,
  };
}

export { selectExecutiveDisciplines, detectScenario } from "./selection";
export { executeDisciplinesParallel } from "./execution";
export { resolveConflicts } from "./conflicts";
export { synthesizeUnifiedRecommendation } from "./synthesis";
export { getActivationLog, clearActivationLog } from "./logging";
export type { CoreOrchestratorInput, CoreOrchestratorResult } from "./types";
