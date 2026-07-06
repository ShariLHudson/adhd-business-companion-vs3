import type { ImprovementOpportunity, ImprovementPriority } from "../types";
import { calculateROI } from "../measurements/roiCalculator";

const PRIORITY_ORDER: Record<ImprovementPriority, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  watch: 1,
};

export function prioritizeImprovements(opportunities: ImprovementOpportunity[]): ImprovementOpportunity[] {
  return [...opportunities].sort((a, b) => {
    const priorityDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return calculateROI(b).score - calculateROI(a).score;
  });
}

export function topImprovement(opportunities: ImprovementOpportunity[]): ImprovementOpportunity | null {
  return prioritizeImprovements(opportunities)[0] ?? null;
}
