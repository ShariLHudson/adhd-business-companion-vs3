/**
 * Founder bridge — Opportunity Discovery Center
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import {
  composeOpportunityDiscoveryOverview,
  getOpportunityById,
  opportunityDiscoveryService,
} from "@/lib/opportunities/services/opportunityDiscoveryService";
import { getOpportunityCenterBootstrap } from "@/lib/founder/opportunityCenter";

export function prepareFounderOpportunityCenter(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    missionId,
    overview: getOpportunityCenterBootstrap(),
    principle: opportunityDiscoveryService.sampleRepository().principle(),
  };
}

export function prepareFounderOpportunityOverview(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    ...composeOpportunityDiscoveryOverview(),
    missionId,
  };
}

export function prepareFounderOpportunityDetail(opportunityId: string) {
  const opportunity = getOpportunityById(opportunityId);
  return {
    product: "founder" as const,
    opportunity,
    principle: opportunityDiscoveryService.sampleRepository().principle(),
  };
}
