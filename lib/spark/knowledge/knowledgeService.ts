import type { SparkKnowledgeGraph, SparkKnowledgeItem } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";

export class SparkKnowledgeGraphStore {
  constructor(private readonly repo: SparkSampleRepository = sparkSampleRepository) {}

  getGraph(): SparkKnowledgeGraph {
    return {
      nodes: this.repo.graphNodes(),
      edges: this.repo.graphEdges(),
    };
  }

  neighbors(nodeId: string): SparkKnowledgeGraph {
    const graph = this.getGraph();
    const edgeSet = graph.edges.filter(
      (e) => e.fromId === nodeId || e.toId === nodeId,
    );
    const nodeIds = new Set<string>([nodeId]);
    for (const edge of edgeSet) {
      nodeIds.add(edge.fromId);
      nodeIds.add(edge.toId);
    }
    return {
      nodes: graph.nodes.filter((n) => nodeIds.has(n.id)),
      edges: edgeSet,
    };
  }
}

export const sparkKnowledgeGraphStore = new SparkKnowledgeGraphStore();

export class SparkKnowledgeService {
  constructor(
    private readonly repo: SparkSampleRepository = sparkSampleRepository,
    private readonly graphStore: SparkKnowledgeGraphStore = sparkKnowledgeGraphStore,
  ) {}

  getKnowledgeItems(): SparkKnowledgeItem[] {
    return this.repo.knowledge();
  }

  getGraph(): SparkKnowledgeGraph {
    return this.graphStore.getGraph();
  }
}

export const sparkKnowledgeService = new SparkKnowledgeService();

/** @deprecated Use sparkKnowledgeGraphStore */
export const knowledgeGraph = sparkKnowledgeGraphStore;

/** @deprecated Use sparkKnowledgeService */
export const knowledgeService = sparkKnowledgeService;
