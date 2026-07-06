import { intelligenceGraphService } from "@/lib/intelligenceGraph";
import type { GraphNode, GraphRelationship } from "@/lib/intelligenceGraph/types";

import {
  DIDNT_KNOW_THAT,
  DISCOVERY_INSIGHTS,
  ECOSYSTEM_AREAS,
  EXECUTIVE_GRAPH_PRINCIPLE,
  NODE_ENRICHMENTS,
  SUGGESTED_GRAPH_SEARCHES,
} from "../../sample/discoveryData";
import type { GraphBoardPerspective, GraphNodeExecutiveDetail, KnowledgePathwayStep } from "../../types";

export const executiveGraphSampleRepository = {
  principle: () => EXECUTIVE_GRAPH_PRINCIPLE,
  suggestedSearches: () => SUGGESTED_GRAPH_SEARCHES,
  discoveryInsights: () => DISCOVERY_INSIGHTS,
  didntKnowThat: () => DIDNT_KNOW_THAT,
  ecosystemAreas: () => ECOSYSTEM_AREAS,
};

const DEFAULT_BOARD: GraphBoardPerspective[] = [
  { id: "ceo", label: "CEO", whyItMatters: "Strategic alignment.", concerns: "Bandwidth and focus.", opportunity: "Compound leverage across ecosystem." },
  { id: "customer", label: "Customer", whyItMatters: "Member outcome.", concerns: "Warmth over features.", opportunity: "Testimonials and return stories." },
  { id: "marketing", label: "Marketing", whyItMatters: "Narrative coherence.", concerns: "Disconnected campaigns.", opportunity: "One restart story arc." },
  { id: "adhd", label: "ADHD Experience", whyItMatters: "Cognitive load.", concerns: "Guilt language.", opportunity: "Permission-first journeys." },
];

function nodesFromRelationships(
  relationships: GraphRelationship[],
  direction: "from" | "to",
  nodeId: string,
): GraphNode[] {
  const ids = new Set(
    relationships
      .filter((r) => (direction === "from" ? r.toId === nodeId : r.fromId === nodeId))
      .map((r) => (direction === "from" ? r.fromId : r.toId)),
  );
  return [...ids]
    .map((id) => intelligenceGraphService.getNode(id))
    .filter((n): n is GraphNode => Boolean(n));
}

export function buildNodeExecutiveDetail(nodeId: string): GraphNodeExecutiveDetail | null {
  const node = intelligenceGraphService.getNode(nodeId);
  if (!node) return null;

  const relationships = intelligenceGraphService.relationshipsForNode(nodeId);
  const enrichment = NODE_ENRICHMENTS[nodeId];
  const dependsOn = nodesFromRelationships(relationships, "from", nodeId);
  const influences = nodesFromRelationships(relationships, "to", nodeId);

  const pathway: KnowledgePathwayStep[] = (enrichment?.pathway ?? [
    { id: "p-1", label: "Created", summary: node.summary },
    { id: "p-2", label: "Today", summary: `Active ${node.kind} in the ecosystem graph.` },
  ]).map((step, i) => ({
    id: `path-${nodeId}-${i}`,
    label: step.label,
    nodeId: step.nodeId,
    summary: step.summary,
  }));

  return {
    node,
    whyItExists: enrichment?.whyItExists ?? node.summary,
    whyItMatters: enrichment?.whyItMatters ?? "Connected node in Visual Spark Studios intelligence graph.",
    dependsOn,
    influences,
    opportunities: enrichment?.opportunities ?? ["Explore connected opportunities in graph."],
    risks: enrichment?.risks ?? ["Review dependencies before changing scope."],
    whatShouldHappenNext: enrichment?.whatShouldHappenNext ?? "Review connections and choose one next action.",
    relationships,
    pathway,
    boardPerspectives: DEFAULT_BOARD.map((b) => ({
      ...b,
      whyItMatters: `${b.whyItMatters} ${node.title} affects ${relationships.length} relationships.`,
    })),
    boardSummary: enrichment?.boardSummary ?? "Review node in context of mission priority.",
  };
}

export function filterInsightsForQuery(query: string) {
  const q = query.toLowerCase();
  if (q.includes("listening")) {
    return DISCOVERY_INSIGHTS.filter((i) => i.nodeIds.some((id) => id.includes("listening") || id.includes("workshop")));
  }
  if (q.includes("founder") || q.includes("postcraft")) {
    return DISCOVERY_INSIGHTS.filter((i) => i.kind === "cross-product");
  }
  return DISCOVERY_INSIGHTS.slice(0, 3);
}

export function filterDidntKnowForQuery(query: string) {
  const q = query.toLowerCase();
  if (q.includes("customer") || q.includes("solve")) {
    return DIDNT_KNOW_THAT.filter((i) => i.id === "idk-1" || i.id === "idk-4");
  }
  if (q.includes("research")) {
    return DIDNT_KNOW_THAT.filter((i) => i.id === "idk-2");
  }
  if (q.includes("decision")) {
    return DIDNT_KNOW_THAT.filter((i) => i.id === "idk-3");
  }
  return DIDNT_KNOW_THAT.slice(0, 2);
}
