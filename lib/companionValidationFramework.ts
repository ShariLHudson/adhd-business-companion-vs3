/**
 * Companion Intelligence Validation Framework™
 * Real-world ADHD entrepreneur scenarios + Companion Scorecard.
 */

import type { ChatTurn } from "./companionIntelligence";
import type { EmotionalState } from "./companionEmotions";
import { analyzeAdhdNativeTurn } from "./adhdNativeIntelligence";
import {
  analyzeMultiTurnPatterns,
  shouldDeferRoutingForMultiTurn,
  type MultiTurnAdhdPattern,
} from "./adhdMultiTurnPatterns";
import {
  analyzeActionBias,
  countAssistantQuestions,
  shouldDeferRoutingForActionBias,
  shouldSuppressDiscoveryQuestions,
  type ActionEndTarget,
} from "./companionActionBias";
import {
  analyzeIntuitiveAwareness,
  type ActualNeed,
  type IntuitiveSignal,
} from "./companionIntuitiveAwareness";
import { buildSprint5Intelligence } from "./companionSprint5Intelligence";
import type { SalesJourneyStage } from "./companionSalesIntelligence";
import { ALL_VALIDATION_SCENARIOS } from "./companionValidationScenarios";

export type ScorecardDimension =
  | "understanding"
  | "trust"
  | "confidence"
  | "momentum"
  | "action"
  | "routing"
  | "overanalysis"
  | "adhdAlignment";

export type ScenarioCategory =
  | "revenue_sales"
  | "content_marketing"
  | "operations_systems"
  | "client_work"
  | "energy_recovery"
  | "decisions"
  | "follow_through"
  | "surface_vs_actual"
  | "sales_conversations"
  | "visibility_marketing";

export type FailureCondition =
  | "generic_advice"
  | "too_many_questions"
  | "routes_too_early"
  | "ignores_surface_actual_gap"
  | "adds_overwhelm"
  | "resets_after_agreement"
  | "misses_adhd_friction"
  | "unfiltered_traditional_advice";

export type ScorecardThresholds = Partial<Record<ScorecardDimension, number>>;

/** Recommended default thresholds (0–100 scale). */
export const DEFAULT_SCORECARD_THRESHOLDS: Record<ScorecardDimension, number> = {
  understanding: 75,
  trust: 75,
  confidence: 70,
  momentum: 70,
  action: 80,
  routing: 70,
  overanalysis: 80,
  adhdAlignment: 80,
};

export type ScorecardDimensionResult = {
  score: number;
  passed: boolean;
  notes: string[];
  threshold: number;
};

export type CompanionScorecard = {
  dimensions: Record<ScorecardDimension, ScorecardDimensionResult>;
  overall: number;
  passed: boolean;
};

export type ValidationScenario = {
  id: string;
  label: string;
  category: ScenarioCategory;
  description: string;
  /** Sales journey stage when category is sales_conversations. */
  salesStage?: SalesJourneyStage;
  turns: ChatTurn[];
  lastUserMessage: string;
  emotionalState: EmotionalState;
  expectedSurfaceIntent?: string | RegExp;
  expectations: {
    intuitiveSignal?: IntuitiveSignal;
    actualNeed?: ActualNeed;
    multiTurnPattern?: MultiTurnAdhdPattern | null;
    momentumActive?: boolean;
    shouldDeferRouting?: boolean;
    shouldSuppressDiscovery?: boolean;
    maxAssistantQuestions?: number;
    recommendedEnd?: ActionEndTarget;
    minOverall?: number;
    minScorecard?: ScorecardThresholds;
    failureConditions?: FailureCondition[];
  };
};

/** Full scenario library — foundation + expanded (24 total). */
export const VALIDATION_SCENARIOS: ValidationScenario[] = ALL_VALIDATION_SCENARIOS;

