import type { ImprovementReviewInput } from "../types";
import { review as runReview, findExperiments as listExperiments } from "../reviews/reviewEngine";
import { recommendImprovements as buildRecommendations } from "../recommendations/recommendationEngine";
import {
  compareResults as compareExperimentResults,
  listHistory,
  listRelationships,
  institutionalMemoryLinks,
} from "../history/improvementHistory";
import { calculateROI as scoreOpportunityRoi } from "../measurements/roiCalculator";
import { prioritizeImprovements as rankOpportunities, topImprovement } from "../priorities/priorityEngine";
import { improvementSampleRepository } from "../repositories/sample";

export class ImprovementService {
  review(input: ImprovementReviewInput) {
    return runReview(input);
  }

  recommendImprovements(missionId?: string) {
    return buildRecommendations(missionId);
  }

  findExperiments(filter?: Parameters<typeof listExperiments>[0]) {
    return listExperiments(filter);
  }

  compareResults(...args: Parameters<typeof compareExperimentResults>) {
    return compareExperimentResults(...args);
  }

  calculateROI(opportunityId: string) {
    const opp = improvementSampleRepository.getOpportunity(opportunityId);
    return opp ? scoreOpportunityRoi(opp) : null;
  }

  prioritizeImprovements(missionId?: string) {
    const opps = missionId
      ? improvementSampleRepository.forMission(missionId)
      : improvementSampleRepository.opportunities();
    return rankOpportunities(opps.length ? opps : improvementSampleRepository.opportunities());
  }

  topImprovement(missionId?: string) {
    return topImprovement(
      missionId
        ? improvementSampleRepository.forMission(missionId)
        : improvementSampleRepository.opportunities(),
    );
  }

  history(improvementId?: string) {
    return listHistory(improvementId);
  }

  relationships(entityId?: string) {
    return listRelationships(entityId);
  }

  memoryLinks() {
    return institutionalMemoryLinks();
  }

  sampleRepository() {
    return improvementSampleRepository;
  }
}

export const improvementService = new ImprovementService();

export function review(input: ImprovementReviewInput) {
  return improvementService.review(input);
}

export function recommendImprovements(missionId?: string) {
  return improvementService.recommendImprovements(missionId);
}

export function findExperiments(filter?: Parameters<typeof listExperiments>[0]) {
  return improvementService.findExperiments(filter);
}

export function compareResults(input: Parameters<typeof compareExperimentResults>[0]) {
  return improvementService.compareResults(input);
}

export function calculateROI(opportunityId: string) {
  return improvementService.calculateROI(opportunityId);
}

export function prioritizeImprovements(missionId?: string) {
  return improvementService.prioritizeImprovements(missionId);
}
