/**
 * Thought Collection Authority — single source of truth for My Thoughts.
 *
 * Every UI surface reads active collection through this module.
 * `category` / `topic` are AI metadata only — never organization.
 * Virtual cluster IDs (`cluster-*`) are not used for grouping.
 */

import type { BrainDumpEntry } from "@/lib/companionStore";
import { getBrainDumps, updateBrainDump } from "@/lib/companionStore";
import { catalogEntryForLabel, DEFAULT_COLLECTION_CATALOG } from "./collectionColors";
import {
  createThoughtCollection,
  getThoughtCollectionById,
  getThoughtCollections,
} from "./collections";
import { UNCATEGORIZED_COLLECTION_ID } from "./collectionSummaries";
import type { ThoughtCollection } from "./types";

/** Below this — show "Suggested: …" on cards. Never auto-assign. */
export const SUGGESTED_COLLECTION_LOW_CONFIDENCE = 70;

/** Dictionary classify — high confidence suggestion only. */
export const SUGGESTED_COLLECTION_DICTIONARY_CONFIDENCE = 88;

/** AI classify fallback confidence. */
export const SUGGESTED_COLLECTION_AI_CONFIDENCE = 62;

export type ThoughtCollectionSuggestion = {
  label: string;
  confidence: number;
  lowConfidence: boolean;
};

export type ThoughtCollectionAuthority = {
  /** Authoritative active collection id — undefined = uncategorized */
  collectionId: string | undefined;
  collection: ThoughtCollection | null;
  label: string | null;
  previousCollectionId: string | undefined;
  history: string[];
  suggestion: ThoughtCollectionSuggestion | null;
  isUncategorized: boolean;
};

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.filter(Boolean))];
}

/**
 * Migrate legacy `collectionIds[]` → single `collectionId`.
 * Persists once; safe to call on every read.
 */
export function migrateThoughtCollectionFields(
  entry: BrainDumpEntry,
): BrainDumpEntry {
  if (entry.collectionId) {
    if (entry.collectionIds?.length) {
      updateBrainDump(entry.id, { collectionIds: undefined });
      return { ...entry, collectionIds: undefined };
    }
    return entry;
  }

  if (!entry.collectionIds?.length) return entry;

  const [primary, ...rest] = entry.collectionIds;
  const history = uniqueIds([
    ...(entry.collectionHistory ?? []),
    ...rest,
  ]);

  const patch = {
    collectionId: primary,
    collectionIds: undefined,
    collectionHistory: history.length ? history : undefined,
  };
  updateBrainDump(entry.id, patch);
  return { ...entry, ...patch };
}

/** Active collection id — the only field used for grouping. */
export function getActiveCollectionId(
  entry: BrainDumpEntry,
): string | undefined {
  const normalized = migrateThoughtCollectionFields(entry);
  return normalized.collectionId;
}

export function thoughtBelongsToCollectionId(
  entry: BrainDumpEntry,
  collectionId: string,
): boolean {
  if (collectionId === UNCATEGORIZED_COLLECTION_ID) {
    return !getActiveCollectionId(entry);
  }
  return getActiveCollectionId(entry) === collectionId;
}

export function getActiveCollectionForThought(
  entry: BrainDumpEntry,
): ThoughtCollection | null {
  const id = getActiveCollectionId(entry);
  if (!id) return null;
  return getThoughtCollectionById(id) ?? null;
}

export function getActiveCollectionLabel(entry: BrainDumpEntry): string | null {
  const col = getActiveCollectionForThought(entry);
  if (col) return col.label;
  return null;
}

export function getThoughtCollectionSuggestion(
  entry: BrainDumpEntry,
): ThoughtCollectionSuggestion | null {
  const label = entry.suggestedCollection?.trim();
  if (!label) return null;
  const confidence =
    entry.suggestedCollectionConfidence ??
    SUGGESTED_COLLECTION_AI_CONFIDENCE;
  return {
    label,
    confidence,
    lowConfidence: confidence < SUGGESTED_COLLECTION_LOW_CONFIDENCE,
  };
}

/** Full read model — use in UI instead of reading raw entry fields. */
export function resolveThoughtCollectionAuthority(
  entry: BrainDumpEntry,
): ThoughtCollectionAuthority {
  const collectionId = getActiveCollectionId(entry);
  const collection = collectionId
    ? getThoughtCollectionById(collectionId) ?? null
    : null;

  return {
    collectionId,
    collection,
    label: collection?.label ?? null,
    previousCollectionId: entry.previousCollectionId,
    history: entry.collectionHistory ?? [],
    suggestion: getThoughtCollectionSuggestion(entry),
    isUncategorized: !collectionId,
  };
}

