/**
 * Narrow daily FIRE portfolio storage seam (localStorage + memory).
 *
 * Namespace: spark-estate:founder-fire-portfolios
 * One canonical portfolio per date key. Safe on SSR (no window access crash).
 */

import type { FireExecutivePortfolio } from "@/lib/founder/types/fireBrief";
import { isFounderLocalDateKey } from "./founderLocalDate";

export const FIRE_PORTFOLIO_STORAGE_KEY =
  "spark-estate:founder-fire-portfolios" as const;

type FirePortfolioStore = Record<string, FireExecutivePortfolio>;

/** Process memory — SSR / Node and same-tab fallback when localStorage is unavailable. */
const memoryStore: FirePortfolioStore = {};

function canUseLocalStorage(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined" &&
      typeof window.localStorage.getItem === "function"
    );
  } catch {
    return false;
  }
}

function isValidPortfolio(value: unknown): value is FireExecutivePortfolio {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<FireExecutivePortfolio>;
  return (
    typeof p.id === "string" &&
    typeof p.date === "string" &&
    isFounderLocalDateKey(p.date) &&
    typeof p.dateDisplay === "string" &&
    typeof p.primaryFocus === "string" &&
    Array.isArray(p.executiveSummary) &&
    Array.isArray(p.priorities) &&
    Array.isArray(p.alerts) &&
    Array.isArray(p.decisions) &&
    Array.isArray(p.dashboardPanels) &&
    p.opportunities != null &&
    typeof p.opportunities === "object"
  );
}

function readLocalStore(): FirePortfolioStore | null {
  if (!canUseLocalStorage()) return null;
  try {
    const raw = window.localStorage.getItem(FIRE_PORTFOLIO_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: FirePortfolioStore = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (isFounderLocalDateKey(key) && isValidPortfolio(value)) {
        out[key] = value;
      }
    }
    return out;
  } catch {
    return {};
  }
}

function writeLocalStore(store: FirePortfolioStore): boolean {
  if (!canUseLocalStorage()) return false;
  try {
    window.localStorage.setItem(
      FIRE_PORTFOLIO_STORAGE_KEY,
      JSON.stringify(store),
    );
    return true;
  } catch {
    return false;
  }
}

export type StoreFirePortfolioResult =
  | { ok: true; stored: true; source: "localStorage" | "memory" }
  | { ok: true; stored: false; reason: "already_present" }
  | { ok: false; reason: "invalid_portfolio" | "unavailable" };

/** Read the canonical portfolio for a date, if present and valid. */
export function getStoredFirePortfolioForDate(
  dateKey: string,
): FireExecutivePortfolio | null {
  if (!isFounderLocalDateKey(dateKey)) return null;

  if (memoryStore[dateKey] && isValidPortfolio(memoryStore[dateKey])) {
    return { ...memoryStore[dateKey] };
  }

  const local = readLocalStore();
  if (!local) {
    return null;
  }
  const found = local[dateKey];
  if (!found || !isValidPortfolio(found)) return null;
  memoryStore[dateKey] = found;
  return { ...found };
}

/**
 * Store once per date. Does not overwrite a valid existing portfolio
 * (prevents regenerate-on-every-render).
 */
export function storeFirePortfolioForDate(
  portfolio: FireExecutivePortfolio,
): StoreFirePortfolioResult {
  if (!isValidPortfolio(portfolio)) {
    return { ok: false, reason: "invalid_portfolio" };
  }
  const dateKey = portfolio.date;
  if (!isFounderLocalDateKey(dateKey)) {
    return { ok: false, reason: "invalid_portfolio" };
  }

  const existing = getStoredFirePortfolioForDate(dateKey);
  if (existing) {
    return { ok: true, stored: false, reason: "already_present" };
  }

  memoryStore[dateKey] = portfolio;

  const local = readLocalStore();
  if (local) {
    const next = { ...local, [dateKey]: portfolio };
    if (writeLocalStore(next)) {
      return { ok: true, stored: true, source: "localStorage" };
    }
  }

  return { ok: true, stored: true, source: "memory" };
}

/** Test helper — clears memory and localStorage namespace. */
export function clearFirePortfolioStorageForTests(): void {
  for (const key of Object.keys(memoryStore)) {
    delete memoryStore[key];
  }
  if (!canUseLocalStorage()) return;
  try {
    window.localStorage.removeItem(FIRE_PORTFOLIO_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Optional — list stored date keys (newest first). */
export function listStoredFirePortfolioDateKeys(): string[] {
  const keys = new Set<string>(Object.keys(memoryStore));
  const local = readLocalStore();
  if (local) {
    for (const key of Object.keys(local)) keys.add(key);
  }
  return [...keys]
    .filter(isFounderLocalDateKey)
    .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
}