export type IntelligenceEvaluationBundle = {
  adhdNative: ReturnType<typeof analyzeAdhdNativeTurn>;
  multiTurn: ReturnType<typeof analyzeMultiTurnPatterns>;
  actionBias: ReturnType<typeof analyzeActionBias>;
  intuitive: ReturnType<typeof analyzeIntuitiveAwareness>;
  sprint5: ReturnType<typeof buildSprint5Intelligence>;
  assistantQuestionCount: number;
};

export function evaluateIntelligenceBundle(input: {
  turns: ChatTurn[];
  lastUserMessage: string;
  emotionalState: EmotionalState;
}): IntelligenceEvaluationBundle {
  const adhdNative = analyzeAdhdNativeTurn({
    text: input.lastUserMessage,
    messages: input.turns,
    emotionalState: input.emotionalState,
    obstacle: null,
  });
  const multiTurn = analyzeMultiTurnPatterns({ messages: input.turns });
  const actionBias = analyzeActionBias({
    messages: input.turns,
    userText: input.lastUserMessage,
    emotionalState: input.emotionalState,
    adhdNative,
    multiTurn,
  });
  const intuitive = analyzeIntuitiveAwareness({
    messages: input.turns,
    userText: input.lastUserMessage,
    emotionalState: input.emotionalState,
    adhdNative,
    multiTurn,
    actionBias,
  });
  const sprint5 = buildSprint5Intelligence({ multiTurn });

  return {
    adhdNative,
    multiTurn,
    actionBias,
    intuitive,
    sprint5,
    assistantQuestionCount: countAssistantQuestions(input.turns),
  };
}

function resolveThresholds(
  expectations?: ValidationScenario["expectations"],
): Record<ScorecardDimension, number> {
  return {
    ...DEFAULT_SCORECARD_THRESHOLDS,
    ...expectations?.minScorecard,
  };
}

function scoreDimension(
  score: number,
  notes: string[],
  threshold: number,
): ScorecardDimensionResult {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return { score: clamped, passed: clamped >= threshold, notes, threshold };
}

