import { intelligenceGraphService } from "@/lib/intelligenceGraph";

import {
  buildNodeExecutiveDetail,
  executiveGraphSampleRepository,
  filterDidntKnowForQuery,
  filterInsightsForQuery,
} from "../repositories/sample";
import type {
  ExecutiveGraphBootstrap,
  ExecutiveGraphNodeView,
  ExecutiveGraphSessionView,
} from "../types";

export function getExecutiveGraphBootstrap(): ExecutiveGraphBootstrap {
  return {
    suggestedSearches: executiveGraphSampleRepository.suggestedSearches(),
    featuredNodeId: "node-listening-rooms",
    ecosystemAreas: executiveGraphSampleRepository.ecosystemAreas(),
    discoveryInsights: executiveGraphSampleRepository.discoveryInsights(),
    didntKnowThat: executiveGraphSampleRepository.didntKnowThat(),
  };
}

export function composeGraphQuerySession(query: string): ExecutiveGraphSessionView | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const result = intelligenceGraphService.query(trimmed);
  return {
    product: "founder",
    query: trimmed,
    result,
    discoveryInsights: filterInsightsForQuery(trimmed),
    didntKnowThat: filterDidntKnowForQuery(trimmed),
    generatedAt: new Date().toISOString(),
  };
}

export function composeNodeExecutiveView(nodeId: string): ExecutiveGraphNodeView | null {
  const detail = buildNodeExecutiveDetail(nodeId);
  if (!detail) return null;
  return {
    product: "founder",
    detail,
    generatedAt: new Date().toISOString(),
  };
}

export class ExecutiveIntelligenceGraphService {
  compose(query: string) {
    return composeGraphQuerySession(query);
  }

  composeNode(nodeId: string) {
    return composeNodeExecutiveView(nodeId);
  }

  bootstrap() {
    return getExecutiveGraphBootstrap();
  }

  sampleRepository() {
    return executiveGraphSampleRepository;
  }
}

export const executiveIntelligenceGraphService = new ExecutiveIntelligenceGraphService();
