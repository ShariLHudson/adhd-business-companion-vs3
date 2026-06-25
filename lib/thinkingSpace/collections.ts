/**
 * Thought Collections — many-to-many overlays for the Living Intelligence Graph™.
 */

import { getBrainDumps, updateBrainDump } from "@/lib/companionStore";
import { safeLocalStorageSet } from "@/lib/companionStorageRecovery";
import {
  assignNextColorId,
  catalogEntryForLabel,
  resolveCollectionVisual,
} from "./collectionColors";
import type { ThoughtCollection } from "./types";

const STORAGE_KEY = "companion-thought-collections-v1";
const VISUAL_SYNC_KEY = "companion-collection-visual-sync-v2";

/** Avoid retrying visual sync on every read when storage is full. */
let visualSyncAttempted = false;

function newCollectionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `col-${crypto.randomUUID()}`;
  }
  return `col-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function read(): ThoughtCollection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is ThoughtCollection =>
        c &&
        typeof c.id === "string" &&
        typeof c.label === "string" &&
        typeof c.createdAt === "string",
    );
  } catch {
    return [];
  }
}

function write(collections: ThoughtCollection[]): ThoughtCollection[] {
  if (typeof window === "undefined") return collections;
  safeLocalStorageSet(STORAGE_KEY, JSON.stringify(collections));
  return collections;
}

export function getThoughtCollections(): ThoughtCollection[] {
  const raw = read().sort((a, b) => a.label.localeCompare(b.label));
  return backfillCollectionVisuals(raw);
}

/** Sync icons/colors — re-applies catalog for known labels (fixes stale localStorage). */
function backfillCollectionVisuals(
  collections: ThoughtCollection[],
): ThoughtCollection[] {
  const forceSync =
    typeof window !== "undefined" &&
    !visualSyncAttempted &&
    typeof window.localStorage?.getItem === "function" &&
    !window.localStorage.getItem(VISUAL_SYNC_KEY);

  let changed = false;
  const next = collections.map((c) => {
    const catalog = catalogEntryForLabel(c.label);
    const visual = resolveCollectionVisual(c, collections);
    const icon = catalog?.icon ?? visual.icon;
    const colorId = catalog?.colorId ?? visual.colorId;

    if (forceSync || !c.icon || !c.colorId) {
      if (c.icon !== icon || c.colorId !== colorId) {
        changed = true;
        return { ...c, icon, colorId };
      }
    }
    return c;
  });

  if (forceSync || changed) {
    visualSyncAttempted = true;
    safeLocalStorageSet(VISUAL_SYNC_KEY, "1");
  }
  if (changed) write(next);
  return changed ? next : collections;
}

export function getThoughtCollectionById(
  id: string,
): ThoughtCollection | undefined {
  return read().find((c) => c.id === id);
}

function visualDefaultsForLabel(
  label: string,
  existing: ThoughtCollection[],
): Pick<ThoughtCollection, "icon" | "colorId"> {
  const catalog = catalogEntryForLabel(label);
  if (catalog) {
    return { icon: catalog.icon, colorId: catalog.colorId };
  }
  return {
    icon: "📂",
    colorId: assignNextColorId(existing),
  };
}

export function createThoughtCollection(input: {
  label: string;
  userCreated?: boolean;
  suggestedByAi?: boolean;
  icon?: string;
  colorId?: string;
}): ThoughtCollection {
  const label = input.label.trim();
  const existing = read();
  const hit = existing.find(
    (c) => c.label.toLowerCase() === label.toLowerCase(),
  );
  if (hit) return hit;

  const defaults = visualDefaultsForLabel(label, existing);

  const collection: ThoughtCollection = {
    id: newCollectionId(),
    label,
    createdAt: new Date().toISOString(),
    userCreated: input.userCreated ?? true,
    suggestedByAi: input.suggestedByAi,
    icon: input.icon ?? defaults.icon,
    colorId: input.colorId ?? defaults.colorId,
  };
  write([...existing, collection]);
  return collection;
}

export function renameThoughtCollection(
  id: string,
  label: string,
): ThoughtCollection | null {
  const trimmed = label.trim();
  if (!trimmed) return null;
  const collections = read();
  const target = collections.find((c) => c.id === id);
  if (!target) return null;

  const catalog = catalogEntryForLabel(trimmed);
  const next = collections.map((c) => {
    if (c.id !== id) return c;
    const visual = resolveCollectionVisual({
      ...c,
      label: trimmed,
      icon: catalog?.icon ?? c.icon,
      colorId: catalog?.colorId ?? c.colorId,
    });
    return {
      ...c,
      label: trimmed,
      userCreated: true,
      icon: visual.icon,
      colorId: visual.colorId,
    };
  });
  write(next);
  return next.find((c) => c.id === id) ?? null;
}

export function updateThoughtCollectionVisual(
  id: string,
  patch: { icon?: string; colorId?: string },
): ThoughtCollection | null {
  const next = read().map((c) =>
    c.id === id ? { ...c, ...patch, userCreated: true } : c,
  );
  write(next);
  return next.find((c) => c.id === id) ?? null;
}

function reassignThoughtsOnCollectionMerge(
  targetId: string,
  sourceId: string,
): void {
  for (const thought of getBrainDumps()) {
    if (thought.collectionId === sourceId) {
      updateBrainDump(thought.id, { collectionId: targetId });
    }
    const legacy = thought.collectionIds ?? [];
    if (legacy.includes(sourceId)) {
      const next = [
        ...new Set(
          legacy.map((cid) => (cid === sourceId ? targetId : cid)),
        ),
      ];
      updateBrainDump(thought.id, {
        collectionId: next[0],
        collectionIds: undefined,
      });
    }
  }
}

export function mergeThoughtCollections(
  targetId: string,
  sourceId: string,
): ThoughtCollection | null {
  const collections = read();
  const target = collections.find((c) => c.id === targetId);
  const source = collections.find((c) => c.id === sourceId);
  if (!target || !source || targetId === sourceId) return null;

  const merged: ThoughtCollection = {
    ...target,
    mergedFrom: [...(target.mergedFrom ?? []), sourceId],
  };
  const next = collections
    .filter((c) => c.id !== sourceId)
    .map((c) => (c.id === targetId ? merged : c));
  write(next);
  reassignThoughtsOnCollectionMerge(targetId, sourceId);
  return merged;
}

export function deleteThoughtCollection(id: string): void {
  write(read().filter((c) => c.id !== id));
  for (const thought of getBrainDumps()) {
    if (thought.collectionId === id) {
      updateBrainDump(thought.id, { collectionId: undefined });
    }
    const legacy = (thought.collectionIds ?? []).filter((cid) => cid !== id);
    if (legacy.length !== (thought.collectionIds?.length ?? 0)) {
      updateBrainDump(thought.id, {
        collectionId: legacy[0],
        collectionIds: undefined,
      });
    }
  }
}

export { resolveCollectionVisual } from "./collectionColors";