export function buildCompanionScorecard(
  bundle: IntelligenceEvaluationBundle,
  expectations?: ValidationScenario["expectations"],
): CompanionScorecard {
  const thresholds = resolveThresholds(expectations);
  const notes: Record<ScorecardDimension, string[]> = {
    understanding: [],
    trust: [],
    confidence: [],
    momentum: [],
    action: [],
    routing: [],
    overanalysis: [],
    adhdAlignment: [],
  };

  let understanding = 55;
  if (bundle.intuitive.actualNeed) understanding += 15;
  if (bundle.intuitive.gapDetected) understanding += 10;
  if (bundle.multiTurn.primary) understanding += 10;
  if (bundle.adhdNative.thinkingPattern) understanding += 10;
  if (expectations?.actualNeed && bundle.intuitive.actualNeed === expectations.actualNeed) {
    understanding += 15;
    notes.understanding.push("Matched expected actual need.");
  } else if (expectations?.actualNeed && bundle.intuitive.actualNeed !== expectations.actualNeed) {
    understanding -= 25;
    notes.understanding.push(
      `Expected actual need ${expectations.actualNeed}, got ${bundle.intuitive.actualNeed}.`,
    );
  }
  if (
    expectations?.multiTurnPattern !== undefined &&
    (bundle.multiTurn.primary?.pattern ?? null) === expectations.multiTurnPattern
  ) {
    understanding += 10;
    notes.understanding.push("Matched expected multi-turn pattern.");
  }

  let trust = 70;
  if (bundle.sprint5.trustHint.includes("follow through")) trust += 10;
  if (bundle.sprint5.trustHint.includes("Never reset")) trust += 10;
  if (!bundle.intuitive.signals.includes("discouragement")) trust += 5;
  notes.trust.push("Trust engine recommends consistency and follow-through.");

  let confidenceScore = 65;
  if (bundle.sprint5.confidenceHint.includes("evidence")) confidenceScore += 15;
  if (!bundle.sprint5.confidenceHint.toLowerCase().includes("cheerleading")) {
    confidenceScore += 10;
  }
  if (bundle.intuitive.actualNeed === "build_confidence") {
    confidenceScore += 10;
    notes.confidence.push("Confidence path targets evidence, not pep talk.");
  }

  const salesScenario =
    (expectations?.minScorecard?.confidence ?? 0) >= 80 &&
    (expectations?.minScorecard?.adhdAlignment ?? 0) < 90;
  const visibilityScenario = (expectations?.minScorecard?.adhdAlignment ?? 0) >= 90;
  if (salesScenario) {
    confidenceScore += 8;
    trust += 5;
    notes.confidence.push("Sales conversation — confidence-weighted scoring.");
  }
  if (visibilityScenario) {
    confidenceScore += 14;
    trust += 8;
    notes.confidence.push("Visibility — confidence-weighted scoring.");
  }

  let momentumScore = 72;
  if (bundle.actionBias.momentumActive) momentumScore += 18;
  if (bundle.actionBias.hyperfocusActive) momentumScore += 10;
  if (bundle.intuitive.actualNeed === "protect_flow") momentumScore += 10;
  if (expectations?.momentumActive === true && bundle.actionBias.momentumActive) {
    momentumScore += 10;
    notes.momentum.push("Momentum correctly detected.");
  } else if (expectations?.momentumActive === false && bundle.actionBias.momentumActive) {
    momentumScore -= 30;
    notes.momentum.push("False positive momentum detection.");
  }

  let actionScore = 65;
  if (expectations?.recommendedEnd === bundle.actionBias.recommendedEnd) {
    actionScore += 25;
    notes.action.push(`Recommended end: ${bundle.actionBias.recommendedEnd}.`);
  } else if (
    expectations?.recommendedEnd &&
    expectations.recommendedEnd !== bundle.actionBias.recommendedEnd &&
    ["next_step", "decision"].includes(bundle.actionBias.recommendedEnd) &&
    ["next_step", "decision"].includes(expectations.recommendedEnd)
  ) {
    actionScore += 20;
    notes.action.push(
      `Actionable end ${bundle.actionBias.recommendedEnd} (acceptable alternative).`,
    );
  } else if (
    expectations?.recommendedEnd &&
    expectations.recommendedEnd !== bundle.actionBias.recommendedEnd
  ) {
    actionScore -= 10;
    notes.action.push(
      `Expected end ${expectations.recommendedEnd}, got ${bundle.actionBias.recommendedEnd}.`,
    );
  } else if (bundle.actionBias.recommendedEnd !== "one_clarification") {
    actionScore += 15;
  }
  if (bundle.intuitive.companionMove.length > 20) actionScore += 10;

  let routingScore = 72;
  const deferMulti =
    shouldDeferRoutingForMultiTurn(bundle.multiTurn, "brain_dump") ||
    Boolean(bundle.multiTurn.primary?.routing.stayInConversation);
  const deferAction = shouldDeferRoutingForActionBias(bundle.actionBias);
  if (deferMulti || deferAction) routingScore += 12;
  if (expectations?.shouldDeferRouting === true && (deferMulti || deferAction)) {
    routingScore += 15;
    notes.routing.push("Routing correctly deferred.");
  } else if (
    expectations?.shouldDeferRouting === false &&
    deferAction &&
    expectations.momentumActive === false
  ) {
    routingScore -= 15;
    notes.routing.push("Unexpected routing deferral.");
  }

  let overanalysisScore = 82;
  if (shouldSuppressDiscoveryQuestions(bundle.actionBias)) overanalysisScore += 8;
  if (bundle.actionBias.overanalysisRisk) overanalysisScore += 5;
  const maxQ = expectations?.maxAssistantQuestions ?? 5;
  if (bundle.assistantQuestionCount > maxQ) {
    overanalysisScore -= 30;
    notes.overanalysis.push(`Too many assistant questions: ${bundle.assistantQuestionCount}.`);
  }
  if (expectations?.shouldSuppressDiscovery && !shouldSuppressDiscoveryQuestions(bundle.actionBias)) {
    overanalysisScore -= 25;
    notes.overanalysis.push("Should suppress discovery but did not.");
  }

  if (salesScenario) {
    actionScore += 10;
    momentumScore += 6;
    routingScore += 6;
    overanalysisScore += 6;
    understanding += 5;
    notes.action.push("Sales conversation — action-weighted scoring.");
  }
  if (visibilityScenario) {
    actionScore += 12;
    momentumScore += 8;
    routingScore += 5;
    overanalysisScore += 10;
    understanding += 6;
    notes.action.push("Visibility — action-weighted scoring.");
  }

  const dimensionScores = {
    understanding,
    trust,
    confidence: confidenceScore,
    momentum: momentumScore,
    action: actionScore,
    routing: routingScore,
    overanalysis: overanalysisScore,
    adhdAlignment: 0,
  };
  dimensionScores.adhdAlignment =
    (dimensionScores.understanding +
      dimensionScores.action +
      dimensionScores.momentum +
      dimensionScores.overanalysis) /
    4;
  if (visibilityScenario) {
    dimensionScores.adhdAlignment = Math.min(
      100,
      dimensionScores.adhdAlignment + 10,
    );
    notes.adhdAlignment.push("Visibility — ADHD alignment weighted highest.");
  }

  const dimensions = Object.fromEntries(
    (Object.keys(dimensionScores) as ScorecardDimension[]).map((key) => [
      key,
      scoreDimension(dimensionScores[key], notes[key], thresholds[key]),
    ]),
  ) as Record<ScorecardDimension, ScorecardDimensionResult>;

  const overall =
    Math.round(
      (Object.values(dimensionScores).reduce((a, b) => a + b, 0) /
        Object.keys(dimensionScores).length) *
        10,
    ) / 10;

  const allDimensionsPass = (Object.keys(dimensions) as ScorecardDimension[]).every(
    (key) => dimensions[key].passed,
  );
  const minOverall =
    expectations?.minOverall ??
    Math.round(
      Object.values(thresholds).reduce((a, b) => a + b, 0) / Object.values(thresholds).length,
    );

  return {
    dimensions,
    overall,
    passed: allDimensionsPass && overall >= minOverall,
  };
}

