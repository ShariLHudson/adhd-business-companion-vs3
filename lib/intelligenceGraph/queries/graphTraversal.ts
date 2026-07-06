import type { GraphCluster, GraphNode, GraphPath, GraphRelationship } from "../types";
import { intelligenceGraphSampleRepository } from "../repositories/sample";

function allEdgesFor(nodeId: string): GraphRelationship[] {
  return [
    ...intelligenceGraphSampleRepository.relationshipsFrom(nodeId),
    ...intelligenceGraphSampleRepository.relationshipsTo(nodeId),
  ];
}

function neighborIds(nodeId: string): string[] {
  const ids = new Set<string>();
  for (const e of intelligenceGraphSampleRepository.relationshipsFrom(nodeId)) {
    ids.add(e.toId);
  }
  for (const e of intelligenceGraphSampleRepository.relationshipsTo(nodeId)) {
    ids.add(e.fromId);
  }
  return [...ids];
}

export function findConnectedNodes(
  startId: string,
  depth = 2,
): GraphNode[] {
  const visited = new Set<string>([startId]);
  const queue: { id: string; d: number }[] = [{ id: startId, d: 0 }];
  const nodes: GraphNode[] = [];

  while (queue.length > 0) {
    const { id, d } = queue.shift()!;
    if (d > 0) {
      const node = intelligenceGraphSampleRepository.getNode(id);
      if (node) nodes.push(node);
    }
    if (d >= depth) continue;
    for (const next of neighborIds(id)) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push({ id: next, d: d + 1 });
      }
    }
  }
  return nodes;
}

export function findShortestPath(fromId: string, toId: string): GraphPath | null {
  if (fromId === toId) {
    return { nodeIds: [fromId], edgeIds: [], length: 0 };
  }

  const prev = new Map<string, { nodeId: string; edgeId: string } | null>();
  const queue = [fromId];
  prev.set(fromId, null);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === toId) break;

    for (const e of intelligenceGraphSampleRepository.relationshipsFrom(current)) {
      if (!prev.has(e.toId)) {
        prev.set(e.toId, { nodeId: current, edgeId: e.id });
        queue.push(e.toId);
      }
    }
    for (const e of intelligenceGraphSampleRepository.relationshipsTo(current)) {
      if (!prev.has(e.fromId)) {
        prev.set(e.fromId, { nodeId: current, edgeId: e.id });
        queue.push(e.fromId);
      }
    }
  }

  if (!prev.has(toId)) return null;

  const nodeIds: string[] = [];
  const edgeIds: string[] = [];
  let cur: string | null = toId;
  while (cur) {
    nodeIds.unshift(cur);
    const p = prev.get(cur);
    if (p?.edgeId) edgeIds.unshift(p.edgeId);
    cur = p?.nodeId ?? null;
  }

  return { nodeIds, edgeIds, length: edgeIds.length };
}

export function findClusters(minSize = 3): GraphCluster[] {
  const nodes = intelligenceGraphSampleRepository.listNodes();
  const missionClusters = new Map<string, string[]>();

  for (const n of nodes) {
    for (const m of n.missionIds) {
      missionClusters.set(m, [...(missionClusters.get(m) ?? []), n.id]);
    }
  }

  return [...missionClusters.entries()]
    .filter(([, ids]) => ids.length >= minSize)
    .map(([missionId, nodeIds]) => ({
      id: `cluster-mission-${missionId}`,
      label: `Mission: ${missionId}`,
      nodeIds,
      centerNodeId: nodeIds.find((id) => id.includes("mission")) ?? nodeIds[0],
    }));
}

export function findRelationshipsForNode(nodeId: string): GraphRelationship[] {
  return allEdgesFor(nodeId);
}
