/**
 * Spark Core Intelligence v1.0 — Reasoning Engine
 */

import { decideAskVsAnswer, inferBestNextStep } from "./askVsAnswer";
import {
  analyzeTradeoffs,
  buildDisciplinePositions,
  identifyRisks,
  rankRecommendations,
  resolveDisciplineConflicts,
  weightEvidence,
} from "./disciplineReasoning";
import { analyzePreReasoning } from "./preReasoning";
import type { ReasoningInput, ReasoningPlan, ReasoningResult } from "./types";
import { SPARK_REASONING_ENGINE_VERSION } from "./types";

export function processReasoning(input: ReasoningInput): ReasoningResult {
  const pre = analyzePreReasoning(input);

  const disciplinePositions = buildDisciplinePositions(
    pre.disciplines,
    input.memberMessage,
    pre.mode,
  );
  const conflictResolved = resolveDisciplineConflicts(disciplinePositions);
  const rankedRecommendations = rankRecommendations(
    disciplinePositions,
    pre.mode,
    conflictResolved,
  );
  const tradeoffs = analyzeTradeoffs(input.memberMessage, pre.mode);
  const risks = identifyRisks(pre.mode, input.memberMessage);

  const { decision: askVsAnswer, question: clarificationQuestion } = decideAskVsAnswer(
    pre.missing,
    pre.confidence,
    pre.mode,
  );

  const evidenceWeight = weightEvidence(pre.known);
  const confidenceNote =
    pre.confidenceNote ??
    (evidenceWeight < 0.5 ? "Limited grounded evidence" : undefined);

  const plan: ReasoningPlan = {
    turnId: input.turnId,
    mode: pre.mode,
    userAccomplishing: pre.accomplishing,
    successLooksLike: pre.success,
    known: pre.known,
    missing: pre.missing,
    problemNature: pre.nature,
    researchRequired: pre.research.required,
    researchReason: pre.research.reason,
    disciplines: pre.disciplines,
    disciplinePositions,
    conflictResolved,
    confidence: pre.confidence,
    confidenceNote,
    bestNextStep: inferBestNextStep(pre.mode, askVsAnswer, pre.success),
    askVsAnswer,
    clarificationQuestion,
    assumptions: pre.assumptions,
    rankedRecommendations,
    tradeoffs,
    risks,
    overthinkGuard: pre.overthinkGuard,
    engineVersion: SPARK_REASONING_ENGINE_VERSION,
  };

  const readyToCompose = askVsAnswer !== "ask";

  return { plan, readyToCompose };
}

export type { ReasoningInput, ReasoningPlan, ReasoningResult, ReasoningMode } from "./types";
export { SPARK_REASONING_ENGINE_VERSION } from "./types";
