/**
 * SPARK™ Intelligence Core — Executive Intelligence Operating System™
 *
 * Ecosystem-wide intelligence layer. No UI. No AI. No product-specific logic.
 * Consumed by Companion, Founder, PostCraft, Team Hub, FLAME™, FIRE™, and future products.
 */

export { Spark, type SparkApi, type SparkObserveResult, type SparkConnectResult, type SparkPrepareResult } from "./core/sparkApi";

export * from "./types";

export * from "./services";

export { SPARK_SCORE_DIMENSIONS, sparkDimensionWeights } from "./scoring/dimensions";

export { scoringEngine, type SparkScoringInput } from "./scoring/scoringEngine";

export { patternEngine } from "./patterns/patternEngine";

export { sparkSampleRepository } from "./repositories";
