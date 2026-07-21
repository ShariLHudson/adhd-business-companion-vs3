/**
 * Cartography ↔ master work relationships.
 * References canonical Work IDs — never duplicates work content.
 */

import type {
  CanonicalWorkId,
  WorkRelationship,
  WorkRelationshipKind,
} from "../types";
import { resolveCanonicalWorkId } from "../identity/resolveWorkIdentity";

const edges: WorkRelationship[] = [];

function nowIso(): string {
  return new Date().toISOString();
}

function newEdgeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `rel-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `rel-${Date.now().toString(36)}`;
}

export function resetWorkRelationshipsForTests(): void {
  edges.length = 0;
}

export function linkWorkRelationship(input: {
  fromWorkId: string;
  toRef: WorkRelationship["toRef"];
  relationship: WorkRelationshipKind;
  note?: string | null;
}): WorkRelationship {
  const fromWorkId = resolveCanonicalWorkId(input.fromWorkId, {
    adoptIfMissing: true,
  });
  if (!fromWorkId) {
    throw new Error("fromWorkId is required for Cartography relationship");
  }
  // Cartography node / project refs must not invent a second work body.
  if (input.toRef.kind === "work") {
    const toWork = resolveCanonicalWorkId(input.toRef.id, {
      adoptIfMissing: true,
    });
    if (toWork) {
      input = {
        ...input,
        toRef: { kind: "work", id: toWork },
      };
    }
  }
  const edge: WorkRelationship = {
    id: newEdgeId(),
    fromWorkId: fromWorkId as CanonicalWorkId,
    toRef: input.toRef,
    relationship: input.relationship,
    createdAt: nowIso(),
    note: input.note ?? null,
  };
  edges.push(edge);
  return edge;
}

export function listWorkRelationships(
  workId: string,
): WorkRelationship[] {
  const canonical = resolveCanonicalWorkId(workId, { adoptIfMissing: true });
  if (!canonical) return [];
  return edges.filter(
    (e) =>
      e.fromWorkId === canonical ||
      (e.toRef.kind === "work" && e.toRef.id === canonical),
  );
}

/** Bridge prior stub: expose work-centric node refs without copying content. */
export function cartographyRefsForWork(workId: string): {
  workId: CanonicalWorkId;
  relationships: WorkRelationship[];
  nodeRefs: Array<{ kind: string; id: string }>;
} {
  const canonical =
    resolveCanonicalWorkId(workId, { adoptIfMissing: true }) ?? workId;
  const relationships = listWorkRelationships(canonical);
  return {
    workId: canonical,
    relationships,
    nodeRefs: [
      { kind: "work", id: canonical },
      ...relationships.map((r) => ({
        kind: r.toRef.kind,
        id: r.toRef.id,
      })),
    ],
  };
}
