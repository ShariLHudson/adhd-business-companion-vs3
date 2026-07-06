import type { SparkConnection, SparkRelationship } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";

export class RelationshipService {
  constructor(private readonly repo: SparkSampleRepository = sparkSampleRepository) {}

  /** Full ecosystem lineage chain from sample graph. */
  buildLineageRelationship(): SparkRelationship {
    const nodes = this.repo.graphNodes();
    const edges = this.repo.graphEdges();
    const chain: SparkConnection[] = edges.map((edge) => ({
      id: edge.id,
      fromKind: "knowledge",
      fromId: edge.fromId,
      toKind: "knowledge",
      toId: edge.toId,
      relationship: edge.relationship,
      notedAt: new Date().toISOString(),
    }));
    return {
      id: "rel-lineage-sample",
      label: "Research → Customer Result",
      chain,
      summary: nodes.map((n) => n.label).join(" → "),
    };
  }

  connectionsForNode(nodeId: string): SparkConnection[] {
    const edges = this.repo.graphEdges().filter(
      (e) => e.fromId === nodeId || e.toId === nodeId,
    );
    return edges.map((edge) => ({
      id: edge.id,
      fromKind: "knowledge",
      fromId: edge.fromId,
      toKind: "knowledge",
      toId: edge.toId,
      relationship: edge.relationship,
      notedAt: new Date().toISOString(),
    }));
  }
}

export const relationshipService = new RelationshipService();
