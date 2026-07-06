import type { SparkPrepareContext, SparkRecommendation } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";
import { rankingService } from "../ranking/rankingService";

export class RecommendationPreparationService {
  constructor(private readonly repo: SparkSampleRepository = sparkSampleRepository) {}

  prepare(context: SparkPrepareContext): SparkRecommendation[] {
    const limit = context.limit ?? 5;
    const all = this.repo.recommendations();
    const filtered =
      context.product === "ecosystem"
        ? all
        : all.filter((r) => r.preparedFor === context.product);
    return rankingService.rankByComposite(filtered).slice(0, limit);
  }
}

export const recommendationPreparationService =
  new RecommendationPreparationService();
