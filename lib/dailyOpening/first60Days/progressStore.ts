/**
 * Persist First 60 Days welcome progress (skip / explore / no-repeat pools).
 * localStorage only — complements helpful-lesson history and room visit memory.
 */

import type { First60ProgressState } from "./types";

export const FIRST_60_PROGRESS_STORAGE_KEY =
  "spark-first-60-welcome-progress-v1";

function emptyState(): First60ProgressState {
  return {
    version: 1,
    exploredIds: [],
    skippedIds: [],
    recentWelcomeIds: [],
    recentEncouragementIds: [],
    lastDiscoveryOfferDay: null,
    lastDiscoveryOfferId: null,
    lastWelcomeDay: null,
    lastWelcomeId: null,
    lastEncouragementDay: null,
    lastEncouragementId: null,
  };
}

function normalize(raw: unknown): First60ProgressState {
  if (!raw || typeof raw !== "object") return emptyState();
  const o = raw as Partial<First60ProgressState>;
  return {
    version: 1,
    exploredIds: Array.isArray(o.exploredIds)
      ? o.exploredIds.filter((x): x is string => typeof x === "string")
      : [],
    skippedIds: Array.isArray(o.skippedIds)
      ? o.skippedIds.filter((x): x is string => typeof x === "string")
      : [],
    recentWelcomeIds: Array.isArray(o.recentWelcomeIds)
      ? o.recentWelcomeIds.filter((x): x is string => typeof x === "string")
      : [],
    recentEncouragementIds: Array.isArray(o.recentEncouragementIds)
      ? o.recentEncouragementIds.filter((x): x is string => typeof x === "string")
      : [],
    lastDiscoveryOfferDay:
      typeof o.lastDiscoveryOfferDay === "string"
        ? o.lastDiscoveryOfferDay
        : null,
    lastDiscoveryOfferId:
      typeof o.lastDiscoveryOfferId === "string"
        ? o.lastDiscoveryOfferId
        : null,
    lastWelcomeDay:
      typeof o.lastWelcomeDay === "string" ? o.lastWelcomeDay : null,
    lastWelcomeId:
      typeof o.lastWelcomeId === "string" ? o.lastWelcomeId : null,
    lastEncouragementDay:
      typeof o.lastEncouragementDay === "string"
        ? o.lastEncouragementDay
        : null,
    lastEncouragementId:
      typeof o.lastEncouragementId === "string"
        ? o.lastEncouragementId
        : null,
  };
}

export function loadFirst60Progress(): First60ProgressState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(FIRST_60_PROGRESS_STORAGE_KEY);
    if (!raw) return emptyState();
    return normalize(JSON.parse(raw));
  } catch {
    return emptyState();
  }
}

export function writeFirst60Progress(state: First60ProgressState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      FIRST_60_PROGRESS_STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch {
    /* ignore */
  }
}

function write(state: First60ProgressState): void {
  writeFirst60Progress(state);
}

function uniquePush(list: string[], id: string, max: number): string[] {
  const next = [...list.filter((x) => x !== id), id];
  return next.slice(-max);
}

export function markFirst60DiscoveryExplored(discoveryId: string): void {
  const state = loadFirst60Progress();
  write({
    ...state,
    exploredIds: uniquePush(state.exploredIds, discoveryId, 40),
    skippedIds: state.skippedIds.filter((id) => id !== discoveryId),
  });
}

export function markFirst60DiscoverySkipped(discoveryId: string): void {
  const state = loadFirst60Progress();
  write({
    ...state,
    skippedIds: uniquePush(state.skippedIds, discoveryId, 40),
  });
}

export function recordFirst60DiscoveryOffer(
  discoveryId: string,
  dayKey: string,
): void {
  const state = loadFirst60Progress();
  write({
    ...state,
    lastDiscoveryOfferDay: dayKey,
    lastDiscoveryOfferId: discoveryId,
  });
}

export function clearFirst60ProgressForTests(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(FIRST_60_PROGRESS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
