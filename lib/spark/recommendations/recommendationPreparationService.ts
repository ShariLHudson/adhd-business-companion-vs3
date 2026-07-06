import type { SparkPrepareContext, SparkRecommendation } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";
import { rankingService } from "../ranking/rankingService";

export class SparkRecommendationService {
  constructor(private readonly repo: SparkSampleRepository = sparkSampleRepository) {}

  listRecommendations(): SparkRecommendation[] {
    return this.repo.recommendations();
  }

  prepare(context: SparkPrepareContext): SparkRecommendation[] {
    const limit = context.limit ?? 5;
    const all = this.repo.recommendations();
    const filtered =
      context.product === "ecosystem"
        ? all
        : all.filter((r) => r.preparedFor === context.product);
    return rankingService.rankByConfidence(filtered).slice(0, limit);
  }
}

export const sparkRecommendationService = new SparkRecommendationService();

/** @deprecated Use sparkRecommendationService */
export const recommendationPreparationService = sparkRecommendationService;
