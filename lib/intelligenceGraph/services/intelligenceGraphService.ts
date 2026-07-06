import type {
  ContentMemoryView,
  ExecutiveMemoryRecord,
  FounderMemoryView,
  GraphCluster,
  GraphNode,
  GraphPath,
  GraphQueryFilter,
  GraphQueryResult,
  GraphRelationship,
  GraphRelationshipKind,
  GraphTimelineEvent,
  MissionGraphView,
} from "../types";
import {
  buildContentMemoryView,
  buildFounderMemoryView,
  buildMissionGraphView,
  findDecisionHistory,
  findEverythingRelated,
  findRelatedContent,
  findRelatedMissions,
  findRelatedResearch,
  queryGraph,
  workshopsInspiredByCustomerRequests,
} from "../queries/graphQueries";
import {
  findClusters,
  findConnectedNodes,
  findRelationshipsForNode,
  findShortestPath,
} from "../queries/graphTraversal";
import {
  connect,
  createNode,
  findNode,
  findRelationships,
  getMergedNodes,
  getMergedRelationships,
  queryNodes,
} from "./graphStore";
import { ecosystemTimeline, nodeTimeline } from "../timeline/nodeTimeline";
import {
  explainRediscoveredDecision,
  getExecutiveMemory,
  listExecutiveMemory,
} from "../memory/executiveMemory";
import { captureGraphHistorySnapshot, graphGrowthSummary } from "../history/graphHistory";

export class IntelligenceGraphService {
  createNode(...args: Parameters<typeof createNode>) {
    return createNode(...args);
  }

  createRelationship(...args: Parameters<typeof connect>) {
    return connect(...args);
  }

  connect(...args: Parameters<typeof connect>) {
    return connect(...args);
  }

  getNode(id: string) {
    return findNode(id);
  }

  listNodes() {
    return getMergedNodes();
  }

  listRelationships() {
    return getMergedRelationships();
  }

  findRelationships(filter?: Parameters<typeof findRelationships>[0]) {
    return findRelationships(filter);
  }

  findConnectedItems(nodeId: string, depth = 2) {
    return findConnectedNodes(nodeId, depth);
  }

  findShortestPath(fromId: string, toId: string): GraphPath | null {
    return findShortestPath(fromId, toId);
  }

  findClusters(minSize = 3): GraphCluster[] {
    return findClusters(minSize);
  }

  findRelatedContent(missionId: string) {
    return findRelatedContent(missionId);
  }

  findRelatedMissions(missionId: string) {
    return findRelatedMissions(missionId);
  }

  findRelatedResearch(missionId: string) {
    return findRelatedResearch(missionId);
  }

  findDecisionHistory(decisionNodeId: string): GraphQueryResult {
    return findDecisionHistory(decisionNodeId);
  }

  findEverythingRelated(nodeId: string): GraphQueryResult {
    return findEverythingRelated(nodeId);
  }

  query(query: string, filter?: GraphQueryFilter): GraphQueryResult {
    return queryGraph(query, filter);
  }

  find(filter?: GraphQueryFilter): GraphNode[] {
    return queryNodes(filter);
  }

  related(nodeId: string): GraphQueryResult {
    return findEverythingRelated(nodeId);
  }

  timeline(nodeId?: string): GraphTimelineEvent[] {
    if (nodeId) return nodeTimeline(nodeId);
    return ecosystemTimeline();
  }

  memory(decisionNodeId?: string): ExecutiveMemoryRecord | ExecutiveMemoryRecord[] | null {
    if (decisionNodeId) return getExecutiveMemory(decisionNodeId);
    return listExecutiveMemory();
  }

  explainDecision(decisionNodeId: string) {
    return explainRediscoveredDecision(decisionNodeId);
  }

  missionView(missionId: string): MissionGraphView {
    return buildMissionGraphView(missionId);
  }

  contentMemory(contentNodeId: string): ContentMemoryView | null {
    return buildContentMemoryView(contentNodeId);
  }

  founderMemory(): FounderMemoryView {
    return buildFounderMemoryView();
  }

  workshopsFromCustomerVoice() {
    return workshopsInspiredByCustomerRequests();
  }

  relationshipsForNode(nodeId: string): GraphRelationship[] {
    return findRelationshipsForNode(nodeId);
  }

  historySnapshot() {
    return captureGraphHistorySnapshot();
  }

  growthSummary() {
    return graphGrowthSummary();
  }
}

export const intelligenceGraphService = new IntelligenceGraphService();

export function createGraphNode(...args: Parameters<typeof createNode>) {
  return intelligenceGraphService.createNode(...args);
}

export function connectGraph(...args: Parameters<typeof connect>) {
  return intelligenceGraphService.connect(...args);
}

export function queryIntelligenceGraph(query: string, filter?: GraphQueryFilter) {
  return intelligenceGraphService.query(query, filter);
}

export function findGraphRelated(nodeId: string) {
  return intelligenceGraphService.related(nodeId);
}

export function graphTimeline(nodeId?: string) {
  return intelligenceGraphService.timeline(nodeId);
}

export function graphMemory(decisionNodeId?: string) {
  return intelligenceGraphService.memory(decisionNodeId);
}

export type { GraphRelationshipKind };
