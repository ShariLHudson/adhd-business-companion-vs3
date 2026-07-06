import type { DiscoveredOpportunity, Opportunity, OpportunityId } from "../types";
import { compareOpportunityScores } from "../scoring/opportunityScoring";
import { opportunitySampleRepository } from "../repositories/sample";

export function scoreOpportunity(id: OpportunityId): DiscoveredOpportunity["score"] | null {
  const opportunity = opportunitySampleRepository.get(id);
  return opportunity?.score ?? null;
}

export function rankOpportunities(
  opportunities: DiscoveredOpportunity[] | Opportunity[],
): DiscoveredOpportunity[] {
  const list = opportunities as DiscoveredOpportunity[];
  return [...list].sort((a, b) => compareOpportunityScores(a.score, b.score));
}

export function rankByMission(
  opportunities: DiscoveredOpportunity[],
  missionId: string,
): DiscoveredOpportunity[] {
  return rankOpportunities(
    opportunities.filter((o) => o.missionIds.includes(missionId)),
  );
}
