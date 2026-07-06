import {
  SAMPLE_IMPROVEMENT_EXPERIMENTS,
  SAMPLE_IMPROVEMENT_HISTORY,
  SAMPLE_IMPROVEMENT_METRICS,
  SAMPLE_IMPROVEMENT_OBSERVATIONS,
  SAMPLE_IMPROVEMENT_OPPORTUNITIES,
  SAMPLE_IMPROVEMENT_OUTCOMES,
  SAMPLE_IMPROVEMENT_RECOMMENDATIONS,
  SAMPLE_IMPROVEMENT_RELATIONSHIPS,
  SAMPLE_IMPROVEMENT_REVIEWS,
} from "../../sample";
import type { ImprovementCategory } from "../../types";

export const improvementSampleRepository = {
  opportunities: () => [...SAMPLE_IMPROVEMENT_OPPORTUNITIES],
  observations: () => [...SAMPLE_IMPROVEMENT_OBSERVATIONS],
  recommendations: () => [...SAMPLE_IMPROVEMENT_RECOMMENDATIONS],
  experiments: () => [...SAMPLE_IMPROVEMENT_EXPERIMENTS],
  reviews: () => [...SAMPLE_IMPROVEMENT_REVIEWS],
  relationships: () => [...SAMPLE_IMPROVEMENT_RELATIONSHIPS],
  history: () => [...SAMPLE_IMPROVEMENT_HISTORY],
  outcomes: () => [...SAMPLE_IMPROVEMENT_OUTCOMES],
  metrics: () => [...SAMPLE_IMPROVEMENT_METRICS],
  getOpportunity: (id: string) => SAMPLE_IMPROVEMENT_OPPORTUNITIES.find((o) => o.id === id) ?? null,
  getExperiment: (id: string) => SAMPLE_IMPROVEMENT_EXPERIMENTS.find((e) => e.id === id) ?? null,
  forMission: (missionId: string) =>
    SAMPLE_IMPROVEMENT_OPPORTUNITIES.filter((o) => o.missionId === missionId),
  byCategory: (category: ImprovementCategory) =>
    SAMPLE_IMPROVEMENT_OPPORTUNITIES.filter((o) => o.category === category),
  forInstitutionalMemory: (memoryId: string) =>
    SAMPLE_IMPROVEMENT_OPPORTUNITIES.filter((o) =>
      o.evidence.some((e) => e.institutionalMemoryId === memoryId),
    ),
};
