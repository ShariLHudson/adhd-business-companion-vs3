import type { FounderRecommendation } from "../types";
import { sampleRecommendationRepository } from "../repositories";

export function getRecommendations(): FounderRecommendation[] {
  return sampleRecommendationRepository.list();
}

export function getTopRecommendations(limit = 3): FounderRecommendation[] {
  return sampleRecommendationRepository.getTop(limit);
}

export function getBuildRecommendations(): FounderRecommendation[] {
  return sampleRecommendationRepository.listBuild();
}

export function getIgnoreRecommendations(): FounderRecommendation[] {
  return sampleRecommendationRepository.listIgnore();
}
