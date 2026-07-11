/**
 * Spark Trust & Performance Engine — types.
 * @see spark-intelligence-foundation/14-spark-trust-performance-engine.md
 */

export const SPARK_TRUST_PERFORMANCE_VERSION = "1.0" as const;

/** Response complexity — minimum intelligence per level. */
export type ComplexityLevel = 1 | 2 | 3 | 4 | 5;

export type ComplexityClass =
  | "simple_answer"
  | "business_guidance"
  | "creative_collaboration"
  | "executive_reasoning"
  | "deep_research";

export type IntentLabel =
  | "definition"
  | "marketing"
  | "strategy"
  | "research"
  | "creative"
  | "support"
  | "execution"
  | "navigation"
  | "general";

export type PerformanceBudget = {
  intentDetectionMaxMs: number;
  firstTokenTargetMs: number;
  totalResponseTargetMs: number;
  streamRequired: boolean;
};

export type ModuleActivation = {
  knowledgeEngine: boolean;
  cognitiveOrchestration: boolean;
  fullIntelligence: boolean;
  disciplines: string[];
  observatory: boolean;
  creativeEngine: boolean;
};

export type TrustPerformanceIngress = {
  turnId: string;
  threadId: string;
  memberMessage: string;
};

export type TrustPerformanceIngressResult = {
  intentLabel: IntentLabel;
  complexityLevel: ComplexityLevel;
  complexityClass: ComplexityClass;
  modules: ModuleActivation;
  performanceBudget: PerformanceBudget;
  intentDetectionMs: number;
  goldenRulePassed: boolean;
  engineVersion: typeof SPARK_TRUST_PERFORMANCE_VERSION;
};

export type TrustQualityGateInput = {
  draftText: string;
  memberMessage: string;
  objectiveSummary: string;
  complexityLevel: ComplexityLevel;
};

export type TrustQualityGateResult = {
  answeredCorrectQuestion: boolean;
  remainedOnObjective: boolean;
  canBeShorter: boolean;
  canBeClearer: boolean;
  canBeFaster: boolean;
  wouldTrustAsMember: boolean;
  pass: boolean;
  revisionHints: string[];
};

export type TrustPerformanceEgressResult = {
  approved: boolean;
  gate: TrustQualityGateResult;
  finalText: string;
};

export type TrustPerformanceResult =
  | { phase: "ingress"; ingress: TrustPerformanceIngressResult }
  | {
      phase: "egress";
      ingress: TrustPerformanceIngressResult;
      egress: TrustPerformanceEgressResult;
    };
