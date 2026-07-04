/**
 * Restoration session — read stories, favorites, cooldowns.
 */

import type { RestorationSessionStore } from "./types";

const STORE_KEY = "estate-restoration-v1";
const OFFER_COOLDOWN_TURNS = 8;

function emptyStore(): RestorationSessionStore {
  return {
    version: 1,
    readSpreadIds: [],
    favoriteSpreadIds: [],
    declinedAtTurns: [],
    lastOfferAtTurn: null,
    lastOfferAt: null,
    lastOfferedSpreadId: null,
  };
}

export function loadRestorationStore(): RestorationSessionStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<RestorationSessionStore>;
    if (parsed.version !== 1) return emptyStore();
    return {
      version: 1,
      readSpreadIds: parsed.readSpreadIds ?? [],
      favoriteSpreadIds: parsed.favoriteSpreadIds ?? [],
      declinedAtTurns: parsed.declinedAtTurns ?? [],
      lastOfferAtTurn: parsed.lastOfferAtTurn ?? null,
      lastOfferAt: parsed.lastOfferAt ?? null,
      lastOfferedSpreadId: parsed.lastOfferedSpreadId ?? null,
      pendingReturn: parsed.pendingReturn,
    };
  } catch {
    return emptyStore();
  }
}

export function saveRestorationStore(store: RestorationSessionStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* quota */
  }
}

export function canOfferRestorationNow(currentTurn: number): boolean {
  const store = loadRestorationStore();
  if (store.lastOfferAtTurn == null) return true;
  return currentTurn - store.lastOfferAtTurn >= OFFER_COOLDOWN_TURNS;
}

export function recordRestorationOffer(
  currentTurn: number,
  spreadId?: string,
): void {
  const store = loadRestorationStore();
  store.lastOfferAtTurn = currentTurn;
  store.lastOfferAt = new Date().toISOString();
  if (spreadId) store.lastOfferedSpreadId = spreadId;
  saveRestorationStore(store);
}

export function recordStoryRead(spreadId: string, favorite = false): void {
  const store = loadRestorationStore();
  if (!store.readSpreadIds.includes(spreadId)) {
    store.readSpreadIds.push(spreadId);
  }
  if (favorite && !store.favoriteSpreadIds.includes(spreadId)) {
    store.favoriteSpreadIds.push(spreadId);
  }
  saveRestorationStore(store);
}

export function recordRestorationDeclined(currentTurn: number): void {
  const store = loadRestorationStore();
  store.declinedAtTurns.push(currentTurn);
  store.lastOfferAtTurn = currentTurn;
  saveRestorationStore(store);
}

export function setPendingReturn(
  taskLabel: string,
  spreadId: string,
  offeredAtTurn: number,
): void {
  const store = loadRestorationStore();
  store.pendingReturn = { taskLabel, spreadId, offeredAtTurn };
  saveRestorationStore(store);
}

export function clearPendingReturn(): RestorationSessionStore["pendingReturn"] {
  const store = loadRestorationStore();
  const pending = store.pendingReturn;
  delete store.pendingReturn;
  saveRestorationStore(store);
  return pending;
}

export function pickUnreadSpread(
  candidates: readonly string[],
): string | null {
  const store = loadRestorationStore();
  const unread = candidates.filter((id) => !store.readSpreadIds.includes(id));
  if (unread.length > 0) return unread[0]!;
  return candidates[0] ?? null;
}

export function adaptiveCompanionSpread(
  enjoyedSpreadId: string,
  candidates: readonly string[],
): string | null {
  const store = loadRestorationStore();
  const companions = candidates.filter(
    (id) =>
      !store.readSpreadIds.includes(id) && id !== enjoyedSpreadId,
  );
  return companions[0] ?? pickUnreadSpread(candidates);
}
