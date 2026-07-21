/**
 * Cartography ↔ master work relationships.
 * References canonical Work IDs — never duplicates work content.
 */

import type {
  CanonicalWorkId,
  WorkRelationship,
  WorkRelationshipKind,
  WorkRelationshipSourceEntityType,
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

function edgeKey(e: {
  fromWorkId: string;
  sourceEntityType?: string;
  sourceEntityId?: string;
  toRef: { kind: string; id: string };
  relationship: string;
}): string {
  return [
    e.fromWorkId,
    e.sourceEntityType ?? "work",
    e.sourceEntityId ?? e.fromWorkId,
    e.toRef.kind,
    e.toRef.id,
    e.relationship,
  ].join("::");
}

export function linkWorkRelationship(input: {
  fromWorkId: string;
  toRef: WorkRelationship["toRef"];
  relationship: WorkRelationshipKind;
  note?: string | null;
  sourceEntityType?: WorkRelationshipSourceEntityType;
  sourceEntityId?: string;
}): WorkRelationship {
  const fromWorkId = resolveCanonicalWorkId(input.fromWorkId, {
    adoptIfMissing: true,
  });
  if (!fromWorkId) {
    throw new Error("fromWorkId is required for Cartography relationship");
  }
  let toRef = input.toRef;
  // Cartography node / project refs must not invent a second work body.
  if (toRef.kind === "work") {
    const toWork = resolveCanonicalWorkId(toRef.id, {
      adoptIfMissing: true,
    });
    if (toWork) {
      toRef = { kind: "work", id: toWork };
    }
  }

  const sourceEntityType = input.sourceEntityType ?? "work";
  const sourceEntityId =
    input.sourceEntityId?.trim() ||
    (sourceEntityType === "work" ? fromWorkId : "");

  if (sourceEntityType !== "work" && !sourceEntityId) {
    throw new Error("sourceEntityId is required for group/section relationships");
  }

  const candidate = {
    fromWorkId: fromWorkId as string,
    sourceEntityType,
    sourceEntityId: sourceEntityId || fromWorkId,
    toRef,
    relationship: input.relationship,
  };
  const existing = edges.find((e) => edgeKey(e) === edgeKey(candidate));
  if (existing) return existing;

  const edge: WorkRelationship = {
    id: newEdgeId(),
    fromWorkId: fromWorkId as CanonicalWorkId,
    sourceEntityType,
    sourceEntityId: sourceEntityId || fromWorkId,
    toRef,
    relationship: input.relationship,
    createdAt: nowIso(),
    note: input.note ?? null,
  };
  edges.push(edge);
  return edge;
}

export function unlinkWorkRelationship(relationshipId: string): boolean {
  const idx = edges.findIndex((e) => e.id === relationshipId);
  if (idx < 0) return false;
  edges.splice(idx, 1);
  return true;
}

export function listWorkRelationships(
  workId: string,
  filter?: {
    sourceEntityType?: WorkRelationshipSourceEntityType;
    sourceEntityId?: string;
    targetKind?: WorkRelationship["toRef"]["kind"];
  },
): WorkRelationship[] {
  const canonical = resolveCanonicalWorkId(workId, { adoptIfMissing: true });
  if (!canonical) return [];
  return edges.filter((e) => {
    const onWork =
      e.fromWorkId === canonical ||
      (e.toRef.kind === "work" && e.toRef.id === canonical);
    if (!onWork) return false;
    if (
      filter?.sourceEntityType &&
      (e.sourceEntityType ?? "work") !== filter.sourceEntityType
    ) {
      return false;
    }
    if (
      filter?.sourceEntityId &&
      (e.sourceEntityId ?? e.fromWorkId) !== filter.sourceEntityId
    ) {
      return false;
    }
    if (filter?.targetKind && e.toRef.kind !== filter.targetKind) return false;
    return true;
  });
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
