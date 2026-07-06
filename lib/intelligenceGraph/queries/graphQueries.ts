import type {
  ContentMemoryView,
  FounderMemoryView,
  GraphNode,
  GraphNodeKind,
  GraphQueryFilter,
  GraphQueryResult,
  GraphRelationshipKind,
  MissionGraphView,
} from "../types";
import { intelligenceGraphSampleRepository } from "../repositories/sample";
import { findConnectedNodes, findRelationshipsForNode } from "./graphTraversal";

function matchesFilter(node: GraphNode, filter: GraphQueryFilter): boolean {
  if (filter.nodeKind && node.kind !== filter.nodeKind) return false;
  if (filter.missionId && !node.missionIds.includes(filter.missionId)) return false;
  if (filter.tag && !node.tags.includes(filter.tag)) return false;
  if (filter.search) {
    const q = filter.search.toLowerCase();
    if (!node.title.toLowerCase().includes(q) && !node.summary.toLowerCase().includes(q)) {
      return false;
    }
  }
  return true;
}

function nodesByKind(nodes: GraphNode[], kinds: GraphNodeKind[]): GraphNode[] {
  return nodes.filter((n) => kinds.includes(n.kind));
}

export function queryGraph(query: string, filter: GraphQueryFilter = {}): GraphQueryResult {
  const q = query.toLowerCase();
  let nodes = intelligenceGraphSampleRepository.listNodes().filter((n) => matchesFilter(n, filter));

  if (q.includes("listening rooms")) {
    nodes = nodes.filter(
      (n) =>
        n.missionIds.includes("listening-rooms") ||
        n.title.toLowerCase().includes("listening") ||
        n.tags.includes("restart"),
    );
  } else if (q.includes("decision fatigue")) {
    nodes = nodes.filter(
      (n) =>
        n.tags.includes("decision-fatigue") ||
        n.title.toLowerCase().includes("decision fatigue"),
    );
  } else if (q.includes("adhd restart")) {
    nodes = nodes.filter(
      (n) =>
        n.tags.includes("restart") ||
        n.tags.includes("adhd") ||
        n.title.toLowerCase().includes("restart"),
    );
  } else if (q.includes("customer request")) {
    if (q.includes("workshop")) {
      const feedback = intelligenceGraphSampleRepository
        .listNodes()
        .filter((n) => n.kind === "customer-feedback");
      const workshopIds = new Set<string>();
      for (const f of feedback) {
        for (const e of intelligenceGraphSampleRepository.relationshipsFrom(f.id)) {
          if (e.kind === "inspired_by") workshopIds.add(e.toId);
        }
      }
      nodes = intelligenceGraphSampleRepository
        .listNodes()
        .filter((n) => n.kind === "workshop" && workshopIds.has(n.id));
    } else {
      nodes = nodes.filter((n) => n.kind === "customer-feedback");
    }
  } else if (q.includes("research paper")) {
    nodes = nodes.filter((n) => n.kind === "research-paper");
  } else if (q.includes("executive question")) {
    nodes = nodes.filter((n) => n.kind === "executive-question");
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  const relationships = intelligenceGraphSampleRepository
    .listRelationships()
    .filter((r) => nodeIds.has(r.fromId) || nodeIds.has(r.toId));

  if (filter.relationshipKind) {
    return {
      query,
      nodes,
      relationships: relationships.filter((r) => r.kind === filter.relationshipKind),
    };
  }

  return { query, nodes, relationships };
}

export function findEverythingRelated(nodeId: string): GraphQueryResult {
  const start = intelligenceGraphSampleRepository.getNode(nodeId);
  if (!start) {
    return { query: `related:${nodeId}`, nodes: [], relationships: [] };
  }
  const connected = findConnectedNodes(nodeId, 3);
  const nodes = [start, ...connected];
  const nodeIds = new Set(nodes.map((n) => n.id));
  const relationships = intelligenceGraphSampleRepository
    .listRelationships()
    .filter((r) => nodeIds.has(r.fromId) && nodeIds.has(r.toId));

  return { query: `related:${nodeId}`, nodes, relationships };
}

export function findRelatedMissions(missionId: string): GraphNode[] {
  return intelligenceGraphSampleRepository
    .listNodes()
    .filter((n) => n.missionIds.includes(missionId));
}

export function findRelatedResearch(missionId: string): GraphNode[] {
  return findRelatedMissions(missionId).filter((n) =>
    ["research", "research-paper", "research-question", "finding", "pattern"].includes(n.kind),
  );
}

export function findRelatedContent(missionId: string): GraphNode[] {
  return findRelatedMissions(missionId).filter((n) =>
    ["content", "newsletter", "blog", "campaign", "video", "podcast", "lead-magnet"].includes(
      n.kind,
    ),
  );
}

export function findDecisionHistory(decisionNodeId: string): GraphQueryResult {
  const memory = intelligenceGraphSampleRepository.getExecutiveMemory(decisionNodeId);
  const related = findEverythingRelated(decisionNodeId);
  return {
    ...related,
    query: `decision-history:${decisionNodeId}${memory ? `:reconsider=${memory.shouldReconsider}` : ""}`,
  };
}

export function buildMissionGraphView(missionId: string): MissionGraphView {
  const related = findRelatedMissions(missionId);
  const missionNode =
    intelligenceGraphSampleRepository
      .listNodes()
      .find((n) => n.kind === "mission" && n.missionIds.includes(missionId)) ?? null;

  const anchorId = missionNode?.id ?? related[0]?.id;
  const connected = anchorId ? findConnectedNodes(anchorId, 4) : [];
  const all = [...new Map([...related, ...connected].map((n) => [n.id, n])).values()];

  return {
    missionId,
    missionNode: missionNode ?? all.find((n) => n.kind === "mission") ?? null,
    research: nodesByKind(all, ["research", "research-paper", "research-question", "finding"]),
    customerPain: nodesByKind(all, ["customer-feedback"]),
    content: nodesByKind(all, ["content", "newsletter", "blog", "campaign"]),
    courses: nodesByKind(all, ["course"]),
    workshops: nodesByKind(all, ["workshop"]),
    products: nodesByKind(all, ["product", "listening-room", "feature"]),
    funnels: nodesByKind(all, ["ghl-funnel", "campaign"]),
    analytics: nodesByKind(all, ["analytics-event"]),
    decisions: nodesByKind(all, ["decision"]),
    risks: nodesByKind(all, ["risk"]),
    opportunities: nodesByKind(all, ["opportunity"]),
    lessons: nodesByKind(all, ["lesson-learned"]),
  };
}

export function buildContentMemoryView(contentNodeId: string): ContentMemoryView | null {
  const node = intelligenceGraphSampleRepository.getNode(contentNodeId);
  if (!node) return null;

  const rels = findRelationshipsForNode(contentNodeId);
  const neighborIds = new Set<string>();
  for (const r of rels) {
    neighborIds.add(r.fromId === contentNodeId ? r.toId : r.fromId);
  }
  const neighbors = [...neighborIds]
    .map((id) => intelligenceGraphSampleRepository.getNode(id))
    .filter((n): n is GraphNode => !!n);

  const byKind = (kinds: GraphNodeKind[]) => neighbors.filter((n) => kinds.includes(n.kind));

  return {
    contentNodeId,
    whyItExists: node.summary,
    problemSolved: byKind(["customer-feedback", "finding"]),
    researchInspired: byKind(["research-paper", "research", "finding"]),
    missionCreated: byKind(["mission", "listening-room"]),
    campaignsUsed: byKind(["campaign"]),
    funnelsPromoted: byKind(["ghl-funnel"]),
    performance: byKind(["analytics-event", "success"]),
    revenueInfluenced: byKind(["success", "analytics-event"]),
  };
}

export function buildFounderMemoryView(): FounderMemoryView {
  const nodes = intelligenceGraphSampleRepository.listNodes();
  return {
    ideas: nodes.filter((n) => n.kind === "roadmap-item" || n.tags.includes("roadmap")),
    conversations: nodes.filter((n) => n.kind === "companion-conversation"),
    journalEntries: nodes.filter((n) => n.kind === "founder-journal"),
    wins: nodes.filter((n) => n.kind === "success"),
    mistakes: nodes.filter((n) => n.kind === "failure"),
    lessons: nodes.filter((n) => n.kind === "lesson-learned"),
    decisions: nodes.filter((n) => n.kind === "decision"),
    relationships: intelligenceGraphSampleRepository.listRelationships(),
  };
}

export function workshopsInspiredByCustomerRequests(): GraphNode[] {
  return queryGraph("workshop inspired by customer requests").nodes;
}