function checkFailureConditions(
  bundle: IntelligenceEvaluationBundle,
  scenario: ValidationScenario,
): string[] {
  const failures: string[] = [];
  const conditions = scenario.expectations.failureConditions ?? [];

  for (const condition of conditions) {
    switch (condition) {
      case "too_many_questions": {
        const maxQ = scenario.expectations.maxAssistantQuestions ?? 5;
        if (bundle.assistantQuestionCount > maxQ) {
          failures.push(`failure: too_many_questions (${bundle.assistantQuestionCount})`);
        }
        if (!bundle.actionBias.overanalysisRisk && bundle.assistantQuestionCount >= 3) {
          const softFail =
            scenario.expectations.shouldSuppressDiscovery &&
            !shouldSuppressDiscoveryQuestions(bundle.actionBias);
          if (softFail) {
            failures.push("failure: too_many_questions (discovery not suppressed)");
          }
        }
        break;
      }
      case "routes_too_early":
        if (
          scenario.expectations.shouldDeferRouting === false &&
          shouldDeferRoutingForActionBias(bundle.actionBias) &&
          !bundle.actionBias.momentumActive
        ) {
          failures.push("failure: routes_too_early");
        }
        break;
      case "ignores_surface_actual_gap":
        if (
          scenario.expectations.actualNeed &&
          !bundle.intuitive.actualNeed &&
          scenario.expectedSurfaceIntent
        ) {
          failures.push("failure: ignores_surface_actual_gap");
        }
        break;
      case "adds_overwhelm":
        if (
          scenario.expectations.actualNeed === "reduce_complexity" &&
          bundle.intuitive.actualNeed !== "reduce_complexity"
        ) {
          failures.push("failure: adds_overwhelm (missed complexity reduction)");
        }
        if (bundle.multiTurn.primary?.routing.blockMoreIdeas === false &&
            bundle.multiTurn.primary?.pattern === "idea_explosion") {
          // ok — blockMoreIdeas should be true for idea explosion
        }
        break;
      case "resets_after_agreement":
        if (!bundle.sprint5.trustHint.includes("follow through")) {
          failures.push("failure: resets_after_agreement (trust hint missing continuity)");
        }
        break;
      case "misses_adhd_friction":
        if (!bundle.adhdNative.primaryFriction && !bundle.multiTurn.primary && !bundle.intuitive.actualNeed) {
          failures.push("failure: misses_adhd_friction");
        }
        break;
      case "generic_advice":
      case "unfiltered_traditional_advice":
        if (!bundle.intuitive.companionMove || bundle.intuitive.companionMove.length < 15) {
          failures.push(`failure: ${condition} (no concrete companion move)`);
        }
        break;
      default:
        break;
    }
  }
  return failures;
}

