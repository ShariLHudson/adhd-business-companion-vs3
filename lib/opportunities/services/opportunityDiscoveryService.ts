import type {
  DiscoveredOpportunity,
  OpportunityDiscoveryFilter,
  OpportunityExecutiveSummary,
  OpportunityGroup,
  OpportunityId,
} from "../types";
import {
  discover,
  findEmerging,
  findHidden,
  findIgnored,
  findRecurring,
  group,
  prepareExecutiveSummary,
} from "../discovery/opportunityDiscovery";
import { rankByMission, rankOpportunities, scoreOpportunity } from "../ranking/opportunityRanking";
import { isQuickWin, isStrategicBet } from "../scoring/opportunityScoring";
import { opportunitySampleRepository } from "../repositories/sample";
import { listOpportunityRelationships } from "../relationships/opportunityRelationships";

export class OpportunityDiscoveryService {
  discover(filter?: OpportunityDiscoveryFilter): DiscoveredOpportunity[] {
    return rankOpportunities(discover(filter));
  }

  rank(opportunities: DiscoveredOpportunity[]): DiscoveredOpportunity[] {
    return rankOpportunities(opportunities);
  }

  score(id: OpportunityId) {
    return scoreOpportunity(id);
  }

  group(opportunities: DiscoveredOpportunity[], by?: "category" | "executive-filter"): OpportunityGroup[] {
    return group(opportunities, by);
  }

  findEmerging(): DiscoveredOpportunity[] {
    return findEmerging();
  }

  findHidden(): DiscoveredOpportunity[] {
    return findHidden();
  }

  findRecurring(): DiscoveredOpportunity[] {
    return findRecurring();
  }

  findIgnored(): DiscoveredOpportunity[] {
    return findIgnored();
  }

  prepareExecutiveSummary(opportunities?: DiscoveredOpportunity[]): OpportunityExecutiveSummary {
    return prepareExecutiveSummary(opportunities ?? this.discover());
  }

  listOpportunities(filter?: OpportunityDiscoveryFilter): DiscoveredOpportunity[] {
    return this.discover(filter);
  }

  getOpportunity(id: OpportunityId): DiscoveredOpportunity | null {
    const base = opportunitySampleRepository.get(id);
    if (!base) return null;
    return this.discover().find((o) => o.id === id) ?? null;
  }

  listOpportunityRelationships() {
    return listOpportunityRelationships();
  }
}

export const opportunityDiscoveryService = new OpportunityDiscoveryService();

export function discoverOpportunities(filter?: OpportunityDiscoveryFilter) {
  return opportunityDiscoveryService.discover(filter);
}

export function listOpportunities(filter?: OpportunityDiscoveryFilter) {
  return opportunityDiscoveryService.listOpportunities(filter);
}

export function getOpportunity(id: OpportunityId) {
  return opportunityDiscoveryService.getOpportunity(id);
}

export function rankOpportunitiesPublic(opportunities: DiscoveredOpportunity[]) {
  return opportunityDiscoveryService.rank(opportunities);
}

export function listQuickWins(): DiscoveredOpportunity[] {
  return opportunityDiscoveryService.discover().filter((o) => isQuickWin(o.score));
}

export function listStrategicBets(): DiscoveredOpportunity[] {
  return opportunityDiscoveryService.discover().filter((o) => isStrategicBet(o.score));
}

export function listMissionOpportunities(missionId: string): DiscoveredOpportunity[] {
  return rankByMission(opportunityDiscoveryService.discover({ missionId }), missionId);
}
