/**
 * Local persistence for Estate adaptive preferences.
 */

import type { AdaptiveEstateStore, AdaptivePreferenceState } from "./types";

const STORE_KEY = "estate-adaptive-intelligence-v1";

function emptyStore(): AdaptiveEstateStore {
  const now = new Date().toISOString();
  return {
    version: 1,
    preferences: {},
    lastPreferenceCheckAt: null,
    updatedAt: now,
  };
}

export function loadAdaptiveEstateStore(): AdaptiveEstateStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<AdaptiveEstateStore>;
    if (parsed.version !== 1) return emptyStore();
    return {
      version: 1,
      preferences: parsed.preferences ?? {},
      lastPreferenceCheckAt: parsed.lastPreferenceCheckAt ?? null,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return emptyStore();
  }
}

export function saveAdaptiveEstateStore(store: AdaptiveEstateStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({ ...store, updatedAt: new Date().toISOString() }),
    );
  } catch {
    /* quota */
  }
}

export function upsertPreferenceState(
  state: AdaptivePreferenceState,
): AdaptivePreferenceState {
  const store = loadAdaptiveEstateStore();
  store.preferences[state.id] = state;
  saveAdaptiveEstateStore(store);
  return state;
}

export function clearAdaptiveEstateStore(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORE_KEY);
}
