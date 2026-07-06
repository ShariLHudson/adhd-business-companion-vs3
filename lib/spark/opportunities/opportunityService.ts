import type { SparkOpportunity } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";
import { rankingService } from "../ranking/rankingService";

export class OpportunityService {
  constructor(private readonly repo: SparkSampleRepository = sparkSampleRepository) {}

  listOpportunities(): SparkOpportunity[] {
    return rankingService.rankByComposite(this.repo.opportunities());
  }
}

export const opportunityService = new OpportunityService();
