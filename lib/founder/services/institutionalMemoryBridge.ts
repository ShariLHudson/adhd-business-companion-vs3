/**
 * Optional Founder bridge — Institutional Memory without UI wiring.
 */
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import {
  institutionalMemoryService,
  rediscoverMemory,
  type BusinessReasoning,
  type InstitutionalMemory,
  type RediscoveryResult,
} from "@/lib/institutionalMemory";
import { intelligenceGraphService } from "@/lib/intelligenceGraph";

export function getFounderInstitutionalMemoryBundle(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  const memories = institutionalMemoryService.sampleRepository().forMission(missionId);
  const decisions = institutionalMemoryService.listDecisions().filter((d) =>
    d.relatedMissions.includes(missionId),
  );
  const lessons = institutionalMemoryService.findLessons({ missionId });
  const graph = intelligenceGraphService.missionView(missionId);
  const graphNodeCount =
    graph.research.length +
    graph.customerPain.length +
    graph.content.length +
    graph.workshops.length +
    graph.decisions.length +
    graph.lessons.length +
    (graph.missionNode ? 1 : 0);

  return {
    product: "founder" as const,
    missionId,
    memoryCount: memories.length,
    decisions,
    lessons,
    lessonAnalysis: institutionalMemoryService.analyzeLessons(lessons),
    graphNodeCount,
    timeline: institutionalMemoryService.ecosystemTimeline(12),
    integrity: institutionalMemoryService.relationshipIntegrity(),
  };
}

export function founderRecallDecisionHistory(decisionId = "mem-decision-invest-restart"): BusinessReasoning | null {
  return institutionalMemoryService.findBusinessReasoning(decisionId);
}

export function founderRediscover(query: string): RediscoveryResult {
  return rediscoverMemory(query);
}

export function founderMissionMemories(missionId: string = DEFAULT_ACTIVE_MISSION_ID): InstitutionalMemory[] {
  return institutionalMemoryService.sampleRepository().forMission(missionId);
}

export function founderProductEvolution(productId = "listening-rooms") {
  return institutionalMemoryService.productEvolutionSummary(productId);
}
