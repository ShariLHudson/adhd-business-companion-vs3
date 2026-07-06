import type { SparkKnowledgeGraph } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";

export class KnowledgeGraph {
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

export const knowledgeGraph = new KnowledgeGraph();

export class KnowledgeService {
  constructor(
    private readonly repo: SparkSampleRepository = sparkSampleRepository,
    private readonly graph: KnowledgeGraph = knowledgeGraph,
  ) {}

  listKnowledge() {
    return this.repo.knowledge();
  }

  getGraph(): SparkKnowledgeGraph {
    return this.graph.getGraph();
  }
}

export const knowledgeService = new KnowledgeService();
