import type { ImprovementROI } from "../types";
import type { ImprovementOpportunity } from "../types";

export function calculateROI(opportunity: ImprovementOpportunity): ImprovementROI {
  const roi = opportunity.roi;
  const effort = Math.max(opportunity.estimatedEffortHours, 1);
  const value =
    roi.timeSavedHours * 2 +
    roi.complexityReduction * 0.5 +
    roi.strategicValue * 0.3 -
    effort * 0.4;
  const energyBonus = roi.founderEnergy === "restores" ? 8 : roi.founderEnergy === "drains" ? -10 : 0;
  const score = Math.min(100, Math.max(0, Math.round(value + energyBonus)));

  return {
    ...roi,
    score,
    summary: roi.summary || `Estimated ROI score ${score} — ${opportunity.expectedImpact}`,
  };
}

export function compareRoi(a: ImprovementROI, b: ImprovementROI): number {
  return b.score - a.score;
}
