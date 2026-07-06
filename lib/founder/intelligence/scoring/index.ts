import type { FounderIntelligenceScores } from "../types";

export const INTELLIGENCE_SCORE_DIMENSIONS = [
  "importance",
  "confidence",
  "urgency",
  "strategicValue",
  "revenuePotential",
  "innovationScore",
  "customerImpact",
  "implementationEffort",
] as const satisfies readonly (keyof FounderIntelligenceScores)[];

export type IntelligenceScoreDimension =
  (typeof INTELLIGENCE_SCORE_DIMENSIONS)[number];

export const INTELLIGENCE_SCORE_LABELS: Record<
  IntelligenceScoreDimension,
  string
> = {
  importance: "Importance",
  confidence: "Confidence",
  urgency: "Urgency",
  strategicValue: "Strategic Value",
  revenuePotential: "Revenue Potential",
  innovationScore: "Innovation Score",
  customerImpact: "Customer Impact",
  implementationEffort: "Implementation Effort",
};

/** Normalize 0–1 sample score to a calm executive label. */
export function formatScoreValue(value: number): string {
  const pct = Math.round(value * 100);
  if (pct >= 85) return "Very High";
  if (pct >= 70) return "High";
  if (pct >= 50) return "Moderate";
  if (pct >= 30) return "Low";
  return "Minimal";
}

export function averageScore(scores: FounderIntelligenceScores): number {
  const values = INTELLIGENCE_SCORE_DIMENSIONS.map((key) => scores[key]);
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
