/**
 * 049 — Relationship Registry (platform service)
 * Every asset records parent, contributors, supports, feeds, depends_on, status.
 * One living graph — never orphaned documents.
 */

import type {
  AssetLifecycleStatus,
  AssetRelationshipCard,
  CreationRelationKind,
  RelationshipEdge,
  RelationshipEntityKind,
} from "./types";

const EDGE_KEY = "companion-creation-relationship-edges-v1";
const CARD_KEY = "companion-creation-relationship-cards-v1";

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function readJson<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJson<T>(key: string, rows: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(rows));
  } catch {
    /* quota */
  }
}

export function listRelationshipEdges(creationId?: string): RelationshipEdge[] {
  const all = readJson<RelationshipEdge>(EDGE_KEY);
  return creationId
    ? all.filter((e) => e.creationId === creationId)
    : all;
}

export function listAssetRelationshipCards(
  creationId?: string,
): AssetRelationshipCard[] {
  const all = readJson<AssetRelationshipCard>(CARD_KEY);
  return creationId
    ? all.filter((c) => c.creationId === creationId)
    : all;
}

export function getAssetRelationshipCard(
  assetInstanceKey: string,
): AssetRelationshipCard | null {
  return (
    readJson<AssetRelationshipCard>(CARD_KEY).find(
      (c) => c.assetInstanceKey === assetInstanceKey,
    ) ?? null
  );
}

export function upsertRelationshipEdge(
  input: Omit<RelationshipEdge, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
  },
): RelationshipEdge {
  const now = new Date().toISOString();
  const all = readJson<RelationshipEdge>(EDGE_KEY);
  const existing = all.find(
    (e) =>
      e.creationId === input.creationId &&
      e.fromKind === input.fromKind &&
      e.fromId === input.fromId &&
      e.relation === input.relation &&
      e.toKind === input.toKind &&
      e.toId === input.toId,
  );
  if (existing) {
    const next = { ...existing, ...input, id: existing.id, updatedAt: now };
    writeJson(
      EDGE_KEY,
      all.map((e) => (e.id === existing.id ? next : e)),
    );
    return next;
  }
  const edge: RelationshipEdge = {
    id: input.id ?? newId("rel"),
    creationId: input.creationId,
    fromKind: input.fromKind,
    fromId: input.fromId,
    relation: input.relation,
    toKind: input.toKind,
    toId: input.toId,
    label: input.label,
    createdAt: now,
    updatedAt: now,
  };
  writeJson(EDGE_KEY, [edge, ...all]);
  return edge;
}

export function upsertAssetRelationshipCard(
  card: Omit<AssetRelationshipCard, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
): AssetRelationshipCard {
  const now = new Date().toISOString();
  const all = readJson<AssetRelationshipCard>(CARD_KEY);
  const existing = all.find(
    (c) => c.assetInstanceKey === card.assetInstanceKey,
  );
  const next: AssetRelationshipCard = {
    ...card,
    createdAt: existing?.createdAt ?? card.createdAt ?? now,
    updatedAt: now,
  };
  writeJson(
    CARD_KEY,
    existing
      ? all.map((c) =>
          c.assetInstanceKey === card.assetInstanceKey ? next : c,
        )
      : [next, ...all],
  );
  return next;
}

/**
 * Register a generated asset into the Relationship Registry + edge graph.
 */
