import { sampleMemoryRepository } from "../repositories/sample";
import type { FounderMemoryVaultOverview } from "../types";

/** Product, roadmap, and relationship history surfaces */
export function getCompanyHistory() {
  const vault = sampleMemoryRepository.getVaultOverview();
  return {
    productHistory: vault.productHistory,
    roadmapChanges: vault.roadmapChanges,
    relationships: vault.relationships,
    insights: vault.insights,
    wins: vault.wins,
    challenges: vault.challenges,
    links: vault.links,
  };
}

export function getMemoryGraph(): FounderMemoryVaultOverview["links"] {
  return sampleMemoryRepository.getVaultOverview().links;
}
