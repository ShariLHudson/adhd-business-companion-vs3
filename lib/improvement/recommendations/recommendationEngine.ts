import type { ImprovementRecommendation } from "../types";
import { improvementSampleRepository } from "../repositories/sample";
import { calculateROI } from "../measurements/roiCalculator";
import { prioritizeImprovements } from "../priorities/priorityEngine";

export function recommendImprovements(missionId?: string): ImprovementRecommendation[] {
  const opportunities = missionId
    ? improvementSampleRepository.forMission(missionId)
    : improvementSampleRepository.opportunities();

  const prioritized = prioritizeImprovements(
    opportunities.length > 0 ? opportunities : improvementSampleRepository.opportunities(),
  );

  const existing = improvementSampleRepository.recommendations();
  const fromOpps: ImprovementRecommendation[] = prioritized
    .filter((o) => !existing.some((r) => r.opportunityId === o.id))
    .slice(0, 2)
    .map((o) => ({
      id: `rec-runtime-${o.id}`,
      opportunityId: o.id,
      title: o.title,
      recommendation: o.shouldSimplify ?? o.shouldAutomate ?? o.summary,
      action: o.suggestedAction,
      priority: o.priority,
      roi: calculateROI(o),
      evidenceIds: o.evidence.map((e) => e.id),
      rationale: `Root cause: ${o.rootCause}`,
    }));

  return [...existing, ...fromOpps];
}
