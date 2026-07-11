/** Executive Intelligence Graph — Founder Studio visual brain. */

import type { GraphNode, GraphQueryResult, GraphRelationship } from "@/lib/intelligenceGraph/types";

export type GraphDiscoveryKind =
  | "hidden-relationship"
  | "unexpected-pattern"
  | "duplicate-work"
  | "missed-opportunity"
  | "disconnected-idea"
  | "research-gap"
  | "needs-attention"
  | "cross-product";

export type GraphDiscoveryInsight = {
  id: string;
  kind: GraphDiscoveryKind;
  title: string;
  summary: string;
  nodeIds: string[];
};

export type DidntKnowThatInsight = {
  id: string;
  headline: string;
  explanation: string;
  nodeIds: string[];
};

export type GraphBoardPerspective = {
  id: string;
  label: string;
  whyItMatters: string;
  concerns: string;
  opportunity: string;
};

export type KnowledgePathwayStep = {
  id: string;
  label: string;
  nodeId?: string;
  summary: string;
};

export type SparkEcosystemArea = {
  id: string;
  label: string;
  summary: string;
  nodeCount: number;
  highlightNodeIds: string[];
  direction: "strong" | "growing" | "needs-attention" | "stable";
};

export type GraphNodeExecutiveDetail = {
  node: GraphNode;
  whyItExists: string;
  whyItMatters: string;
  dependsOn: GraphNode[];
  influences: GraphNode[];
  opportunities: string[];
  risks: string[];
  whatShouldHappenNext: string;
  relationships: GraphRelationship[];
  pathway: KnowledgePathwayStep[];
  boardPerspectives: GraphBoardPerspective[];
  boardSummary: string;
};

export type GraphSuggestedSearch = {
  id: string;
  phrase: string;
};

export type ExecutiveGraphBootstrap = {
  suggestedSearches: GraphSuggestedSearch[];
  featuredNodeId: string;
  ecosystemAreas: SparkEcosystemArea[];
  discoveryInsights: GraphDiscoveryInsight[];
  didntKnowThat: DidntKnowThatInsight[];
};

export type ExecutiveGraphSessionView = {
  product: "founder";
  query: string;
  result: GraphQueryResult;
  discoveryInsights: GraphDiscoveryInsight[];
  didntKnowThat: DidntKnowThatInsight[];
  generatedAt: string;
};

export type ExecutiveGraphNodeView = {
  product: "founder";
  detail: GraphNodeExecutiveDetail;
  generatedAt: string;
};
