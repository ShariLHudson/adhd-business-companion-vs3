/**
 * Optional Founder bridge — Companion Intelligence Graph without UI wiring.
 */
import {
  intelligenceGraphService,
  type MissionGraphView,
  type GraphQueryResult,
} from "@/lib/intelligenceGraph";

import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";

export function getFounderMissionGraph(
  missionId: string = DEFAULT_ACTIVE_MISSION_ID,
): MissionGraphView {
  return intelligenceGraphService.missionView(missionId);
}

export function getFounderDecisionGraph(decisionNodeId = "node-decision-invest-restart"): GraphQueryResult {
  return intelligenceGraphService.findDecisionHistory(decisionNodeId);
}

export function getFounderResearchGraph(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  return intelligenceGraphService.findRelatedResearch(missionId);
}

export function getFounderOpportunityGraph(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  return intelligenceGraphService.find({
    missionId,
    nodeKind: "opportunity",
  });
}

export function getFounderCustomerGraph(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  return intelligenceGraphService.find({
    missionId,
    nodeKind: "customer-feedback",
  });
}

export function getFounderContentGraph(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  return intelligenceGraphService.findRelatedContent(missionId);
}

export function getFounderIntelligenceGraphBundle(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    mission: getFounderMissionGraph(missionId),
    decision: getFounderDecisionGraph(),
    research: getFounderResearchGraph(missionId),
    opportunities: getFounderOpportunityGraph(missionId),
    customers: getFounderCustomerGraph(missionId),
    content: getFounderContentGraph(missionId),
    listeningRooms: intelligenceGraphService.query("Show everything related to Listening Rooms"),
    growth: intelligenceGraphService.growthSummary(),
  };
}
