/**
 * Founder bridge — Executive Relationship Intelligence™
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import {
  composeDiscoverySession,
  composeDiscoveryDetail,
  executiveRelationshipIntelligenceService,
} from "@/lib/executiveRelationshipIntelligence";
import { getRelationshipIntelligenceCenterBootstrap } from "@/lib/founder/relationshipIntelligenceCenter";

export function prepareFounderExecutiveRelationshipIntelligence(
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    bootstrap: getRelationshipIntelligenceCenterBootstrap(),
    principle: executiveRelationshipIntelligenceService.sampleRepository().principle(),
  };
}

export function prepareFounderDiscoverySession(
  query: string,
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    session: composeDiscoverySession(query),
    principle: executiveRelationshipIntelligenceService.sampleRepository().principle(),
  };
}

export function prepareFounderDiscoveryDetail(
  discoveryId: string,
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    detail: composeDiscoveryDetail(discoveryId),
    principle: executiveRelationshipIntelligenceService.sampleRepository().principle(),
  };
}
