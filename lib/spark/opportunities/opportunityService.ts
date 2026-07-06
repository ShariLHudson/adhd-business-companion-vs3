import type { SparkOpportunity } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";
import { rankingService } from "../ranking/rankingService";

export class SparkOpportunityService {
  constructor(private readonly repo: SparkSampleRepository = sparkSampleRepository) {}

  listOpportunities(): SparkOpportunity[] {
    return rankingService.rankByConfidence(this.repo.opportunities());
  }
}

export const sparkOpportunityService = new SparkOpportunityService();

/** @deprecated Use sparkOpportunityService */
export const opportunityService = sparkOpportunityService;
