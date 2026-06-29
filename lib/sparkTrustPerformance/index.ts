export {
  runTrustEgress,
  runTrustIngress,
  runTrustPerformance,
  runTrustQualityGate,
} from "./evaluateTrustPerformance";
export {
  classifyComplexity,
  classifyIntentFast,
  modulesForComplexity,
  passesGoldenRule,
  performanceBudgetForLevel,
} from "./fastIntent";
export type {
  ComplexityClass,
  ComplexityLevel,
  IntentLabel,
  ModuleActivation,
  PerformanceBudget,
  TrustPerformanceEgressResult,
  TrustPerformanceIngress,
  TrustPerformanceIngressResult,
  TrustPerformanceResult,
  TrustQualityGateInput,
  TrustQualityGateResult,
} from "./types";
export { SPARK_TRUST_PERFORMANCE_VERSION } from "./types";
