/**
 * Founder bridge — Executive Intelligence Graph™ (product layer)
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import {
  composeGraphQuerySession,
  composeNodeExecutiveView,
  executiveIntelligenceGraphService,
} from "@/lib/executiveIntelligenceGraph";
import { getIntelligenceGraphCenterBootstrap } from "@/lib/founder/intelligenceGraphCenter";

export function prepareFounderExecutiveIntelligenceGraph(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    missionId,
    bootstrap: getIntelligenceGraphCenterBootstrap(),
    principle: executiveIntelligenceGraphService.sampleRepository().principle(),
  };
}

export function prepareFounderGraphQuerySession(
  query: string,
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    session: composeGraphQuerySession(query),
    principle: executiveIntelligenceGraphService.sampleRepository().principle(),
  };
}

export function prepareFounderGraphNodeView(
  nodeId: string,
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    view: composeNodeExecutiveView(nodeId),
    principle: executiveIntelligenceGraphService.sampleRepository().principle(),
  };
}