export function registerConnectedAsset(input: {
  creationId: string;
  assetDefId: string;
  label: string;
  assetInstanceKey?: string;
  blueprintId?: string | null;
  projectHomeId?: string | null;
  eventRecordId?: string | null;
  canonicalWorkId?: string | null;
  createdBy: string;
  contributorIds?: readonly string[];
  status?: AssetLifecycleStatus;
  supportsSectionIds?: readonly string[];
  dependsOnAssetIds?: readonly string[];
  feedsAssetIds?: readonly string[];
  conversationIds?: readonly string[];
}): AssetRelationshipCard {
  const key =
    input.assetInstanceKey ??
    `${input.creationId}:${input.assetDefId}`;

  const card = upsertAssetRelationshipCard({
    assetInstanceKey: key,
    assetDefId: input.assetDefId,
    label: input.label,
    creationId: input.creationId,
    blueprintId: input.blueprintId ?? null,
    projectHomeId: input.projectHomeId ?? null,
    eventRecordId: input.eventRecordId ?? null,
    canonicalWorkId: input.canonicalWorkId ?? null,
    createdBy: input.createdBy,
    contributorIds: [...(input.contributorIds ?? [])],
    status: input.status ?? "draft",
    supportsSectionIds: [...(input.supportsSectionIds ?? [])],
    dependsOnAssetIds: [...(input.dependsOnAssetIds ?? [])],
    feedsAssetIds: [...(input.feedsAssetIds ?? [])],
    conversationIds: [...(input.conversationIds ?? [])],
  });

  // Parent creation
  upsertRelationshipEdge({
    creationId: input.creationId,
    fromKind: "asset",
    fromId: key,
    relation: "parent",
    toKind: "creation",
    toId: input.creationId,
    label: "belongs to",
  });

  // Created by
  upsertRelationshipEdge({
    creationId: input.creationId,
    fromKind: "asset",
    fromId: key,
    relation: "created_by",
    toKind: "chamber",
    toId: input.createdBy,
    label: "created by",
  });

  for (const c of input.contributorIds ?? []) {
    upsertRelationshipEdge({
      creationId: input.creationId,
      fromKind: "asset",
      fromId: key,
      relation: "contributor",
      toKind: "chamber",
      toId: c,
      label: "contributor",
    });
  }

  for (const sectionId of input.supportsSectionIds ?? []) {
    upsertRelationshipEdge({
      creationId: input.creationId,
      fromKind: "asset",
      fromId: key,
      relation: "supports",
      toKind: "section",
      toId: sectionId,
      label: "supports",
    });
  }

  for (const dep of input.dependsOnAssetIds ?? []) {
    upsertRelationshipEdge({
      creationId: input.creationId,
      fromKind: "asset",
      fromId: key,
      relation: "depends_on",
      toKind: "asset",
      toId: dep,
      label: "depends on",
    });
  }

  for (const feed of input.feedsAssetIds ?? []) {
    upsertRelationshipEdge({
      creationId: input.creationId,
      fromKind: "asset",
      fromId: key,
      relation: "feeds",
      toKind: "asset",
      toId: feed,
      label: "feeds",
    });
  }

  if (input.projectHomeId) {
    upsertRelationshipEdge({
      creationId: input.creationId,
      fromKind: "asset",
      fromId: key,
      relation: "referenced_by",
      toKind: "project",
      toId: input.projectHomeId,
      label: "tracked by project",
    });
  }

  if (input.blueprintId) {
    upsertRelationshipEdge({
      creationId: input.creationId,
      fromKind: "asset",
      fromId: key,
      relation: "parent",
      toKind: "blueprint",
      toId: input.blueprintId,
      label: "from blueprint",
    });
  }

  return card;
}

/**
 * When a section/field changes, return related assets that may need review.
 */
export function assetsNeedingReviewAfterChange(input: {
  creationId: string;
  changedKind: RelationshipEntityKind;
  changedId: string;
}): AssetRelationshipCard[] {
  const edges = listRelationshipEdges(input.creationId);
  const affectedKeys = new Set<string>();

  for (const e of edges) {
    if (
      e.toKind === input.changedKind &&
      e.toId === input.changedId &&
      (e.relation === "supports" ||
        e.relation === "depends_on" ||
        e.relation === "feeds")
    ) {
      if (e.fromKind === "asset") affectedKeys.add(e.fromId);
    }
    if (
      e.fromKind === input.changedKind &&
      e.fromId === input.changedId &&
      e.toKind === "asset"
    ) {
      affectedKeys.add(e.toId);
    }
  }

  // Section change → cards that support that section
  if (input.changedKind === "section") {
    for (const card of listAssetRelationshipCards(input.creationId)) {
      if (card.supportsSectionIds.includes(input.changedId)) {
        affectedKeys.add(card.assetInstanceKey);
      }
    }
  }

  return listAssetRelationshipCards(input.creationId).filter((c) =>
    affectedKeys.has(c.assetInstanceKey),
  );
}

export function clearRelationshipRegistryForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(EDGE_KEY);
  localStorage.removeItem(CARD_KEY);
}

export type { CreationRelationKind, RelationshipEntityKind };
