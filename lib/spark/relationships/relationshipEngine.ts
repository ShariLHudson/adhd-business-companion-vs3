import type { SparkConnection, SparkRelationship } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";

export class SparkRelationshipService {
  constructor(private readonly repo: SparkSampleRepository = sparkSampleRepository) {}

  listConnections(): SparkConnection[] {
    return this.repo.connections();
  }

  /** Ecosystem lineage: research → insight → recommendation → feature → campaign → workflow → result */
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    return {
      id: "rel-ecosystem-lineage",
      label: "Research → Future recommendation",
      chain,
      summary: nodes.map((n) => n.label).join(" → "),
      tags: ["lineage", "ecosystem"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
    };
  }

  connectionsForEntity(entityId: string): SparkConnection[] {
    return this.repo
      .connections()
      .filter((c) => c.fromId === entityId || c.toId === entityId);
  }

  relationshipsForEntity(entityId: string): SparkConnection[] {
    const graph = this.repo.graphEdges().filter(
      (e) => e.fromId === entityId || e.toId === entityId,
    );
    return graph.map((edge) => ({
      id: edge.id,
      fromKind: "knowledge",
      fromId: edge.fromId,
      toKind: "knowledge",
      toId: edge.toId,
      relationship: edge.relationship,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
}

export const sparkRelationshipService = new SparkRelationshipService();

/** @deprecated Use sparkRelationshipService */
export const relationshipService = sparkRelationshipService;
