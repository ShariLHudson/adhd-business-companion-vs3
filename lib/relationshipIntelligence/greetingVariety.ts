/**
 * Greeting Variety — rotate openings; never feel scripted.
 */

const STORAGE_KEY = "companion-morning-greeting-history-v1";
const MAX_HISTORY = 14;

type GreetingHistoryStore = {
  recentIds: string[];
  recentTexts: string[];
};

function readStore(): GreetingHistoryStore {
  if (typeof window === "undefined") {
    return { recentIds: [], recentTexts: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { recentIds: [], recentTexts: [] };
    const parsed = JSON.parse(raw) as GreetingHistoryStore;
    return {
      recentIds: Array.isArray(parsed.recentIds) ? parsed.recentIds : [],
      recentTexts: Array.isArray(parsed.recentTexts) ? parsed.recentTexts : [],
    };
  } catch {
    return { recentIds: [], recentTexts: [] };
  }
}

function writeStore(store: GreetingHistoryStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        recentIds: store.recentIds.slice(0, MAX_HISTORY),
        recentTexts: store.recentTexts.slice(0, MAX_HISTORY),
      }),
    );
  } catch {
    /* quota */
  }
}

function stableHash(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function pickVariedEntry<T extends { id: string }>(
  entries: readonly T[],
  seed: string,
): T {
  const store = readStore();
  const fresh = entries.filter((e) => !store.recentIds.includes(e.id));
  const pool = fresh.length ? fresh : entries;
  const idx = stableHash(seed) % pool.length;
  return pool[idx] ?? entries[0]!;
}

export function recordGreetingShown(id: string, text: string): void {
  const store = readStore();
  store.recentIds = [id, ...store.recentIds.filter((x) => x !== id)].slice(0, MAX_HISTORY);
  store.recentTexts = [text.trim(), ...store.recentTexts.filter((x) => x !== text.trim())].slice(
    0,
    MAX_HISTORY,
  );
  writeStore(store);
}

export function wasGreetingUsedRecently(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return readStore().recentTexts.some((t) => t.trim().toLowerCase() === normalized);
}

/** Test helper */
export function clearGreetingHistoryForTests(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
