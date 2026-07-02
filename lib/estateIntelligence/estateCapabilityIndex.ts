/**
 * Estate Capability Index™ — inverted index for fast matcher lookup.
 */

import type {
  EstateRegistryEntry,
  EstateUserNeed,
} from "./types";
import { ESTATE_REGISTRY_ENTRIES } from "./estateRegistry";

export type EstateCapabilityIndex = {
  byKeyword: Map<string, Set<string>>;
  byPhrase: Map<string, string>;
  byEmotion: Map<string, Set<string>>;
  byUserNeed: Map<EstateUserNeed, Set<string>>;
  byBusinessGoal: Map<string, Set<string>>;
  byIntent: Map<string, Set<string>>;
  entries: Map<string, EstateRegistryEntry>;
};

function addToSetMap(map: Map<string, Set<string>>, key: string, id: string) {
  const normalized = key.trim().toLowerCase();
  if (!normalized) return;
  const existing = map.get(normalized) ?? new Set<string>();
  existing.add(id);
  map.set(normalized, existing);
}

export function buildEstateCapabilityIndex(
  entries: readonly EstateRegistryEntry[] = ESTATE_REGISTRY_ENTRIES,
): EstateCapabilityIndex {
  const byKeyword = new Map<string, Set<string>>();
  const byPhrase = new Map<string, string>();
  const byEmotion = new Map<string, Set<string>>();
  const byUserNeed = new Map<EstateUserNeed, Set<string>>();
  const byBusinessGoal = new Map<string, Set<string>>();
  const byIntent = new Map<string, Set<string>>();
  const entryMap = new Map<string, EstateRegistryEntry>();

  for (const entry of entries) {
    entryMap.set(entry.id, entry);

    for (const keyword of entry.keywords) {
      addToSetMap(byKeyword, keyword, entry.id);
      for (const token of keyword.toLowerCase().split(/\s+/)) {
        if (token.length >= 3) addToSetMap(byKeyword, token, entry.id);
      }
    }

    for (const phrase of entry.phrases ?? []) {
      byPhrase.set(phrase.trim().toLowerCase(), entry.id);
    }

    for (const emotion of entry.emotionalStates ?? []) {
      addToSetMap(byEmotion, emotion, entry.id);
    }

    for (const need of entry.userNeeds ?? []) {
      const set = byUserNeed.get(need) ?? new Set<string>();
      set.add(entry.id);
      byUserNeed.set(need, set);
    }

    for (const goal of entry.businessGoals ?? []) {
      addToSetMap(byBusinessGoal, goal, entry.id);
    }

    for (const intent of entry.intents ?? []) {
      addToSetMap(byIntent, intent, entry.id);
    }
  }

  return {
    byKeyword,
    byPhrase,
    byEmotion,
    byUserNeed,
    byBusinessGoal,
    byIntent,
    entries: entryMap,
  };
}

/** Singleton index — rebuilt only when registry changes (Phase 1). */
let cachedIndex: EstateCapabilityIndex | null = null;

export function estateCapabilityIndex(): EstateCapabilityIndex {
  if (!cachedIndex) {
    cachedIndex = buildEstateCapabilityIndex();
  }
  return cachedIndex;
}

export function resetEstateCapabilityIndexForTests(): void {
  cachedIndex = null;
}
