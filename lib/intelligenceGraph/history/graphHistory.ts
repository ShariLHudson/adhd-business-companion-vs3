import type { GraphNode, GraphRelationship } from "../types";
import { intelligenceGraphSampleRepository } from "../repositories/sample";
import { ecosystemTimeline } from "../timeline/nodeTimeline";

export type GraphHistorySnapshot = {
  capturedAt: string;
  nodeCount: number;
  relationshipCount: number;
  recentEvents: ReturnType<typeof ecosystemTimeline>;
};

export function captureGraphHistorySnapshot(): GraphHistorySnapshot {
  return {
    capturedAt: new Date().toISOString(),
    nodeCount: intelligenceGraphSampleRepository.listNodes().length,
    relationshipCount: intelligenceGraphSampleRepository.listRelationships().length,
    recentEvents: ecosystemTimeline(10),
  };
}

export function graphGrowthSummary(): { nodes: number; edges: number; missions: number } {
  const nodes = intelligenceGraphSampleRepository.listNodes();
  const missions = new Set(nodes.flatMap((n) => n.missionIds));
  return {
    nodes: nodes.length,
    edges: intelligenceGraphSampleRepository.listRelationships().length,
    missions: missions.size,
  };
}

export function recordNodeInHistory(node: GraphNode): GraphNode {
  return node;
}

export function recordRelationshipInHistory(rel: GraphRelationship): GraphRelationship {
  return rel;
}
