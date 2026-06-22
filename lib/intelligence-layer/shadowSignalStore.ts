/**
 * Shadow signal store — Sprint 1 bus writes ONLY here.
 * Never touches companion-intelligence-signals-v1 or profile evolution.
 */

import type { CompanionSignal } from "./signalBusTypes";
import {
  dedupeKeyForSignal,
  pruneDedupeIndex,
} from "./signalDedup";

export const SHADOW_SIGNAL_STORE_KEY = "companion-signal-bus-shadow-v1";
const MAX_SIGNALS = 10_000;

export type ShadowSignalStore = {
  signals: CompanionSignal[];
  version: 1;
};

let dedupeIndex = new Map<string, string>();

function uid(): string {
  return `bus-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getShadowSignalStore(): ShadowSignalStore {
  if (typeof window === "undefined") {
    return { signals: [], version: 1 };
  }
  try {
    const raw = localStorage.getItem(SHADOW_SIGNAL_STORE_KEY);
    if (!raw) return { signals: [], version: 1 };
    const parsed = JSON.parse(raw) as Partial<ShadowSignalStore>;
    return {
      version: 1,
      signals: Array.isArray(parsed.signals) ? parsed.signals : [],
    };
  } catch {
    return { signals: [], version: 1 };
  }
}

function saveShadowSignalStore(store: ShadowSignalStore): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(SHADOW_SIGNAL_STORE_KEY, JSON.stringify(store));
    return true;
  } catch {
    try {
      const trimmed = {
        ...store,
        signals: store.signals.slice(-Math.floor(MAX_SIGNALS * 0.9)),
      };
      localStorage.setItem(SHADOW_SIGNAL_STORE_KEY, JSON.stringify(trimmed));
      return true;
    } catch {
      return false;
    }
  }
}

export function rebuildDedupeIndexFromShadow(): Map<string, string> {
  const index = new Map<string, string>();
  const store = getShadowSignalStore();
  const cutoff = Date.now() - 120_000;
  for (const signal of store.signals) {
    if (new Date(signal.at).getTime() < cutoff) continue;
    index.set(dedupeKeyForSignal(signal), signal.at);
  }
  dedupeIndex = index;
  return index;
}

export function getShadowDedupeIndex(): Map<string, string> {
  if (dedupeIndex.size === 0) {
    return rebuildDedupeIndexFromShadow();
  }
  pruneDedupeIndex(dedupeIndex, Date.now());
  return dedupeIndex;
}

export function appendShadowSignal(signal: CompanionSignal): boolean {
  const store = getShadowSignalStore();
  const next: ShadowSignalStore = {
    version: 1,
    signals: [...store.signals, signal].slice(-MAX_SIGNALS),
  };
  const saved = saveShadowSignalStore(next);
  if (saved) {
    getShadowDedupeIndex().set(dedupeKeyForSignal(signal), signal.at);
  }
  return saved;
}

export function queryShadowSignals(opts?: {
  domain?: CompanionSignal["domain"];
  category?: string;
  since?: string;
  limit?: number;
}): CompanionSignal[] {
  let result = getShadowSignalStore().signals;
  if (opts?.domain) {
    result = result.filter((s) => s.domain === opts.domain);
  }
  if (opts?.category) {
    result = result.filter((s) => s.category === opts.category);
  }
  if (opts?.since) {
    result = result.filter((s) => s.at >= opts.since);
  }
  if (opts?.limit) {
    result = result.slice(-opts.limit);
  }
  return result;
}

export function clearShadowSignalStoreForTests(): void {
  dedupeIndex = new Map();
  if (typeof window !== "undefined") {
    localStorage.removeItem(SHADOW_SIGNAL_STORE_KEY);
  }
}

export function buildCompanionSignalRecord(
  input: Omit<CompanionSignal, "id" | "at" | "date" | "schemaVersion"> & {
    at?: string;
  },
): CompanionSignal {
  const at = input.at ?? new Date().toISOString();
  return {
    id: uid(),
    at,
    date: at.slice(0, 10),
    schemaVersion: 1,
    userId: input.userId,
    domain: input.domain,
    category: input.category,
    action: input.action,
    source: input.source,
    valence: input.valence,
    weight: input.weight,
    meta: input.meta,
    emitter: input.emitter,
  };
}