/** Map AI taxonomy category → garden-level collection label for suggestions. */
export function collectionLabelFromAiCategory(
  category?: string,
  topic?: string,
): string | null {
  const cat = category?.trim();
  if (cat) {
    const catalog = catalogEntryForLabel(cat);
    if (catalog) return catalog.label;
    return cat;
  }
  const top = topic?.trim();
  if (!top) return null;
  const catalog = catalogEntryForLabel(top);
  return catalog?.label ?? top;
}

export function setThoughtCollectionSuggestion(
  thoughtId: string,
  label: string | null,
  confidence?: number,
): BrainDumpEntry | null {
  const entry = getBrainDumps().find((e) => e.id === thoughtId);
  if (!entry) return null;
  if (!label?.trim()) {
    updateBrainDump(thoughtId, {
      suggestedCollection: undefined,
      suggestedCollectionConfidence: undefined,
    });
    return getBrainDumps().find((e) => e.id === thoughtId) ?? null;
  }
  updateBrainDump(thoughtId, {
    suggestedCollection: label.trim(),
    suggestedCollectionConfidence: confidence,
  });
  return getBrainDumps().find((e) => e.id === thoughtId) ?? null;
}

/** User-confirmed move — updates history, clears suggestion. */
export function moveThoughtToCollection(
  thoughtId: string,
  targetCollectionId: string | null,
): BrainDumpEntry | null {
  const entry = migrateThoughtCollectionFields(
    getBrainDumps().find((e) => e.id === thoughtId) ?? (null as never),
  );
  if (!entry?.id) return null;

  const current = getActiveCollectionId(entry);
  const history = uniqueIds([...(entry.collectionHistory ?? [])]);

  if (current && current !== targetCollectionId) {
    history.push(current);
  }

  if (targetCollectionId === UNCATEGORIZED_COLLECTION_ID || !targetCollectionId) {
    updateBrainDump(thoughtId, {
      collectionId: undefined,
      previousCollectionId: current,
      collectionHistory: history.length ? history : undefined,
      collectionIds: undefined,
      suggestedCollection: undefined,
      suggestedCollectionConfidence: undefined,
      updatedAt: new Date().toISOString(),
    });
  } else {
    updateBrainDump(thoughtId, {
      collectionId: targetCollectionId,
      previousCollectionId: current,
      collectionHistory: history.length ? history : undefined,
      collectionIds: undefined,
      suggestedCollection: undefined,
      suggestedCollectionConfidence: undefined,
      updatedAt: new Date().toISOString(),
    });
  }

  return getBrainDumps().find((e) => e.id === thoughtId) ?? null;
}

export type SaveThoughtCollectionResult =
  | { ok: true; entry: BrainDumpEntry }
  | { ok: false; reason: "unchanged" | "missing-name" | "not-found" | "persist-failed" };

/**
 * Authoritative collection save — resolves picker value, persists collectionId, verifies.
 */
export function saveThoughtCollectionSelection(
  entry: BrainDumpEntry,
  pickerValue: string,
  newCollectionLabel = "",
): SaveThoughtCollectionResult {
  const latest =
    getBrainDumps().find((e) => e.id === entry.id) ?? entry;
  const normalized = migrateThoughtCollectionFields(latest);

  if (!isCollectionSelectionDirty(normalized, pickerValue, newCollectionLabel)) {
    return { ok: true, entry: normalized };
  }

  const targetId = resolveCollectionIdFromPicker(
    pickerValue,
    newCollectionLabel,
  );
  if (targetId === undefined) {
    return { ok: false, reason: "missing-name" };
  }

  const updated = moveThoughtToCollection(normalized.id, targetId);
  if (!updated) {
    return { ok: false, reason: "not-found" };
  }

  const persisted = getBrainDumps().find((e) => e.id === normalized.id);
  if (!persisted) {
    return { ok: false, reason: "persist-failed" };
  }

  const persistedId = getActiveCollectionId(persisted);
  const targetMatches =
    (targetId === null && persistedId === undefined) ||
    (targetId !== null && persistedId === targetId);
  if (!targetMatches) {
    return { ok: false, reason: "persist-failed" };
  }

  return { ok: true, entry: persisted };
}

export function acceptSuggestedCollectionForThought(
  thoughtId: string,
): BrainDumpEntry | null {
  const entry = getBrainDumps().find((e) => e.id === thoughtId);
  if (!entry?.suggestedCollection) return entry ?? null;

  const col = createThoughtCollection({
    label: entry.suggestedCollection,
    userCreated: false,
    suggestedByAi: true,
  });
  return moveThoughtToCollection(thoughtId, col.id);
}

export type MoveToCollectionOption = {
  id: string;
  label: string;
};

export const CATALOG_COLLECTION_PREFIX = "__catalog__:";
export const CREATE_COLLECTION_OPTION_ID = "__create_collection__";

