// Founder Ecosystem — Phase 6 Memory Queries.
// Read helpers over the relationship graph. "Show me everything related to X",
// "what decisions affect this project?", etc. Pure.

import type { ID } from "../models";
import type {
  GraphEdge,
  GraphNode,
  NodeType,
  RelationshipGraph,
  RelationType,
} from "./memoryTypes";

export function getNode(g: RelationshipGraph, id: ID): GraphNode | undefined {
  return g.nodes.find((n) => n.id === id);
}

export function edgesOf(g: RelationshipGraph, id: ID): GraphEdge[] {
  return g.edges.filter((e) => e.from === id || e.to === id);
}

/** Direct neighbours of a node, with the connecting edge + direction. */
export function neighbors(
  g: RelationshipGraph,
  id: ID,
): { node: GraphNode; edge: GraphEdge; direction: "out" | "in" }[] {
  const out: { node: GraphNode; edge: GraphEdge; direction: "out" | "in" }[] = [];
  for (const e of edgesOf(g, id)) {
    const otherId = e.from === id ? e.to : e.from;
    const node = getNode(g, otherId);
    if (node) out.push({ node, edge: e, direction: e.from === id ? "out" : "in" });
  }
  return out;
}

/** Neighbours filtered to a node type. */
export function relatedTo(
  g: RelationshipGraph,
  id: ID,
  type?: NodeType,
): GraphNode[] {
  return neighbors(g, id)
    .map((n) => n.node)
    .filter((n) => !type || n.type === type);
}

/** "Show me everything related to X" — BFS out to `depth`. */
export function everythingRelatedTo(
  g: RelationshipGraph,
  id: ID,
  depth = 2,
): GraphNode[] {
  const seen = new Set<ID>([id]);
  let frontier = [id];
  const collected: GraphNode[] = [];
  for (let d = 0; d < depth; d++) {
    const next: ID[] = [];
    for (const cur of frontier) {
      for (const { node } of neighbors(g, cur)) {
        if (seen.has(node.id)) continue;
        seen.add(node.id);
        collected.push(node);
        next.push(node.id);
      }
    }
    frontier = next;
  }
  return collected;
}

// Edges pointing INTO `projectId` of a given relation, returning the source nodes.
function sourcesInto(
  g: RelationshipGraph,
  projectId: ID,
  rel: RelationType,
  nodeType: NodeType,
): GraphNode[] {
  return g.edges
    .filter((e) => e.to === projectId && e.type === rel)
    .map((e) => getNode(g, e.from))
    .filter((n): n is GraphNode => Boolean(n) && n!.type === nodeType);
}

export const decisionsAffecting = (g: RelationshipGraph, projectId: ID) =>
  sourcesInto(g, projectId, "affects", "decision");

export const documentsForProject = (g: RelationshipGraph, projectId: ID) =>
  sourcesInto(g, projectId, "belongs-to", "document");

export const tasksForProject = (g: RelationshipGraph, projectId: ID) =>
  sourcesInto(g, projectId, "belongs-to", "task");

export const opportunitiesFromProject = (g: RelationshipGraph, projectId: ID) =>
  sourcesInto(g, projectId, "came-from", "opportunity");

/** "What have I accomplished this month?" — win nodes since a cutoff. */
export function accomplishedSince(
  g: RelationshipGraph,
  since: string,
): GraphNode[] {
  return g.nodes.filter(
    (n) => n.type === "win" && (n.lastActivity ?? n.createdAt ?? "") >= since,
  );
}

/** A subgraph centred on a node — handy for visualization. */
export function subgraph(
  g: RelationshipGraph,
  id: ID,
  depth = 1,
): RelationshipGraph {
  const center = getNode(g, id);
  const nodes = center ? [center, ...everythingRelatedTo(g, id, depth)] : [];
  const ids = new Set(nodes.map((n) => n.id));
  return {
    nodes,
    edges: g.edges.filter((e) => ids.has(e.from) && ids.has(e.to)),
  };
}
