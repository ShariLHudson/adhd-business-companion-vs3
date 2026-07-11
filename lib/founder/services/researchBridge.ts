/**
 * Founder bridge — Executive Research Center
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import {
  composeResearchSession,
  composeResearchSessionById,
  getSignificantResearchAlerts,
  researchService,
} from "@/lib/research";
import { getResearchCenterBootstrap } from "@/lib/founder/researchCenter";

export function prepareFounderResearchCenter(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    missionId,
    bootstrap: getResearchCenterBootstrap(),
    principle: researchService.sampleRepository().principle(),
  };
}

export function prepareFounderResearchSession(query: string, missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  const session = composeResearchSession(query);
  return {
    product: "founder" as const,
    missionId,
    session,
    principle: researchService.sampleRepository().principle(),
  };
}

export function prepareFounderResearchSessionById(reportId: string, query?: string) {
  return {
    product: "founder" as const,
    session: composeResearchSessionById(reportId, query),
    principle: researchService.sampleRepository().principle(),
  };
}

export function prepareFounderResearchAlerts() {
  return {
    product: "founder" as const,
    alerts: getSignificantResearchAlerts(),
    principle: researchService.sampleRepository().principle(),
  };
}
