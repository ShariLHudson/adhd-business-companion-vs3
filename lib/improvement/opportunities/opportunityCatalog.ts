import type { ImprovementCategory } from "../types";
import { improvementSampleRepository } from "../repositories/sample";

export function listImprovementOpportunities(filter?: {
  missionId?: string;
  category?: ImprovementCategory;
}) {
  let items = improvementSampleRepository.opportunities();
  if (filter?.missionId) items = items.filter((o) => o.missionId === filter.missionId);
  if (filter?.category) items = items.filter((o) => o.category === filter.category);
  return items;
}

export function getImprovementOpportunity(id: string) {
  return improvementSampleRepository.getOpportunity(id);
}
