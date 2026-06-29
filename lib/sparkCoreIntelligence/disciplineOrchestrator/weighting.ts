/**
 * Confidence weighting — rank contributions for synthesis.
 */

import type { ConfidenceWeight, DisciplineContribution } from "./types";

const CONFIDENCE_SCORE: Record<ConfidenceWeight, number> = {
  low: 0.4,
  medium: 0.7,
  high: 0.95,
};

export function weightContribution(c: DisciplineContribution): number {
  return c.weight * CONFIDENCE_SCORE[c.confidence];
}

export function rankContributions(
  contributions: DisciplineContribution[],
): DisciplineContribution[] {
  return [...contributions].sort(
    (a, b) => weightContribution(b) - weightContribution(a),
  );
}

export function aggregateConfidence(
  contributions: DisciplineContribution[],
): ConfidenceWeight {
  if (contributions.length === 0) return "medium";
  const avg =
    contributions.reduce((sum, c) => sum + CONFIDENCE_SCORE[c.confidence], 0) /
    contributions.length;
  if (avg >= 0.85) return "high";
  if (avg >= 0.6) return "medium";
  return "low";
}