export type CollectionPickerOption = {
  id: string;
  label: string;
};

function normalizeCollectionLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Picker value for the thought's current collection. */
export function collectionPickerValueForThought(
  entry: BrainDumpEntry,
): string {
  const id = getActiveCollectionId(entry);
  return id ?? UNCATEGORIZED_COLLECTION_ID;
}

/**
 * All collections for the Companion Box dropdown — stored, catalog defaults,
 * uncategorized, and create-new.
 */
export function listCollectionPickerOptions(): CollectionPickerOption[] {
  const stored = getThoughtCollections();
  const storedNorm = new Set(
    stored.map((c) => normalizeCollectionLabel(c.label)),
  );

  const options: CollectionPickerOption[] = stored.map((c) => ({
    id: c.id,
    label: c.label,
  }));

  for (const catalog of DEFAULT_COLLECTION_CATALOG) {
    if (!storedNorm.has(normalizeCollectionLabel(catalog.label))) {
      options.push({
        id: `${CATALOG_COLLECTION_PREFIX}${catalog.label}`,
        label: catalog.label,
      });
    }
  }

  options.sort((a, b) => a.label.localeCompare(b.label));

  options.push({
    id: UNCATEGORIZED_COLLECTION_ID,
    label: "Still finding a home",
  });

  options.push({
    id: CREATE_COLLECTION_OPTION_ID,
    label: "Create new collection…",
  });

  return options;
}

/**
 * Resolve a picker value to a persisted collection id.
 * Returns null for uncategorized; undefined when create-new has no label yet.
 * Only call on Save — may create collections.
 */
export function resolveCollectionIdFromPicker(
  pickerValue: string,
  newCollectionLabel?: string,
): string | null | undefined {
  if (
    pickerValue === UNCATEGORIZED_COLLECTION_ID ||
    !pickerValue
  ) {
    return null;
  }
  if (pickerValue === CREATE_COLLECTION_OPTION_ID) {
    const label = newCollectionLabel?.trim();
    if (!label) return undefined;
    return ensureCollectionByLabel(label).id;
  }
  if (pickerValue.startsWith(CATALOG_COLLECTION_PREFIX)) {
    const label = pickerValue.slice(CATALOG_COLLECTION_PREFIX.length);
    return ensureCollectionByLabel(label).id;
  }
  return pickerValue;
}

/**
 * Comparable key for draft vs saved — pure, no writes.
 * Stored ids compare by id; catalog/create compare by normalized label.
 */
export function collectionSelectionKey(
  pickerValue: string,
  newCollectionLabel = "",
): string | null {
  if (!pickerValue) return null;
  if (pickerValue === UNCATEGORIZED_COLLECTION_ID) {
    return UNCATEGORIZED_COLLECTION_ID;
  }
  if (pickerValue === CREATE_COLLECTION_OPTION_ID) {
    const label = newCollectionLabel.trim();
    if (!label) return null;
    return `label:${normalizeCollectionLabel(label)}`;
  }
  if (pickerValue.startsWith(CATALOG_COLLECTION_PREFIX)) {
    const label = pickerValue.slice(CATALOG_COLLECTION_PREFIX.length);
    const stored = getThoughtCollections().find(
      (c) =>
        normalizeCollectionLabel(c.label) === normalizeCollectionLabel(label),
    );
    return stored?.id ?? `label:${normalizeCollectionLabel(label)}`;
  }
  return pickerValue;
}

export function savedCollectionSelectionKey(entry: BrainDumpEntry): string {
  return getActiveCollectionId(entry) ?? UNCATEGORIZED_COLLECTION_ID;
}

/** True when picker draft differs from the thought's saved collection. */
export function isCollectionSelectionDirty(
  entry: BrainDumpEntry,
  pickerValue: string,
  newCollectionLabel = "",
): boolean {
  const draftKey = collectionSelectionKey(pickerValue, newCollectionLabel);
  if (!draftKey) return false;
  return draftKey !== savedCollectionSelectionKey(entry);
}

/** All destinations for Move To — every stored collection + uncategorized. */
export function listMoveToCollectionOptions(
  excludeCollectionId?: string,
): MoveToCollectionOption[] {
  const options: MoveToCollectionOption[] = getThoughtCollections()
    .sort((a, b) => a.label.localeCompare(b.label))
    .filter((c) => c.id !== excludeCollectionId)
    .map((c) => ({ id: c.id, label: c.label }));

  if (excludeCollectionId !== UNCATEGORIZED_COLLECTION_ID) {
    options.push({
      id: UNCATEGORIZED_COLLECTION_ID,
      label: "Still finding a home",
    });
  }

  return options;
}

export function ensureCollectionByLabel(label: string): ThoughtCollection {
  return createThoughtCollection({ label: label.trim(), userCreated: true });
}