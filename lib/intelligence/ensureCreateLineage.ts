/**
 * Auto-lineage on Create / Work launch (Prompt 141).
 * Links only from explicit contract fields — never from title similarity.
 */

import { linkWorkRelationship } from "@/lib/universalWorkEngine/cartography/workRelationships";
import type {
  WorkRelationship,
  WorkRelationshipKind,
  WorkRelationshipTargetType,
} from "@/lib/universalWorkEngine/types";
import type { RelationshipEdgeSource } from "./relationshipIntegrity";
import { canCreateRelationshipEdge } from "./relationshipIntegrity";

export type CreateLineageRef = {
  kind: WorkRelationshipTargetType;
  id: string;
  relationship: WorkRelationshipKind;
  note?: string | null;
};

export type EnsureCreateLineageInput = {
  workId: string;
  refs: readonly CreateLineageRef[];
  /** Must be a trusted edge source (typically creation_flow_lineage). */
  edgeSource?: RelationshipEdgeSource;
};

export type EnsureCreateLineageResult = {
  linked: WorkRelationship[];
  skipped: Array<{ id: string; reason: string }>;
};

/**
 * Attach lineage edges for a newly created Work.
 * Dedupes via linkWorkRelationship; skips empty ids; refuses untrusted sources.
 */
export function ensureCreateLineage(
  input: EnsureCreateLineageInput,
): EnsureCreateLineageResult {
  const edgeSource = input.edgeSource ?? "creation_flow_lineage";
  const linked: WorkRelationship[] = [];
  const skipped: Array<{ id: string; reason: string }> = [];

  if (!canCreateRelationshipEdge(edgeSource)) {
    return {
      linked: [],
      skipped: input.refs.map((r) => ({
        id: r.id,
        reason: "untrusted_edge_source",
      })),
    };
  }

  const workId = input.workId?.trim();
  if (!workId) {
    return {
      linked: [],
      skipped: input.refs.map((r) => ({
        id: r.id,
        reason: "missing_work_id",
      })),
    };
  }

  for (const ref of input.refs) {
    const id = ref.id?.trim();
    if (!id) {
      skipped.push({ id: "", reason: "empty_target_id" });
      continue;
    }
    if (ref.kind === "work" && id === workId) {
      skipped.push({ id, reason: "self_link" });
      continue;
    }
    const edge = linkWorkRelationship({
      fromWorkId: workId,
      toRef: { kind: ref.kind, id },
      relationship: ref.relationship,
      note: ref.note ?? null,
      edgeSource,
    });
    linked.push(edge);
  }

  return { linked, skipped };
}

/** Build lineage refs from explicit launch-contract style fields. */
export function lineageRefsFromExplicitContext(ctx: {
  projectId?: string | null;
  cartographyNodeId?: string | null;
  blueprintId?: string | null;
  relatedWorkId?: string | null;
  taskId?: string | null;
  researchRecordId?: string | null;
}): CreateLineageRef[] {
  const refs: CreateLineageRef[] = [];
  if (ctx.projectId?.trim()) {
    refs.push({
      kind: "project",
      id: ctx.projectId.trim(),
      relationship: "part_of",
      note: "Project connection",
    });
  }
  if (ctx.cartographyNodeId?.trim()) {
    refs.push({
      kind: "cartography_node",
      id: ctx.cartographyNodeId.trim(),
      relationship: "visualizes",
      note: "Cartography node",
    });
  }
  if (ctx.blueprintId?.trim()) {
    refs.push({
      kind: "blueprint",
      id: ctx.blueprintId.trim(),
      relationship: "implements",
      note: "Blueprint",
    });
  }
  if (ctx.taskId?.trim()) {
    refs.push({
      kind: "task",
      id: ctx.taskId.trim(),
      relationship: "related_to",
      note: "Task provenance",
    });
  }
  if (ctx.researchRecordId?.trim()) {
    refs.push({
      kind: "research",
      id: ctx.researchRecordId.trim(),
      relationship: "informs",
      note: "Research",
    });
  }
  if (ctx.relatedWorkId?.trim()) {
    refs.push({
      kind: "work",
      id: ctx.relatedWorkId.trim(),
      relationship: "related_to",
      note: "Connected work",
    });
  }
  return refs;
}
