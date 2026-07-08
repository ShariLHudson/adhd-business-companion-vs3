import type { SparkNoteCategory, SparkNoteReaction } from "./types";
import type {
  SparkDailySelectionReason,
  SparkDailySelectionRecord,
} from "./contentDatabase/types";

const STORE_KEY = "companion-spark-note-v1";

export type SparkNotePersistenceStore = {
  /** dayKey -> spark id selected that day (legacy) */
  dailySelection: Record<string, string>;
  /** dayKey -> full daily selection record */
  dailyRecords: Record<string, SparkDailySelectionRecord>;
  /** spark id -> ISO last shown */
  lastShownById: Record<string, string>;
  /** Recent spark ids for rotation avoidance */
  recentIds: string[];
  /** Spark ids the user opened (expanded) */
  viewedIds: string[];
  /** User-favorited spark ids */
  favoriteIds: string[];
  /** Spark ids marked complete / read */
  completedIds: string[];
  /** Category/tag affinity from reactions and saves. */
  categoryAffinity: Record<string, number>;
  /** Categories the user passed on — learning signal */
  ignoredCategories: Record<string, number>;
  /** spark id → reactions given */
  reactionsBySparkId: Record<string, SparkNoteReaction[]>;
};

function emptyStore(): SparkNotePersistenceStore {
  return {
    dailySelection: {},
    dailyRecords: {},
    lastShownById: {},
    recentIds: [],
    viewedIds: [],
    favoriteIds: [],
    completedIds: [],
    categoryAffinity: {},
    ignoredCategories: {},
    reactionsBySparkId: {},
  };
}

let memoryStore: SparkNotePersistenceStore | null = null;

export function readSparkNoteStore(): SparkNotePersistenceStore {
  if (memoryStore) return memoryStore;
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<SparkNotePersistenceStore>;
    return {
      dailySelection: parsed.dailySelection ?? {},
      dailyRecords: parsed.dailyRecords ?? {},
      lastShownById: parsed.lastShownById ?? {},
      recentIds: parsed.recentIds ?? [],
      viewedIds: parsed.viewedIds ?? [],
      favoriteIds: parsed.favoriteIds ?? [],
      completedIds: parsed.completedIds ?? [],
      categoryAffinity: parsed.categoryAffinity ?? {},
      ignoredCategories: parsed.ignoredCategories ?? {},
      reactionsBySparkId: parsed.reactionsBySparkId ?? {},
    };
  } catch {
    return emptyStore();
  }
}

export function writeSparkNoteStore(store: SparkNotePersistenceStore): void {
  memoryStore = store;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* quota */
  }
}

export function resetSparkNoteStoreForTests(): void {
  memoryStore = null;
}

export function dayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function getStoredDailySparkId(now = new Date()): string | null {
  const key = dayKey(now);
  return readSparkNoteStore().dailySelection[key] ?? null;
}

export function getYesterdaySparkId(now = new Date()): string | null {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return getStoredDailySparkId(yesterday);
}

export function recordDailySparkSelection(
  sparkId: string,
  now = new Date(),
  selectedReason: SparkDailySelectionReason = "library",
): void {
  const store = readSparkNoteStore();
  const key = dayKey(now);
  const recent = [
    sparkId,
    ...store.recentIds.filter((id) => id !== sparkId),
  ].slice(0, 12);
  const dailyRecords = {
    ...store.dailyRecords,
    [key]: {
      sparkId,
      date: key,
      selectedReason,
      viewed: store.dailyRecords[key]?.viewed ?? false,
      saved: store.dailyRecords[key]?.saved ?? false,
    },
  };
  writeSparkNoteStore({
    ...store,
    dailySelection: { ...store.dailySelection, [key]: sparkId },
    dailyRecords,
    lastShownById: {
      ...store.lastShownById,
      [sparkId]: now.toISOString(),
    },
    recentIds: recent,
  });
}

export function getDailySparkRecord(
  now = new Date(),
): SparkDailySelectionRecord | null {
  const key = dayKey(now);
  return readSparkNoteStore().dailyRecords[key] ?? null;
}