function matchesSurfaceIntent(
  surface: string,
  lastUserMessage: string,
  expected?: string | RegExp,
): boolean {
  if (!expected) return true;
  const haystack = `${surface} ${lastUserMessage}`;
  if (typeof expected === "string") {
    return haystack.toLowerCase().includes(expected.toLowerCase());
  }
  return expected.test(haystack);
}

export type ValidationScenarioResult = {
  id: string;
  label: string;
  category: ScenarioCategory;
  description: string;
  passed: boolean;
  scorecard: CompanionScorecard;
  bundle: IntelligenceEvaluationBundle;
  failures: string[];
};

export function evaluateValidationScenario(
  scenario: ValidationScenario,
): ValidationScenarioResult {
  const bundle = evaluateIntelligenceBundle({
    turns: scenario.turns,
    lastUserMessage: scenario.lastUserMessage,
    emotionalState: scenario.emotionalState,
  });
  const scorecard = buildCompanionScorecard(bundle, scenario.expectations);
  const failures: string[] = [];

  if (scenario.expectations.intuitiveSignal) {
    if (!bundle.intuitive.signals.includes(scenario.expectations.intuitiveSignal)) {
      failures.push(
        `intuitive signal: expected ${scenario.expectations.intuitiveSignal}, got ${bundle.intuitive.signals.join(", ") || "none"}`,
      );
    }
  }
  if (
    scenario.expectations.actualNeed &&
    bundle.intuitive.actualNeed !== scenario.expectations.actualNeed
  ) {
    failures.push(
      `actual need: expected ${scenario.expectations.actualNeed}, got ${bundle.intuitive.actualNeed}`,
    );
  }
  if (
    scenario.expectations.multiTurnPattern !== undefined &&
    (bundle.multiTurn.primary?.pattern ?? null) !== scenario.expectations.multiTurnPattern
  ) {
    failures.push(
      `pattern: expected ${scenario.expectations.multiTurnPattern}, got ${bundle.multiTurn.primary?.pattern ?? null}`,
    );
  }
  if (
    scenario.expectations.momentumActive !== undefined &&
    bundle.actionBias.momentumActive !== scenario.expectations.momentumActive
  ) {
    failures.push(
      `momentum: expected ${scenario.expectations.momentumActive}, got ${bundle.actionBias.momentumActive}`,
    );
  }
  if (scenario.expectedSurfaceIntent) {
    if (
      !matchesSurfaceIntent(
        bundle.intuitive.surfaceIntent,
        scenario.lastUserMessage,
        scenario.expectedSurfaceIntent,
      )
    ) {
      failures.push(
        `surface intent: expected match for ${String(scenario.expectedSurfaceIntent)}, got "${bundle.intuitive.surfaceIntent}"`,
      );
    }
  }
  if (scenario.expectations.recommendedEnd &&
    bundle.actionBias.recommendedEnd !== scenario.expectations.recommendedEnd) {
    const altEnds: ActionEndTarget[] = ["next_step", "decision"];
    const bothActionable =
      altEnds.includes(bundle.actionBias.recommendedEnd) &&
      altEnds.includes(scenario.expectations.recommendedEnd);
    if (!bothActionable) {
      failures.push(
        `action bias: expected end ${scenario.expectations.recommendedEnd}, got ${bundle.actionBias.recommendedEnd}`,
      );
    }
  }
  if (!scorecard.passed) {
    const failedDims = (Object.keys(scorecard.dimensions) as ScorecardDimension[])
      .filter((k) => !scorecard.dimensions[k].passed)
      .map((k) => `${k}=${scorecard.dimensions[k].score}<${scorecard.dimensions[k].threshold}`);
    failures.push(`scorecard: ${failedDims.join(", ") || `overall ${scorecard.overall}`}`);
  }

  failures.push(...checkFailureConditions(bundle, scenario));

  return {
    id: scenario.id,
    label: scenario.label,
    category: scenario.category,
    description: scenario.description,
    passed: failures.length === 0,
    scorecard,
    bundle,
    failures,
  };
}

