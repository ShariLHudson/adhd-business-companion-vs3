const STORE_KEY = "companion-todays-little-spark-v1";

export type SparkPersistenceStore = {
  /** spark id -> ISO last shown */
  lastShownById: Record<string, string>;
  /** Interest tags the user smiled at (incremented when spark shown). */
  affinity: Record<string, number>;
  /** dayKey when a spark was last shown */
  lastSparkDay: string | null;
};

function emptyStore(): SparkPersistenceStore {
  return { lastShownById: {}, affinity: {}, lastSparkDay: null };
}

let memoryStore: SparkPersistenceStore | null = null;

export function readSparkStore(): SparkPersistenceStore {
  if (memoryStore) return memoryStore;
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<SparkPersistenceStore>;
    return {
      lastShownById: parsed.lastShownById ?? {},
      affinity: parsed.affinity ?? {},
      lastSparkDay: parsed.lastSparkDay ?? null,
    };
  } catch {
    return emptyStore();
  }
}

export function writeSparkStore(store: SparkPersistenceStore): void {
  memoryStore = store;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* quota */
  }
}

export function resetSparkStoreForTests(): void {
  memoryStore = null;
}

export function dayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function recordSparkShown(
  sparkId: string,
  interestTags: string[] | undefined,
  now = new Date(),
): void {
  const store = readSparkStore();
  const key = dayKey(now);
  const affinity = { ...store.affinity };
  for (const tag of interestTags ?? []) {
    affinity[tag] = (affinity[tag] ?? 0) + 1;
  }
  writeSparkStore({
    lastShownById: {
      ...store.lastShownById,
      [sparkId]: now.toISOString(),
    },
    affinity,
    lastSparkDay: key,
  });
}

export function sparkOnCooldown(
  sparkId: string,
  cooldownDays: number,
  now = new Date(),
): boolean {
  const last = readSparkStore().lastShownById[sparkId];
  if (!last) return false;
  const then = new Date(last).getTime();
  return now.getTime() - then < cooldownDays * 24 * 60 * 60 * 1000;
}

export function alreadySparkedToday(now = new Date()): boolean {
  return readSparkStore().lastSparkDay === dayKey(now);
}
