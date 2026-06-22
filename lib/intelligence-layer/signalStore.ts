import type { IntelligenceSignal, IntelligenceSignalStore } from "./types";

const STORE_KEY = "companion-intelligence-signals-v1";
const MAX_SIGNALS = 10_000;

export function getIntelligenceSignalStore(): IntelligenceSignalStore {
  if (typeof window === "undefined") return { signals: [] };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { signals: [] };
    const parsed = JSON.parse(raw) as Partial<IntelligenceSignalStore>;
    return {
      signals: Array.isArray(parsed.signals) ? parsed.signals : [],
    };
  } catch {
    return { signals: [] };
  }
}

function saveIntelligenceSignalStore(store: IntelligenceSignalStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* quota */
  }
}

function uid(): string {
  return `sig-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function appendIntelligenceSignal(
  input: Omit<IntelligenceSignal, "id" | "at" | "date"> & {
    at?: string;
  },
): IntelligenceSignal {
  const at = input.at ?? new Date().toISOString();
  const signal: IntelligenceSignal = {
    id: uid(),
    at,
    date: at.slice(0, 10),
    domain: input.domain,
    category: input.category,
    source: input.source,
    valence: input.valence,
    meta: input.meta,
  };
  const store = getIntelligenceSignalStore();
  saveIntelligenceSignalStore({
    signals: [...store.signals, signal].slice(-MAX_SIGNALS),
  });
  return signal;
}

export function appendIntelligenceSignals(
  inputs: Array<
    Omit<IntelligenceSignal, "id" | "at" | "date"> & { at?: string }
  >,
): IntelligenceSignal[] {
  return inputs.map((input) => appendIntelligenceSignal(input));
}

export function queryIntelligenceSignals(opts?: {
  domain?: IntelligenceSignal["domain"];
  category?: string;
  since?: string;
  limit?: number;
}): IntelligenceSignal[] {
  const { signals } = getIntelligenceSignalStore();
  let result = signals;
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

export function countSignalsByCategory(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const s of getIntelligenceSignalStore().signals) {
    const key = `${s.domain}:${s.category}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}
