import type { ProductEvolution } from "../types";
import { institutionalMemorySampleRepository } from "../repositories/sample";

export function findProductHistory(productId: string): ProductEvolution[] {
  return institutionalMemorySampleRepository
    .list()
    .filter(
      (m): m is ProductEvolution =>
        m.kind === "product-evolution" && m.relatedProducts.includes(productId),
    );
}

export function productEvolutionSummary(productId: string) {
  const history = findProductHistory(productId);
  const primary = history[0];
  if (!primary) return null;

  return {
    productId,
    originalVision: primary.originalVision,
    majorRevisions: primary.majorRevisions,
    featuresAdded: primary.featuresAdded,
    featuresRemoved: primary.featuresRemoved,
    customerFeedback: primary.customerFeedback,
    businessImpact: primary.businessImpact,
    revenueImpact: primary.revenueImpact,
    lessons: primary.lessonsLearned,
    memories: history,
  };
}