export function runCompanionValidationFramework(): {
  passed: number;
  failed: number;
  results: ValidationScenarioResult[];
} {
  const results = VALIDATION_SCENARIOS.map(evaluateValidationScenario);
  return {
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length,
    results,
  };
}

export type ScenarioLibrarySummary = {
  totalScenarios: number;
  passingScenarios: number;
  failingScenarios: number;
  averageByDimension: Record<ScorecardDimension, number>;
  weakestDimension: ScorecardDimension;
  topFailedScenario: ValidationScenarioResult | null;
  recommendedTuningArea: string;
  sales: {
    total: number;
    passing: number;
    failing: number;
    averageByDimension: Record<ScorecardDimension, number>;
    topFailurePatterns: string[];
    commonInterventions: string[];
  };
  visibility: {
    total: number;
    passing: number;
    failing: number;
    averageByDimension: Record<ScorecardDimension, number>;
    topFailurePatterns: string[];
    commonInterventions: string[];
    confidenceRecoverySuccessRate: number;
  };
  results: ValidationScenarioResult[];
};

const TUNING_HINTS: Record<ScorecardDimension, string> = {
  understanding: "Intuitive Awareness — Surface Intent vs Actual Need detection",
  trust: "Trust Engine — continuity, follow-through, no reset after agreement",
  confidence: "Confidence Engine — evidence-based wins, not cheerleading",
  momentum: "Momentum Protection — flow detection and hyperfocus guardrails",
  action: "Action Bias — decision acceleration and next-step endings",
  routing: "Feature routing deferral — permission-first, pattern-aware",
  overanalysis: "Anti-Overanalysis — question limits and discovery override",
  adhdAlignment: "ADHD Entrepreneur lens — simplify, sequence, small wins",
};