export function sparkNoteOnCooldown(
  sparkId: string,
  cooldownDays: number,
  now = new Date(),
): boolean {
  const last = readSparkNoteStore().lastShownById[sparkId];
  if (!last) return false;
  const then = new Date(last).getTime();
  return now.getTime() - then < cooldownDays * 24 * 60 * 60 * 1000;
}

export function getRecentSparkNoteIds(): string[] {
  return [...readSparkNoteStore().recentIds];
}

export function recordSparkNoteViewed(sparkId: string): void {
  const store = readSparkNoteStore();
  const viewedIds = [
    sparkId,
    ...store.viewedIds.filter((id) => id !== sparkId),
  ].slice(0, 30);
  const key = dayKey();
  const dailyRecords = { ...store.dailyRecords };
  if (dailyRecords[key]?.sparkId === sparkId) {
    dailyRecords[key] = { ...dailyRecords[key]!, viewed: true };
  }
  writeSparkNoteStore({ ...store, viewedIds, dailyRecords });
}

export function recordSparkNoteCompleted(sparkId: string): void {
  const store = readSparkNoteStore();
  const completedIds = [
    sparkId,
    ...store.completedIds.filter((id) => id !== sparkId),
  ].slice(0, 30);
  writeSparkNoteStore({ ...store, completedIds });
}

export function toggleSparkNoteFavorite(sparkId: string): boolean {
  const store = readSparkNoteStore();
  const isFavorite = store.favoriteIds.includes(sparkId);
  const favoriteIds = isFavorite
    ? store.favoriteIds.filter((id) => id !== sparkId)
    : [sparkId, ...store.favoriteIds].slice(0, 20);
  writeSparkNoteStore({ ...store, favoriteIds });
  return !isFavorite;
}

const REACTION_AFFINITY_BOOST: Record<SparkNoteReaction, number> = {
  loved: 3,
  encouraged: 2,
  idea: 2,
  save: 2,
  think: 1,
  smile: 1,
  pass: -1,
};

export function recordSparkNoteReaction(
  sparkId: string,
  reaction: SparkNoteReaction,
  category: SparkNoteCategory,
  tags?: string[],
): void {
  const store = readSparkNoteStore();
  const categoryAffinity = { ...store.categoryAffinity };
  const boost = REACTION_AFFINITY_BOOST[reaction];
  categoryAffinity[category] = (categoryAffinity[category] ?? 0) + boost;
  for (const tag of tags ?? []) {
    const key = `tag:${tag}`;
    categoryAffinity[key] = (categoryAffinity[key] ?? 0) + 1;
  }

  const reactionsBySparkId = { ...store.reactionsBySparkId };
  reactionsBySparkId[sparkId] = [
    ...(reactionsBySparkId[sparkId] ?? []),
    reaction,
  ].slice(-5);

  let favoriteIds = store.favoriteIds;
  if (reaction === "save" && !favoriteIds.includes(sparkId)) {
    favoriteIds = [sparkId, ...favoriteIds].slice(0, 20);
  }

  const ignoredCategories = { ...store.ignoredCategories };
  if (reaction === "pass") {
    ignoredCategories[category] = (ignoredCategories[category] ?? 0) + 1;
  }

  const key = dayKey();
  const dailyRecords = { ...store.dailyRecords };
  if (dailyRecords[key]?.sparkId === sparkId) {
    dailyRecords[key] = {
      ...dailyRecords[key]!,
      saved: reaction === "save" || dailyRecords[key]!.saved,
    };
  }

  writeSparkNoteStore({
    ...store,
    categoryAffinity,
    reactionsBySparkId,
    favoriteIds,
    ignoredCategories,
    dailyRecords,
  });
}

export function getCategoryAffinity(): Record<string, number> {
  return { ...readSparkNoteStore().categoryAffinity };
}

export function getFavoriteSparkIds(): string[] {
  return [...readSparkNoteStore().favoriteIds];
}

export function getSparkReactions(sparkId: string): SparkNoteReaction[] {
  return [...(readSparkNoteStore().reactionsBySparkId[sparkId] ?? [])];
}
