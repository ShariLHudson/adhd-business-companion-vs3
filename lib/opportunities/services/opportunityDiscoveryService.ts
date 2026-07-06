import { applyRuleOfThree } from "@/lib/calmIntelligence";

import { opportunitySampleRepository } from "../repositories/sample";
import type { BusinessOpportunity, OpportunityDiscoveryOverview } from "../types";

function sortByRank(items: BusinessOpportunity[]): BusinessOpportunity[] {
  return [...items].sort((a, b) => b.rankScore - a.rankScore);
}

/** Compose the opening surface — Rule of One + Rule of Three. */
export function composeOpportunityDiscoveryOverview(): OpportunityDiscoveryOverview {
  const all = opportunitySampleRepository.all();
  const todaysBiggest =
    opportunitySampleRepository.byBucket("todays-biggest")[0] ??
    sortByRank(all)[0]!;

  const emerging = applyRuleOfThree(
    sortByRank(opportunitySampleRepository.byBucket("emerging")),
  ).items;

  const quickWins = applyRuleOfThree(
    sortByRank(opportunitySampleRepository.byBucket("quick-win")),
  ).items;

  const longTerm = applyRuleOfThree(
    sortByRank(opportunitySampleRepository.byBucket("long-term")),
  ).items;

  const competitiveThreats = applyRuleOfThree(
    sortByRank(opportunitySampleRepository.byBucket("competitive-threat")),
  ).items;

  const watching = applyRuleOfThree(
    sortByRank(opportunitySampleRepository.byBucket("watching")),
  ).items;

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
