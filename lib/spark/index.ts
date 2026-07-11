/**
 * SPARK Intelligence Core — Strategic Pattern Analysis & Recommendation Kernel
 *
 * Ecosystem-wide intelligence layer. No UI. No AI. No Founder dependency.
 * @see docs/architecture/SPARK_INTELLIGENCE_BLUEPRINT.md
 */

export {
  Spark,
  type SparkApi,
  type SparkObserveResult,
  type SparkConnectResult,
  type SparkPrepareResult,
} from "./core/sparkApi";

export * from "./types";

export * from "./services";

export { SPARK_SCORE_DIMENSIONS, sparkDimensionWeights } from "./scoring/dimensions";

export { sparkScoringService, scoringEngine, type SparkScoringInput } from "./scoring/scoringEngine";

export { sparkPatternService, patternEngine } from "./patterns/patternEngine";

export { sparkSampleRepository } from "./repositories";

export * from "./sample";