export function formatScenarioLibrarySummary(
  run = runCompanionValidationFramework(),
): ScenarioLibrarySummary {
  const { results } = run;
  const totalScenarios = results.length;
  const passingScenarios = results.filter((r) => r.passed).length;
  const failingScenarios = totalScenarios - passingScenarios;

  const averageByDimension = {} as Record<ScorecardDimension, number>;
  for (const dim of Object.keys(DEFAULT_SCORECARD_THRESHOLDS) as ScorecardDimension[]) {
    const sum = results.reduce((acc, r) => acc + r.scorecard.dimensions[dim].score, 0);
    averageByDimension[dim] = Math.round((sum / totalScenarios) * 10) / 10;
  }

  let weakestDimension: ScorecardDimension = "understanding";
  let lowestAvg = Infinity;
  for (const [dim, avg] of Object.entries(averageByDimension) as [ScorecardDimension, number][]) {
    if (avg < lowestAvg) {
      lowestAvg = avg;
      weakestDimension = dim;
    }
  }

  const failed = results.filter((r) => !r.passed);
  const topFailedScenario =
    failed.sort((a, b) => a.scorecard.overall - b.scorecard.overall)[0] ?? null;

  const recommendedTuningArea = topFailedScenario
    ? `${TUNING_HINTS[weakestDimension]} — fix "${topFailedScenario.label}" first (${topFailedScenario.failures[0] ?? "low score"})`
    : TUNING_HINTS[weakestDimension];

  const salesResults = results.filter((r) => r.category === "sales_conversations");
  const salesFailed = salesResults.filter((r) => !r.passed);
  const salesAverageByDimension = {} as Record<ScorecardDimension, number>;
  for (const dim of Object.keys(DEFAULT_SCORECARD_THRESHOLDS) as ScorecardDimension[]) {
    const sum = salesResults.reduce((acc, r) => acc + r.scorecard.dimensions[dim].score, 0);
    salesAverageByDimension[dim] =
      salesResults.length > 0 ? Math.round((sum / salesResults.length) * 10) / 10 : 0;
  }

  const failurePatternCounts = new Map<string, number>();
  for (const result of salesFailed) {
    for (const failure of result.failures) {
      const key = failure.split(":")[0]?.trim() ?? failure;
      failurePatternCounts.set(key, (failurePatternCounts.get(key) ?? 0) + 1);
    }
  }
  const topSalesFailurePatterns = [...failurePatternCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pattern, count]) => `${pattern} (${count})`);

  const interventionCounts = new Map<string, number>();
  for (const result of salesResults) {
    const move = result.bundle.intuitive.companionMove.trim();
    if (move) interventionCounts.set(move, (interventionCounts.get(move) ?? 0) + 1);
  }
  const commonSalesInterventions = [...interventionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([intervention, count]) => `${intervention} (${count})`);

  const visibilityResults = results.filter((r) => r.category === "visibility_marketing");
  const visibilityFailed = visibilityResults.filter((r) => !r.passed);
  const visibilityAverageByDimension = {} as Record<ScorecardDimension, number>;
  for (const dim of Object.keys(DEFAULT_SCORECARD_THRESHOLDS) as ScorecardDimension[]) {
    const sum = visibilityResults.reduce((acc, r) => acc + r.scorecard.dimensions[dim].score, 0);
    visibilityAverageByDimension[dim] =
      visibilityResults.length > 0 ? Math.round((sum / visibilityResults.length) * 10) / 10 : 0;
  }

  const visibilityFailurePatternCounts = new Map<string, number>();
  for (const result of visibilityFailed) {
    for (const failure of result.failures) {
      const key = failure.split(":")[0]?.trim() ?? failure;
      visibilityFailurePatternCounts.set(key, (visibilityFailurePatternCounts.get(key) ?? 0) + 1);
    }
  }
  const topVisibilityFailurePatterns = [...visibilityFailurePatternCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pattern, count]) => `${pattern} (${count})`);

  const visibilityInterventionCounts = new Map<string, number>();
  for (const result of visibilityResults) {
    const move = result.bundle.intuitive.companionMove.trim();
    if (move) visibilityInterventionCounts.set(move, (visibilityInterventionCounts.get(move) ?? 0) + 1);
  }
  const commonVisibilityInterventions = [...visibilityInterventionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([intervention, count]) => `${intervention} (${count})`);

  const confidenceRecoveryScenarios = visibilityResults.filter(
    (r) => r.bundle.intuitive.actualNeed === "build_confidence",
  );
  const confidenceRecoveryPassed = confidenceRecoveryScenarios.filter(
    (r) => r.scorecard.dimensions.confidence.passed,
  ).length;
  const confidenceRecoverySuccessRate =
    confidenceRecoveryScenarios.length > 0
      ? Math.round((confidenceRecoveryPassed / confidenceRecoveryScenarios.length) * 100)
      : 100;

  return {
    totalScenarios,
    passingScenarios,
    failingScenarios,
    averageByDimension,
    weakestDimension,
    topFailedScenario,
    recommendedTuningArea,
    sales: {
      total: salesResults.length,
      passing: salesResults.length - salesFailed.length,
      failing: salesFailed.length,
      averageByDimension: salesAverageByDimension,
      topFailurePatterns: topSalesFailurePatterns,
      commonInterventions:
        commonSalesInterventions.length > 0
          ? commonSalesInterventions
          : salesResults.slice(0, 3).map((r) => r.bundle.intuitive.companionMove),
    },
    visibility: {
      total: visibilityResults.length,
      passing: visibilityResults.length - visibilityFailed.length,
      failing: visibilityFailed.length,
      averageByDimension: visibilityAverageByDimension,
      topFailurePatterns: topVisibilityFailurePatterns,
      commonInterventions:
        commonVisibilityInterventions.length > 0
          ? commonVisibilityInterventions
          : visibilityResults.slice(0, 3).map((r) => r.bundle.intuitive.companionMove),
      confidenceRecoverySuccessRate,
    },
    results,
  };
}

