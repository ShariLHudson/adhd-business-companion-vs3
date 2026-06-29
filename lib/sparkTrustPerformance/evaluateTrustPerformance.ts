/**
 * Spark Trust & Performance Engine™
 * Highest-priority Spark OS wrapper — ingress + egress quality gate.
 */

import { runCognitiveOrchestration } from "@/lib/sparkCognitiveOrchestration";
import type { CognitiveOrchestrationInput } from "@/lib/sparkCognitiveOrchestration";

import {
  classifyComplexity,
  classifyIntentFast,
  modulesForComplexity,
  passesGoldenRule,
  performanceBudgetForLevel,
} from "./fastIntent";
import type {
  TrustPerformanceEgressResult,
  TrustPerformanceIngress,
  TrustPerformanceIngressResult,
  TrustPerformanceResult,
  TrustQualityGateInput,
  TrustQualityGateResult,
} from "./types";
import { SPARK_TRUST_PERFORMANCE_VERSION } from "./types";

export function runTrustIngress(
  input: TrustPerformanceIngress,
): TrustPerformanceIngressResult {
  const start = performance.now();
  const intentLabel = classifyIntentFast(input.memberMessage);
  const { level: complexityLevel, class: complexityClass } = classifyComplexity(
    input.memberMessage,
    intentLabel,
  );
  let modules = modulesForComplexity(intentLabel, complexityLevel);

  if (!passesGoldenRule(complexityLevel, modules)) {
    modules = {
      ...modules,
      fullIntelligence: false,
      observatory: false,
      disciplines: modules.disciplines.slice(0, complexityLevel === 1 ? 0 : 2),
    };
  }

  const intentDetectionMs = performance.now() - start;

  return {
    intentLabel,
    complexityLevel,
    complexityClass,
    modules,
    performanceBudget: performanceBudgetForLevel(complexityLevel),
    intentDetectionMs,
    goldenRulePassed: passesGoldenRule(complexityLevel, modules),
    engineVersion: SPARK_TRUST_PERFORMANCE_VERSION,
  };
}

const SOFTWARE_VOICE =
  /\b(error|failed|invalid|required|you must|as an ai language model)\b/i;

export function runTrustQualityGate(
  input: TrustQualityGateInput,
): TrustQualityGateResult {
  const text = input.draftText.trim();
  const revisionHints: string[] = [];

  const answeredCorrectQuestion =
    text.length > 0 && !SOFTWARE_VOICE.test(text);

  if (!answeredCorrectQuestion) {
    revisionHints.push("Answer the member's question in natural Spark voice");
  }

  const remainedOnObjective =
    input.complexityLevel === 1 ||
    !/\b(by the way|also consider|upgrade|automation platform)\b/i.test(text);

  if (!remainedOnObjective) {
    revisionHints.push("Remove tangents and unrelated feature mentions");
  }

  const canBeShorter = text.length > 500 && input.complexityLevel <= 2;
  if (canBeShorter) {
    revisionHints.push("Shorter response would improve speed and focus");
  }

  const canBeClearer =
    (text.match(/\b(however|additionally|furthermore)\b/gi) ?? []).length > 2;
  if (canBeClearer) {
    revisionHints.push("Simplify structure for clarity");
  }

  const canBeFaster = text.length > 800 && input.complexityLevel <= 2;
  if (canBeFaster) {
    revisionHints.push("Trim for faster read");
  }

  const wouldTrustAsMember =
    !SOFTWARE_VOICE.test(text) &&
    !/\b(guarantee|definitely will|100%)\b/i.test(text) &&
    (input.complexityLevel < 4 || /\b(might|could|consider|verify)\b/i.test(text));

  if (!wouldTrustAsMember) {
    revisionHints.push("Add honesty — avoid false certainty");
  }

  const pass =
    answeredCorrectQuestion &&
    remainedOnObjective &&
    !canBeShorter &&
    !canBeClearer &&
    wouldTrustAsMember;

  return {
    answeredCorrectQuestion,
    remainedOnObjective,
    canBeShorter,
    canBeClearer,
    canBeFaster,
    wouldTrustAsMember,
    pass,
    revisionHints,
  };
}

export function runTrustEgress(
  ingress: TrustPerformanceIngressResult,
  gateInput: Omit<TrustQualityGateInput, "complexityLevel">,
): TrustPerformanceEgressResult {
  const gate = runTrustQualityGate({
    ...gateInput,
    complexityLevel: ingress.complexityLevel,
  });

  return {
    approved: gate.pass,
    gate,
    finalText: gateInput.draftText,
  };
}

/**
 * Full Spark OS entry: ingress → optional cognitive orchestration hint → optional egress.
 */
export function runTrustPerformance(
  input: TrustPerformanceIngress,
  draft?: { text: string },
): TrustPerformanceResult {
  const ingress = runTrustIngress(input);

  if (!draft) {
    return { phase: "ingress", ingress };
  }

  const cognitive = runCognitiveOrchestration({
    turnId: input.turnId,
    threadId: input.threadId,
    memberMessage: input.memberMessage,
  });

  const objectiveSummary =
    cognitive.kind === "clarification" || cognitive.kind === "ready"
      ? cognitive.plan.step1_desiredOutcome
      : cognitive.plan.step1_desiredOutcome;

  const egress = runTrustEgress(ingress, {
    draftText: draft.text,
    memberMessage: input.memberMessage,
    objectiveSummary,
  });

  return { phase: "egress", ingress, egress };
}

export type { CognitiveOrchestrationInput };
