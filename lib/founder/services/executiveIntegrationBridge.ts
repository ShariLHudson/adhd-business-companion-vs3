/**
 * Founder bridge — Executive Integration Center
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import {
  composeIntegrationCenterView,
  composeIntegrationSearch,
  executiveIntegrationService,
} from "@/lib/executiveIntegration";
import { getIntegrationCenterBootstrap } from "@/lib/founder/integrationCenter";

export function prepareFounderExecutiveIntegrationCenter(
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    bootstrap: getIntegrationCenterBootstrap(),
    center: composeIntegrationCenterView(),
    principle: executiveIntegrationService.sampleRepository().principle(),
  };
}

export function prepareFounderIntegrationSearch(
  query: string,
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    search: composeIntegrationSearch(query),
    principle: executiveIntegrationService.sampleRepository().principle(),
  };
}
