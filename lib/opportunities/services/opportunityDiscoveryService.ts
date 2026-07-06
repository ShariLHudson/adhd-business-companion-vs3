import { opportunitySampleRepository } from "../repositories/sample";
import type { BusinessOpportunity, OpportunityDiscoveryOverview } from "../types";

function sortByRank(items: BusinessOpportunity[]): BusinessOpportunity[] {
  return [...items].sort((a, b) => b.rankScore - a.rankScore);
}

/** Rule of Three — local to avoid calmIntelligence ↔ overnight import cycle. */
function topThree(items: BusinessOpportunity[]): BusinessOpportunity[] {
  return items.slice(0, 3);
}

/** Compose the opening surface — Rule of One + Rule of Three. */
export function composeOpportunityDiscoveryOverview(): OpportunityDiscoveryOverview {
  const all = opportunitySampleRepository.all();
  const todaysBiggest =
    opportunitySampleRepository.byBucket("todays-biggest")[0] ??
    sortByRank(all)[0]!;

  const emerging = topThree(
    sortByRank(opportunitySampleRepository.byBucket("emerging")),
  );

  const quickWins = topThree(
    sortByRank(opportunitySampleRepository.byBucket("quick-win")),
  );

  const longTerm = topThree(
    sortByRank(opportunitySampleRepository.byBucket("long-term")),
  );

  const competitiveThreats = topThree(
    sortByRank(opportunitySampleRepository.byBucket("competitive-threat")),
  );

  const watching = topThree(
    sortByRank(opportunitySampleRepository.byBucket("watching")),
  );

  return {
    product: "founder",
    generatedAt: new Date().toISOString(),
    todaysBiggest,
    emerging,
    quickWins,
    longTerm,
    competitiveThreats,
    watching,
    principle: opportunitySampleRepository.principle(),
  };
}

export function getOpportunityById(id: string): BusinessOpportunity | undefined {
  return opportunitySampleRepository.get(id);
}

export class OpportunityDiscoveryService {
  overview() {
    return composeOpportunityDiscoveryOverview();
  }

  get(id: string) {
    return getOpportunityById(id);
  }

  sampleRepository() {
    return opportunitySampleRepository;
  }
}

export const opportunityDiscoveryService = new OpportunityDiscoveryService();
