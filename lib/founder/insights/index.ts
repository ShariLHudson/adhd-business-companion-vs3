import type { FounderInsight } from "../types";
import { sampleInsightRepository } from "../repositories";

export function getInsights(): FounderInsight[] {
  return sampleInsightRepository.list();
}

export function getTopInsights(limit = 3): FounderInsight[] {
  return sampleInsightRepository.getTop(limit);
}

export function getInsightsByCategory(category: string): FounderInsight[] {
  return sampleInsightRepository.listByCategory(category);
}
