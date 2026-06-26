import { getLivingIntelligenceGraph } from "@/lib/arrivalIntelligence/livingIntelligenceGraph";

const STORAGE_KEY = "companion-carry-forward-v1";

export type CarryForwardStore = {
  /** ISO dates when a carry-forward greeting was shown */
  shownDates: string[];
  /** id -> last shown at */
  lastShownById: Record<string, string>;
  /** dayKey -> greeting replayed for stability within the first visit */
  greetingByDay: Record<string, { entryId: string; greeting: string; followUp: string | null }>;
};

let memoryStore: CarryForwardStore | null = null;

function emptyStore(): CarryForwardStore {
  return { shownDates: [], lastShownById: {}, greetingByDay: {} };
}

function readStore(): CarryForwardStore {
  if (memoryStore) return memoryStore;
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as CarryForwardStore;
    return {
      shownDates: Array.isArray(parsed.shownDates) ? parsed.shownDates : [],
      lastShownById: parsed.lastShownById ?? {},
      greetingByDay: parsed.greetingByDay ?? {},
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: CarryForwardStore) {
  memoryStore = store;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...store,
        shownDates: store.shownDates.slice(0, 90),
      }),
    );
  } catch {
    /* quota */
  }
}

export function isFirstVisitOfDay(now = new Date()): boolean {
  const graph = getLivingIntelligenceGraph();
  if (!graph.lastArrivalAt) return true;
  const last = new Date(graph.lastArrivalAt);
  return last.toDateString() !== now.toDateString();
}

export function alreadyCarriedForwardToday(now = new Date()): boolean {
  const dayKey = now.toISOString().slice(0, 10);
  return readStore().shownDates.includes(dayKey);
}

export function isGreetingOnCooldown(
  entryId: string,
  cooldownDays: number,
  now = new Date(),
): boolean {
  const last = readStore().lastShownById[entryId];
  if (!last) return false;
  const then = new Date(last).getTime();
  return now.getTime() - then < cooldownDays * 24 * 60 * 60 * 1000;
}

export function getCarryForwardGreetingForDay(now = new Date()) {
  const dayKey = now.toISOString().slice(0, 10);
  return readStore().greetingByDay[dayKey] ?? null;
}

export function recordCarryForwardShown(
  entryId: string,
  now = new Date(),
  greeting?: { line: string; followUp?: string | null },
) {
  const store = readStore();
  const dayKey = now.toISOString().slice(0, 10);
  if (!store.shownDates.includes(dayKey)) {
    store.shownDates.unshift(dayKey);
  }
  store.lastShownById[entryId] = now.toISOString();
  if (greeting) {
    store.greetingByDay[dayKey] = {
      entryId,
      greeting: greeting.line,
      followUp: greeting.followUp ?? null,
    };
  }
  writeStore(store);
}

/** Test helper */
export function clearCarryForwardStoreForTests() {
  memoryStore = null;
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