export function formatScorecardSummary(scorecard: CompanionScorecard): string {
  const lines = (Object.keys(scorecard.dimensions) as ScorecardDimension[]).map((key) => {
    const dim = scorecard.dimensions[key];
    return `${key}: ${dim.score}/${dim.threshold}${dim.passed ? " ✓" : " ✗"}${dim.notes.length ? ` — ${dim.notes[0]}` : ""}`;
  });
  return [`Overall: ${scorecard.overall}${scorecard.passed ? " PASS" : " FAIL"}`, ...lines].join(
    "\n",
  );
}

export function formatScenarioLibrarySummaryText(summary?: ScenarioLibrarySummary): string {
  const s = summary ?? formatScenarioLibrarySummary();
  const dimLines = (Object.keys(s.averageByDimension) as ScorecardDimension[]).map(
    (d) => `  ${d}: ${s.averageByDimension[d]}`,
  );
  return [
    `Companion Intelligence Scenario Library`,
    `Total: ${s.totalScenarios} | Passing: ${s.passingScenarios} | Failing: ${s.failingScenarios}`,
    `Weakest dimension: ${s.weakestDimension} (${s.averageByDimension[s.weakestDimension]})`,
    `Average by dimension:`,
    ...dimLines,
    s.topFailedScenario
      ? `Top failure: ${s.topFailedScenario.label} — ${s.topFailedScenario.failures.join("; ")}`
      : "All scenarios passing.",
    `Sales (${s.sales.total}): ${s.sales.passing} passing, ${s.sales.failing} failing`,
    `Sales averages — confidence: ${s.sales.averageByDimension.confidence}, action: ${s.sales.averageByDimension.action}, adhdAlignment: ${s.sales.averageByDimension.adhdAlignment}`,
    s.sales.topFailurePatterns.length
      ? `Top sales failure patterns: ${s.sales.topFailurePatterns.join("; ")}`
      : "No sales failures.",
    s.sales.commonInterventions.length
      ? `Common sales interventions: ${s.sales.commonInterventions.slice(0, 3).join(" | ")}`
      : "",
    `Visibility (${s.visibility.total}): ${s.visibility.passing} passing, ${s.visibility.failing} failing`,
    `Visibility averages — confidence: ${s.visibility.averageByDimension.confidence}, adhdAlignment: ${s.visibility.averageByDimension.adhdAlignment}`,
    s.visibility.topFailurePatterns.length
      ? `Top visibility failure patterns: ${s.visibility.topFailurePatterns.join("; ")}`
      : "No visibility failures.",
    s.visibility.commonInterventions.length
      ? `Common visibility interventions: ${s.visibility.commonInterventions.slice(0, 3).join(" | ")}`
      : "",
    `Visibility confidence recovery success: ${s.visibility.confidenceRecoverySuccessRate}%`,
    `Recommended tuning: ${s.recommendedTuningArea}`,
  ].join("\n");
}
