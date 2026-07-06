import type {
  GraphNode,
  GraphNodeKind,
  GraphQueryFilter,
  GraphRelationship,
  GraphRelationshipKind,
} from "../types";
import { intelligenceGraphSampleRepository } from "../repositories/sample";

const runtimeNodes: GraphNode[] = [];
const runtimeRelationships: GraphRelationship[] = [];

function mergedNodes(): GraphNode[] {
  const byId = new Map<string, GraphNode>();
  for (const n of intelligenceGraphSampleRepository.listNodes()) byId.set(n.id, n);
  for (const n of runtimeNodes) byId.set(n.id, n);
  return [...byId.values()];
}

function mergedRelationships(): GraphRelationship[] {
  const byId = new Map<string, GraphRelationship>();
  for (const r of intelligenceGraphSampleRepository.listRelationships()) byId.set(r.id, r);
  for (const r of runtimeRelationships) byId.set(r.id, r);
  return [...byId.values()];
}

export function createNode(input: {
  kind: GraphNodeKind;
  title: string;
  summary: string;
  missionIds?: string[];
  tags?: string[];
}): GraphNode {
  const now = new Date().toISOString();
  const node: GraphNode = {
    id: `node-${input.kind}-${Date.now()}`,
    kind: input.kind,
    title: input.title,
    summary: input.summary,
    status: "active",
    missionIds: input.missionIds ?? [],
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
    timeline: [
      {
        id: `tl-${Date.now()}-0`,
        nodeId: `node-${input.kind}-${Date.now()}`,
        kind: "created",
        summary: "Node created in graph.",
        occurredAt: now,
      },
    ],
  };
  node.id = `node-${input.kind}-${runtimeNodes.length + 1}`;
  node.timeline[0].nodeId = node.id;
  node.timeline[0].id = `tl-${node.id}-0`;
  runtimeNodes.push(node);
  return node;
}

export function connect(input: {
  fromId: string;
  toId: string;
  kind: GraphRelationshipKind;
  reason: string;
  confidence?: number;
  strength?: number;
}): GraphRelationship | null {
  const nodes = mergedNodes();
  if (!nodes.some((n) => n.id === input.fromId) || !nodes.some((n) => n.id === input.toId)) {
    return null;
  }
  const rel: GraphRelationship = {
    id: `edge-runtime-${runtimeRelationships.length + 1}`,
    fromId: input.fromId,
    toId: input.toId,
    kind: input.kind,
    confidence: input.confidence ?? 70,
    strength: input.strength ?? 70,
    reason: input.reason,
    date: new Date().toISOString(),
    evidence: [],
  };
  runtimeRelationships.push(rel);
  return rel;
}

export function getMergedNodes(): GraphNode[] {
  return mergedNodes();
}

export function getMergedRelationships(): GraphRelationship[] {
  return mergedRelationships();
}

export function findNode(id: string): GraphNode | null {
  return mergedNodes().find((n) => n.id === id) ?? null;
}

export function findRelationships(filter?: {
  fromId?: string;
  toId?: string;
  kind?: GraphRelationshipKind;
}): GraphRelationship[] {
  let rels = mergedRelationships();
  if (filter?.fromId) rels = rels.filter((r) => r.fromId === filter.fromId);
  if (filter?.toId) rels = rels.filter((r) => r.toId === filter.toId);
  if (filter?.kind) rels = rels.filter((r) => r.kind === filter.kind);
  return rels;
}

export function resetRuntimeGraph(): void {
  runtimeNodes.length = 0;
  runtimeRelationships.length = 0;
}

export function queryNodes(filter: GraphQueryFilter = {}): GraphNode[] {
  return mergedNodes().filter((n) => {
    if (filter.nodeKind && n.kind !== filter.nodeKind) return false;
    if (filter.missionId && !n.missionIds.includes(filter.missionId)) return false;
    if (filter.tag && !n.tags.includes(filter.tag)) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.summary.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}
