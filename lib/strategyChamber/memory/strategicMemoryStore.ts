/**
 * Strategic Decision Memory — local V1 (matches Strategy Work Item persistence).
 */

import type { StrategicDecisionMemory } from "./types";

const MEMORY_KEY = "spark:strategy-decision-memory:v1";

const memoryBag = {
  items: [] as StrategicDecisionMemory[],
};

function nowIso(): string {
  return new Date().toISOString();
}

function readList(): StrategicDecisionMemory[] {
  if (typeof window === "undefined") {
    return [...memoryBag.items];
  }
  try {
    const raw = window.localStorage.getItem(MEMORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as StrategicDecisionMemory[]) : [];
  } catch {
    return [];
  }
}

function writeList(list: StrategicDecisionMemory[]): void {
  if (typeof window === "undefined") {
    memoryBag.items = list;
    return;
  }
  try {
    window.localStorage.setItem(MEMORY_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

export function newStrategicMemoryId(): string {
  return `sdm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function listStrategicDecisionMemories(): StrategicDecisionMemory[] {
  return readList().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getStrategicDecisionMemory(
  id: string,
): StrategicDecisionMemory | null {
  return listStrategicDecisionMemories().find((m) => m.id === id) ?? null;
}

export function getStrategicDecisionMemoryByWorkItem(
  strategyWorkItemId: string,
): StrategicDecisionMemory | null {
  return (
    listStrategicDecisionMemories().find(
      (m) => m.strategyWorkItemId === strategyWorkItemId,
    ) ?? null
  );
}

export function upsertStrategicDecisionMemory(
  record: StrategicDecisionMemory,
): StrategicDecisionMemory {
  const list = listStrategicDecisionMemories();
  const idx = list.findIndex((m) => m.id === record.id);
  const next = { ...record, updatedAt: nowIso() };
  if (idx >= 0) {
    list[idx] = next;
  } else {
    list.unshift(next);
  }
  writeList(list);
  return next;
}

export function updateStrategicDecisionMemory(
  id: string,
  patch: Partial<Omit<StrategicDecisionMemory, "id" | "createdAt" | "strategyWorkItemId">>,
): StrategicDecisionMemory | null {
  const existing = getStrategicDecisionMemory(id);
  if (!existing) return null;
  return upsertStrategicDecisionMemory({
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    strategyWorkItemId: existing.strategyWorkItemId,
  });
}

export function listMemoriesAwaitingReview(
  asOfIso: string = nowIso(),
): StrategicDecisionMemory[] {
  return listStrategicDecisionMemories().filter((m) => {
    if (m.status === "archived" || m.status === "superseded") return false;
    if (m.status === "awaiting_review") return true;
    if (m.nextReviewDate && m.nextReviewDate <= asOfIso.slice(0, 10)) {
      return true;
    }
    return m.reviewTriggers.some(
      (t) => t.active && t.nextReviewDate && t.nextReviewDate <= asOfIso.slice(0, 10),
    );
  });
}

export function __resetStrategicMemoryStoreForTests(): void {
  memoryBag.items = [];
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MEMORY_KEY);
}
