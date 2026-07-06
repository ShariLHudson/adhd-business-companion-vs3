import type { SparkScore, SparkScoreDimension } from "../types";
import { sparkDimensionWeights, SPARK_SCORE_DIMENSIONS } from "./dimensions";

export type SparkScoringInput = Partial<Record<SparkScoreDimension, number>>;

export class SparkScoringService {
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

  /** Build weighted score rows from partial dimension values (0–100). */
  buildScores(input: SparkScoringInput): SparkScore[] {
    return (Object.keys(input) as SparkScoreDimension[])
      .filter((dim) => input[dim] !== undefined)
      .map((dimension) => ({
        dimension,
        value: clamp100(input[dimension]!),
        weight: this.weights[dimension],
      }));
  }

  /**
   * Composite score 0–100 — implementationEffort is inverted (lower effort = higher contribution).
   */
  composite(scores: SparkScore[]): number {
    if (scores.length === 0) return 0;
    let weighted = 0;
    let totalWeight = 0;
    for (const row of scores) {
      const normalized = row.value / 100;
      const value =
        row.dimension === "implementationEffort" ? 1 - normalized : normalized;
      weighted += value * row.weight;
      totalWeight += row.weight;
    }
    return clamp100(totalWeight > 0 ? (weighted / totalWeight) * 100 : 0);
  }

  score(input: SparkScoringInput): { scores: SparkScore[]; composite: number } {
    const scores = this.buildScores(input);
    return { scores, composite: this.composite(scores) };
  }
}

function clamp100(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n * 100) / 100));
}

export const sparkScoringService = new SparkScoringService();

/** @deprecated Use sparkScoringService */
export const scoringEngine = sparkScoringService;
