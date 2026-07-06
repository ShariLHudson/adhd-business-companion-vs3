import type { SparkScore, SparkScoreDimension } from "../types";
import { sparkDimensionWeights, SPARK_SCORE_DIMENSIONS } from "./dimensions";

export type SparkScoringInput = Partial<Record<SparkScoreDimension, number>>;

export class ScoringEngine {
  private readonly weights: Record<SparkScoreDimension, number>;

  constructor(weightOverrides?: Partial<Record<SparkScoreDimension, number>>) {
    this.weights = sparkDimensionWeights(weightOverrides);
  }

  getDimensions() {
    return SPARK_SCORE_DIMENSIONS;
  }

  getWeights(): Record<SparkScoreDimension, number> {
    return { ...this.weights };
  }

  /** Build weighted score rows from partial dimension values (0–1). */
  buildScores(input: SparkScoringInput): SparkScore[] {
    return (Object.keys(input) as SparkScoreDimension[])
      .filter((dim) => input[dim] !== undefined)
      .map((dimension) => ({
        dimension,
        value: input[dimension]!,
        weight: this.weights[dimension],
      }));
  }

  /**
   * Composite score — implementation-effort is inverted (lower effort = higher contribution).
   */
  composite(scores: SparkScore[]): number {
    if (scores.length === 0) return 0;
    let weighted = 0;
    let totalWeight = 0;
    for (const row of scores) {
      const value =
        row.dimension === "implementation-effort" ? 1 - row.value : row.value;
      weighted += value * row.weight;
      totalWeight += row.weight;
    }
    return totalWeight > 0 ? weighted / totalWeight : 0;
  }

  score(input: SparkScoringInput): { scores: SparkScore[]; composite: number } {
    const scores = this.buildScores(input);
    return { scores, composite: this.composite(scores) };
  }
}

export const scoringEngine = new ScoringEngine();
