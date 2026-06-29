/**
 * Spark Core Intelligence v1.0 — Trust & Performance Engine
 */

import {
  classifyComplexity,
  classifyIntentFast,
  modulesForComplexity,
  passesGoldenRule,
} from "@/lib/sparkTrustPerformance/fastIntent";
import { runTrustQualityGate } from "@/lib/sparkTrustPerformance/evaluateTrustPerformance";
import { selectDisciplines } from "@/lib/sparkResponseIntelligence/disciplineRouting";

import { cacheSnapshot, resolveDefinition } from "./cache";
import {
  backgroundJobsForLevel,
  disciplinesForLevel,
  latencyBudgetForComplexity,
  streamingPlan,
  warmLoadForRoom,
} from "./delivery";
import {
  buildFallback,
  checkServiceHealth,
  evaluateCoreFour,
  gracefulDegradation,
  slowModuleDetection,
} from "./resilience";
import { createTelemetry, recordTelemetry } from "./telemetry";
import type {
  CoreTrustEgress,
  CoreTrustInput,
  CoreTrustResult,
} from "./types";
import { SPARK_CORE_TRUST_PERFORMANCE_VERSION } from "./types";

export type CoreTrustOptions = {
  draftText?: string;
  serviceLatencies?: Array<{ name: string; latencyMs: number; thresholdMs: number }>;
  moduleTimings?: Array<{ name: string; durationMs: number; budgetMs: number }>;
};

export function runCoreTrustPerformance(
  input: CoreTrustInput,
  options?: CoreTrustOptions,
): CoreTrustResult {
  const ingressStart = performance.now();
  const intentLabel = classifyIntentFast(input.memberMessage);
  const { level: complexityLevel } = classifyComplexity(
    input.memberMessage,
    intentLabel,
  );

  const health = checkServiceHealth(options?.serviceLatencies ?? []);
  const allHealthy = health.every((h) => h.healthy);
  const { degraded, maxLevel } = gracefulDegradation(complexityLevel, allHealthy);
  const effectiveLevel = Math.min(
    complexityLevel,
    maxLevel,
  ) as CoreTrustResult["ingress"]["complexityLevel"];

  const rawModules = modulesForComplexity(intentLabel, effectiveLevel);
  const intentDisciplines = selectDisciplines(
    effectiveLevel === 1 ? "execution" : "business_strategy",
    input.memberMessage,
  );
  let disciplinesActive = disciplinesForLevel(effectiveLevel, intentDisciplines);

  let modulesActive: string[] = [];
  if (rawModules.knowledgeEngine) modulesActive.push("knowledge");
  if (rawModules.cognitiveOrchestration) modulesActive.push("cognitive");
  if (rawModules.fullIntelligence) modulesActive.push("intelligence");
  modulesActive = [...modulesActive, ...disciplinesActive];

  const goldenRulePassed = passesGoldenRule(effectiveLevel, {
    ...rawModules,
    disciplines: disciplinesActive,
  });

  if (!goldenRulePassed) {
    modulesActive = modulesActive.filter(
      (m) => m !== "intelligence" && m !== "observatory",
    );
    disciplinesActive.length = 0;
  }

  const intentDetectionMs = performance.now() - ingressStart;
  const latencyBudget = latencyBudgetForComplexity(effectiveLevel);
  const streaming = streamingPlan(effectiveLevel, intentLabel);
  const backgroundJobs =
    latencyBudget.backgroundAllowed
      ? backgroundJobsForLevel(effectiveLevel, intentLabel)
      : [];

  const cacheHits: string[] = [];
  const cacheMisses: string[] = [];
  if (intentLabel === "definition") {
    const termMatch = input.memberMessage.match(/what is (?:a |an )?(.+)\??$/i);
    const term = termMatch?.[1] ?? input.memberMessage;
    const def = resolveDefinition(input.threadId, term);
    if (def.hit) cacheHits.push("definitions");
    else cacheMisses.push("definitions");
  }

  const slowModules = slowModuleDetection(options?.moduleTimings ?? []);

  const telemetry = createTelemetry(input.turnId, {
    intentDetectionMs,
    cacheHits,
    cacheMisses,
    slowModules,
    totalBudgetMs: latencyBudget.totalResponseMaxMs,
    degraded,
    retried: false,
  });
  recordTelemetry(telemetry);

  const fallback =
    !allHealthy && options?.draftText
      ? buildFallback("A service is temporarily slow", options.draftText)
      : !allHealthy && !options?.draftText
        ? buildFallback("A service is temporarily unavailable")
        : undefined;

  const ingress = {
    intentLabel,
    complexityLevel: effectiveLevel,
    latencyBudget,
    modulesActive,
    disciplinesActive,
    goldenRulePassed,
    cacheSnapshot: cacheSnapshot(input.threadId),
    warmLoadRooms: warmLoadForRoom(input.activeRoom),
  };

  const delivery = {
    streaming,
    backgroundJobs,
    fallback,
    degradedMode: degraded,
    retryCount: 0,
    health,
  };

  let egress: CoreTrustEgress | undefined;

  if (options?.draftText) {
    const gate = runTrustQualityGate({
      draftText: options.draftText,
      memberMessage: input.memberMessage,
      objectiveSummary: input.memberMessage.slice(0, 80),
      complexityLevel: effectiveLevel,
    });

    const coreFour = evaluateCoreFour({
      draftText: options.draftText,
      intentDetectionMs,
      intentBudgetMs: latencyBudget.intentDetectionMaxMs,
      totalBudgetMs: latencyBudget.totalResponseMaxMs,
      elapsedMs: intentDetectionMs,
      goldenRulePassed,
      qualityPass: gate.pass,
    });

    egress = {
      coreFour,
      approved: gate.pass && coreFour.correctness && coreFour.focus,
      revisionHints: gate.revisionHints,
      telemetry,
    };
  }

  void SPARK_CORE_TRUST_PERFORMANCE_VERSION;

  return {
    ingress,
    delivery,
    egress,
    readyToCompose: effectiveLevel === 1 || intentLabel !== "support",
  };
}

export { clearCache } from "./cache";
export { clearTelemetry, getTelemetrySummary } from "./telemetry";
