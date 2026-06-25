/**
 * Collection summaries for My Thoughts™ — garden beds, not folders.
 * Grouping uses collectionId only (thoughtCollectionAuthority).
 */

import type { BrainDumpEntry } from "@/lib/companionStore";
import {
  paletteForColorId,
  resolveCollectionVisual,
  type CollectionColorPalette,
} from "./collectionColors";
import { getThoughtCollectionById, getThoughtCollections } from "./collections";
import { getThinkingSpaceThoughts } from "./queries";
import {
  getActiveCollectionId,
  thoughtBelongsToCollectionId,
} from "./thoughtCollectionAuthority";
import { thoughtNeedsAttention } from "./thoughtViews";
import type { ThoughtCollection } from "./types";

export const UNCATEGORIZED_COLLECTION_ID = "__uncategorized__";

export type CollectionSummary = {
  id: string;
  label: string;
  icon: string;
  colorId: string;
  palette: CollectionColorPalette;
  thoughtCount: number;
  activeCount: number;
  needAttentionCount: number;
  connectedProjectsCount: number;
  remindersDueCount: number;
  updatedAt: string | null;
  updatedToday: boolean;
  userCreated: boolean;
  suggestedByAi?: boolean;
};

const UNCATEGORIZED: ThoughtCollection = {
  id: UNCATEGORIZED_COLLECTION_ID,
  label: "Still finding a home",
  createdAt: "",
  userCreated: false,
  icon: "🌱",
  colorId: "still-finding",
};

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isActiveThought(entry: BrainDumpEntry): boolean {
  if (entry.pinned) return true;
  if (entry.reminderAt) return true;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return new Date(entry.createdAt).getTime() >= weekAgo;
}

function thoughtsInCollection(
  collectionId: string,
  thoughts: BrainDumpEntry[],
): BrainDumpEntry[] {
  return thoughts.filter((t) => thoughtBelongsToCollectionId(t, collectionId));
}

function summarizeCollection(
  collection: ThoughtCollection,
  thoughts: BrainDumpEntry[],
): CollectionSummary | null {
  const members = thoughtsInCollection(collection.id, thoughts);
  if (members.length === 0 && collection.id !== UNCATEGORIZED_COLLECTION_ID) {
    return null;
  }

  const stored = getThoughtCollectionById(collection.id);
  const all = getThoughtCollections();
  const visual = resolveCollectionVisual(stored ?? collection, all);
  const icon =
    visual.icon ??
    (collection.id === UNCATEGORIZED_COLLECTION_ID ? "🌱" : "📂");

  const latest = members.reduce<string | null>((max, t) => {
    if (!max) return t.createdAt;
    return new Date(t.createdAt) > new Date(max) ? t.createdAt : max;
  }, null);

  const now = Date.now();
  const weekAhead = now + 7 * 24 * 60 * 60 * 1000;

  return {
    id: collection.id,
    label: collection.label,
    icon,
    colorId: visual.colorId,
    palette: visual.palette,
    thoughtCount: members.length,
    activeCount: members.filter(isActiveThought).length,
    needAttentionCount: members.filter(thoughtNeedsAttention).length,
    connectedProjectsCount: members.filter((t) => t.projectId).length,
    remindersDueCount: members.filter((t) => {
      if (!t.reminderAt) return false;
      const due = new Date(t.reminderAt).getTime();
      return due >= now && due <= weekAhead;
    }).length,
    updatedAt: latest,
    updatedToday: latest ? isToday(latest) : false,
    userCreated: collection.userCreated,
    suggestedByAi: collection.suggestedByAi,
  };
}

/** Primary navigation — stored collections + uncategorized only. */
export function buildCollectionSummaries(
  thoughts = getThinkingSpaceThoughts(),
): CollectionSummary[] {
  const stored = getThoughtCollections();
  const summaries: CollectionSummary[] = [];

  for (const collection of stored) {
    const summary = summarizeCollection(collection, thoughts);
    if (summary && summary.thoughtCount > 0) {
      summaries.push(summary);
    }
  }

  const uncategorized = summarizeCollection(UNCATEGORIZED, thoughts);
  if (uncategorized && uncategorized.thoughtCount > 0) {
    summaries.push(uncategorized);
  }

  return summaries.sort((a, b) => {
    if (a.updatedToday !== b.updatedToday) {
      return a.updatedToday ? -1 : 1;
    }
    const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return tb - ta;
  });
}

export function getThoughtsForCollection(
  collectionId: string,
  thoughts = getThinkingSpaceThoughts(),
): BrainDumpEntry[] {
  return thoughtsInCollection(collectionId, thoughts);
}

export function resolveCollectionLabel(collectionId: string): string {
  if (collectionId === UNCATEGORIZED_COLLECTION_ID) {
    return UNCATEGORIZED.label;
  }
  const hit = getThoughtCollections().find((c) => c.id === collectionId);
  return hit?.label ?? "Collection";
}

export function resolveCollectionPalette(
  collectionId: string,
): CollectionColorPalette {
  if (collectionId === UNCATEGORIZED_COLLECTION_ID) {
    return paletteForColorId("still-finding");
  }
  const hit = getThoughtCollectionById(collectionId);
  if (hit) return resolveCollectionVisual(hit).palette;
  const label = resolveCollectionLabel(collectionId);
  return resolveCollectionVisual({ label }).palette;
}

/** Collections that have at least one thought assigned. */
export function getCollectionsWithThoughts(
  thoughts = getThinkingSpaceThoughts(),
): ThoughtCollection[] {
  const ids = new Set(
    thoughts.map((t) => getActiveCollectionId(t)).filter(Boolean) as string[],
  );
  return getThoughtCollections().filter((c) => ids.has(c.id));
}
