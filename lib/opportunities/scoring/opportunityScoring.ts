import type { OpportunityScore, OpportunityScoreDimensions } from "../types";

const WEIGHTS: Record<keyof OpportunityScoreDimensions, number> = {
  strategicValue: 0.14,
  revenuePotential: 0.12,
  founderAlignment: 0.1,
  customerNeed: 0.14,
  innovation: 0.08,
  difficulty: 0.06,
  urgency: 0.1,
  confidence: 0.1,
  missionAlignment: 0.1,
  marketingValue: 0.06,
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeScoreDimension(value: number): number {
  return clamp(value);
}

export function buildOpportunityScore(
  dimensions: OpportunityScoreDimensions,
): OpportunityScore {
  const normalized = Object.fromEntries(
    Object.entries(dimensions).map(([key, value]) => [
      key,
      normalizeScoreDimension(value),
    ]),
  ) as OpportunityScoreDimensions;

  const composite = clamp(
    Object.entries(normalized).reduce((sum, [key, value]) => {
      const weight = WEIGHTS[key as keyof OpportunityScoreDimensions];
      const adjusted =
        key === "difficulty"
          ? 100 - value
          : value;
      return sum + adjusted * weight;
    }, 0),
  );

  return { ...normalized, composite };
}

export function compareOpportunityScores(a: OpportunityScore, b: OpportunityScore): number {
  return b.composite - a.composite;
}

export function isQuickWin(score: OpportunityScore): boolean {
  return score.composite >= 70 && score.difficulty <= 45 && score.urgency >= 55;
}

export function isStrategicBet(score: OpportunityScore): boolean {
  return score.strategicValue >= 75 && score.revenuePotential >= 60 && score.urgency < 70;
}

export function isHighImpact(score: OpportunityScore): boolean {
  return score.composite >= 80;
}

export function needsResearch(confidence: number): boolean {
  return confidence < 55;
}
