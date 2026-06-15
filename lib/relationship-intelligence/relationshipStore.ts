/**
 * Local persistence for relationships — user-controlled, deletable anytime.
 */

import { normalizePersonName } from "./relationshipSignals";
import type { Relationship, RelationshipOffer } from "./types";

const STORE_KEY = "companion-relationship-intelligence-v1";

export type RelationshipStore = {
  relationships: Relationship[];
  mentionCounts: Record<string, number>;
  founderSamples: {
    at: string;
    type: string;
    importance: string;
    signalKind: string;
  }[];
  offerDismissedOn: string | null;
  dismissedNames: Record<string, string>;
};

const DEFAULT_STORE: RelationshipStore = {
  relationships: [],
  mentionCounts: {},
  founderSamples: [],
  offerDismissedOn: null,
  dismissedNames: {},
};

export function getRelationshipStore(): RelationshipStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<RelationshipStore>;
    return {
      ...DEFAULT_STORE,
      ...parsed,
      relationships: Array.isArray(parsed.relationships)
        ? parsed.relationships
        : [],
      mentionCounts: parsed.mentionCounts ?? {},
      founderSamples: Array.isArray(parsed.founderSamples)
        ? parsed.founderSamples
        : [],
      dismissedNames: parsed.dismissedNames ?? {},
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export function saveRelationshipStore(
  update: Partial<RelationshipStore>,
): RelationshipStore {
  const next = { ...getRelationshipStore(), ...update };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

export function dayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function getMentionCountMap(): Map<string, number> {
  const store = getRelationshipStore();
  return new Map(Object.entries(store.mentionCounts));
}

export function saveMentionCountMap(map: Map<string, number>): void {
  saveRelationshipStore({
    mentionCounts: Object.fromEntries(map),
  });
}

export function getRelationships(): Relationship[] {
  return getRelationshipStore().relationships;
}

export function saveRelationship(relationship: Relationship): void {
  const store = getRelationshipStore();
  const key = normalizePersonName(relationship.name);
  const without = store.relationships.filter(
    (r) => normalizePersonName(r.name) !== key,
  );
  saveRelationshipStore({
    relationships: [...without, relationship],
    founderSamples: [
      ...store.founderSamples,
      {
        at: relationship.createdAt,
        type: relationship.relationshipType,
        importance: relationship.importance,
        signalKind: relationship.tags[0] ?? "remembered",
      },
    ].slice(-500),
  });
}

export function deleteRelationship(id: string): void {
  const store = getRelationshipStore();
  saveRelationshipStore({
    relationships: store.relationships.filter((r) => r.id !== id),
  });
}

export function isRelationshipOfferDismissedToday(now = new Date()): boolean {
  return getRelationshipStore().offerDismissedOn === dayKey(now);
}

export function isNameDismissedToday(name: string, now = new Date()): boolean {
  const store = getRelationshipStore();
  if (store.offerDismissedOn === dayKey(now)) return true;
  return store.dismissedNames[normalizePersonName(name)] === dayKey(now);
}

export function dismissRelationshipOffer(
  name?: string,
  now = new Date(),
): void {
  const dk = dayKey(now);
  if (name) {
    saveRelationshipStore({
      dismissedNames: {
        ...getRelationshipStore().dismissedNames,
        [normalizePersonName(name)]: dk,
      },
    });
    return;
  }
  saveRelationshipStore({ offerDismissedOn: dk });
}

export const RELATIONSHIP_UPDATED_EVENT =
  "companion-relationship-intelligence-updated";

export function notifyRelationshipUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(RELATIONSHIP_UPDATED_EVENT));
  }
}

export function recordOfferShown(offer: RelationshipOffer): void {
  const store = getRelationshipStore();
  const name = offer.signal.extractedName;
  if (!name) return;
  const key = normalizePersonName(name);
  saveRelationshipStore({
    mentionCounts: {
      ...store.mentionCounts,
      [key]: offer.mentionCount,
    },
  });
}
