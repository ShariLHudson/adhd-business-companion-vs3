import type { BusinessExperiment, RediscoveryResult, RecallFilter } from "../types";
import { intelligenceGraphService } from "@/lib/intelligenceGraph";
import { institutionalMemorySampleRepository } from "../repositories/sample";
import { findLessons } from "../lessons/lessonEngine";
import { listAllDecisions } from "../decisions/decisionHistory";

function matchesFilter(memory: ReturnType<typeof institutionalMemorySampleRepository.get>, filter: RecallFilter): boolean {
  if (!memory) return false;
  if (filter.kind && memory.kind !== filter.kind) return false;
  if (filter.missionId && !memory.relatedMissions.includes(filter.missionId)) return false;
  if (filter.search) {
    const q = filter.search.toLowerCase();
    const hay = `${memory.title} ${memory.description} ${memory.context}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function rediscover(query: string): RediscoveryResult {
  const q = query.toLowerCase();
  let memories = institutionalMemorySampleRepository.list();

  if (q.includes("before") || q.includes("thought about")) {
    // broad rediscovery
    if (q.includes("listening") || q.includes("restart")) {
      memories = memories.filter(
        (m) =>
          m.relatedMissions.includes("listening-rooms") ||
          m.title.toLowerCase().includes("listening") ||
          m.title.toLowerCase().includes("restart"),
      );
    } else if (q.includes("decision fatigue") || q.includes("workshop")) {
      memories = memories.filter(
        (m) =>
          m.relatedWorkshops.length > 0 ||
          m.title.toLowerCase().includes("workshop") ||
          m.title.toLowerCase().includes("fatigue"),
      );
    }
  } else if (q.includes("decision fatigue")) {
    memories = memories.filter((m) =>
      m.lessonsLearned.some((l) => l.toLowerCase().includes("fatigue")) ||
      m.title.toLowerCase().includes("fatigue"),
    );
  } else if (q.includes("listening")) {
    memories = institutionalMemorySampleRepository.forMission("listening-rooms");
  }

  const graphQuery = intelligenceGraphService.query(
    q.includes("listening") ? "Show everything related to Listening Rooms" : query,
  );

  const narrative = [
    `Found ${memories.length} institutional memories related to your question.`,
    memories.length > 0
      ? `Strongest connection: ${memories[0].title}.`
      : "No exact match — try a mission name or topic.",
    graphQuery.nodes.length > 0
      ? `${graphQuery.nodes.length} connected items in the Intelligence Graph.`
      : "",
  ].filter(Boolean);

  return {
    query,
    memories,
    relatedGraphNodeIds: graphQuery.nodes.map((n) => n.id),
    pastDecisions: listAllDecisions().filter((d) => memories.some((m) => m.id === d.id)),
    lessons: findLessons().filter((l) => memories.some((m) => m.id === l.id)),
    experiments: memories.filter((m): m is BusinessExperiment => m.kind === "experiment"),
    narrative,
  };
}

export function findSimilar(memoryId: string): ReturnType<typeof institutionalMemorySampleRepository.list> {
  const source = institutionalMemorySampleRepository.get(memoryId);
  if (!source) return [];

  return institutionalMemorySampleRepository.list().filter((m) => {
    if (m.id === memoryId) return false;
    const sharedMission = m.relatedMissions.some((id) => source.relatedMissions.includes(id));
    const sharedGraph = m.graphNodeIds.some((id) => source.graphNodeIds.includes(id));
    return sharedMission || sharedGraph;
  });
}

export function recall(filter: RecallFilter = {}) {
  return institutionalMemorySampleRepository.list().filter((m) => matchesFilter(m, filter));
}
