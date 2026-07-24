/**
 * Strategic Pattern store — local V1 (matches Strategic Memory persistence).
 */

import type { StrategicPatternCandidate } from "./types";

const PATTERN_KEY = "spark:strategy-decision-patterns:v1";

const memoryBag = {
  items: [] as StrategicPatternCandidate[],
};

function nowIso(): string {
  return new Date().toISOString();
}

function readList(): StrategicPatternCandidate[] {
  if (typeof window === "undefined") {
    return [...memoryBag.items];
  }
  try {
    const raw = window.localStorage.getItem(PATTERN_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as StrategicPatternCandidate[]) : [];
  } catch {
    return [];
  }
}

function writeList(list: StrategicPatternCandidate[]): void {
  if (typeof window === "undefined") {
    memoryBag.items = list;
    return;
  }
  try {
    window.localStorage.setItem(PATTERN_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

export function newStrategicPatternId(): string {
  return `spat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function listStrategicPatterns(): StrategicPatternCandidate[] {
  return readList().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getStrategicPattern(
  id: string,
): StrategicPatternCandidate | null {
  return listStrategicPatterns().find((p) => p.id === id) ?? null;
}

export function upsertStrategicPattern(
  record: StrategicPatternCandidate,
): StrategicPatternCandidate {
  const list = listStrategicPatterns();
  const idx = list.findIndex((p) => p.id === record.id);
  const next = { ...record, updatedAt: nowIso() };
  if (idx >= 0) list[idx] = next;
  else list.unshift(next);
  writeList(list);
  return next;
}

export function updateStrategicPattern(
  id: string,
  patch: Partial<
    Omit<StrategicPatternCandidate, "id" | "createdAt" | "detectorVersion">
  >,
): StrategicPatternCandidate | null {
  const existing = getStrategicPattern(id);
  if (!existing) return null;
  return upsertStrategicPattern({
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    detectorVersion: existing.detectorVersion,
  });
}

export function listPatternsReadyForReview(): StrategicPatternCandidate[] {
  return listStrategicPatterns().filter(
    (p) => p.status === "ready_for_review" || p.status === "candidate",
  );
}

export function listAcceptedPatternsForFutureReasoning(): StrategicPatternCandidate[] {
  return listStrategicPatterns().filter(
    (p) =>
      p.status === "accepted" &&
      p.useInFutureReasoning === true &&
      p.userResponse?.response === "accepted",
  );
}

export function findPatternByCategoryFingerprint(
  category: StrategicPatternCandidate["category"],
  fingerprint: string,
): StrategicPatternCandidate | null {
  return (
    listStrategicPatterns().find(
      (p) =>
        p.category === category &&
        p.title.toLowerCase() === fingerprint.toLowerCase() &&
        p.status !== "archived" &&
        p.status !== "superseded",
    ) ?? null
  );
}

export function __resetStrategicPatternStoreForTests(): void {
  memoryBag.items = [];
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PATTERN_KEY);
}
