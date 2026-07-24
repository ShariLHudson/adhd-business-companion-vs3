/**
 * Strategy Chamber shared work items — local V1; intelligence-ready shape.
 */

import type { StrategicJudgmentStage } from "./domainModel";
import { __resetStrategicMemoryStoreForTests } from "./memory/strategicMemoryStore";
import type {
  StrategyEntryReason,
  StrategyWorkItem,
  StrategyWorkStatus,
  StrategyConnection,
} from "./types";

const WORK_KEY = "spark:strategy-work-items:v1";
const CONN_KEY = "spark:strategy-connections:v1";
const ACTIVE_KEY = "spark:strategy-work-active:v1";

/** In-memory fallback for SSR / vitest (no window.localStorage). */
const memory = {
  work: [] as StrategyWorkItem[],
  connections: [] as StrategyConnection[],
  activeId: null as string | null,
};

function nowIso(): string {
  return new Date().toISOString();
}

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") {
    if (key === WORK_KEY) return [...memory.work] as unknown as T[];
    if (key === CONN_KEY) return [...memory.connections] as unknown as T[];
    return [];
  }
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, list: T[]): void {
  if (typeof window === "undefined") {
    if (key === WORK_KEY) memory.work = list as unknown as StrategyWorkItem[];
    if (key === CONN_KEY) {
      memory.connections = list as unknown as StrategyConnection[];
    }
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const ENTRY_STAGE: Record<StrategyEntryReason, StrategicJudgmentStage> = {
  need_direction: "clarify_question",
  important_decision: "evaluate_tradeoffs",
  rethink_current_direction: "understand_reality",
  new_opportunity: "explore_options",
  problem_not_improving: "understand_reality",
  major_commitment: "evaluate_tradeoffs",
  review_existing_strategy: "choose_direction",
  referred_from_other_destination: "clarify_question",
  unsure: "clarify_question",
};

const ENTRY_TITLE: Record<StrategyEntryReason, string> = {
  need_direction: "Finding direction",
  important_decision: "An important decision",
  rethink_current_direction: "Rethinking the current direction",
  new_opportunity: "A new opportunity",
  problem_not_improving: "Something that is not improving",
  major_commitment: "A major commitment",
  review_existing_strategy: "Reviewing an existing strategy",
  referred_from_other_destination: "Continuing from another place",
  unsure: "Finding the best place to begin",
};

export function listStrategyWorkItems(): StrategyWorkItem[] {
  return readList<StrategyWorkItem>(WORK_KEY).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getStrategyWorkItem(id: string): StrategyWorkItem | null {
  return listStrategyWorkItems().find((w) => w.id === id) ?? null;
}

export function getActiveStrategyWorkItemId(): string | null {
  if (typeof window === "undefined") return memory.activeId;
  try {
    return window.localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function setActiveStrategyWorkItemId(id: string | null): void {
  if (typeof window === "undefined") {
    memory.activeId = id;
    return;
  }
  try {
    if (!id) window.localStorage.removeItem(ACTIVE_KEY);
    else window.localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function getActiveStrategyWorkItem(): StrategyWorkItem | null {
  const id = getActiveStrategyWorkItemId();
  if (!id) return null;
  const item = getStrategyWorkItem(id);
  if (!item || item.status === "archived" || item.status === "completed") {
    return null;
  }
  return item;
}

const RESUMABLE_STATUSES: StrategyWorkStatus[] = [
  "paused",
  "understanding",
  "exploring",
  "evaluating",
  "direction_chosen",
  "testing",
  "under_review",
  "handed_off",
];

function isResumableStatus(status: StrategyWorkStatus): boolean {
  return RESUMABLE_STATUSES.includes(status);
}

/** Most recent unfinished work first — opening shows only the top item. */
export function listResumableStrategyWorkItems(): StrategyWorkItem[] {
  return listStrategyWorkItems().filter(
    (w) =>
      w.status !== "completed" &&
      w.status !== "archived" &&
      w.status !== "not_started" &&
      isResumableStatus(w.status),
  );
}

export function getResumableStrategyWorkItem(): StrategyWorkItem | null {
  const active = getActiveStrategyWorkItem();
  if (active && active.status !== "not_started" && isResumableStatus(active.status)) {
    return active;
  }
  return listResumableStrategyWorkItems()[0] ?? null;
}

/**
 * Start new strategic work. Pauses any prior active item so unfinished work
 * is never deleted and never silently abandoned without a resume path.
 */
export function createStrategyWorkItem(input: {
  entryReason: StrategyEntryReason;
  title?: string;
  summary?: string;
  sourceDestination?: string;
  sourceContext?: string;
}): StrategyWorkItem {
  const priorId = getActiveStrategyWorkItemId();
  if (priorId) {
    const prior = getStrategyWorkItem(priorId);
    if (
      prior &&
      prior.status !== "completed" &&
      prior.status !== "archived"
    ) {
      pauseStrategyWorkItem(prior.id);
    }
  }

  const ts = nowIso();
  const item: StrategyWorkItem = {
    id: newId("swi"),
    title: input.title?.trim() || ENTRY_TITLE[input.entryReason],
    plainLanguageSummary:
      input.summary?.trim() ||
      "Strategic thinking in progress — you can leave and return anytime.",
    status: "understanding",
    entryReason: input.entryReason,
    currentStage: ENTRY_STAGE[input.entryReason],
    version: 1,
    createdBy: "member",
    sourceDestination: input.sourceDestination ?? "strategy-library",
    sourceContext: input.sourceContext,
    createdAt: ts,
    updatedAt: ts,
  };
  const list = listStrategyWorkItems();
  writeList(WORK_KEY, [item, ...list]);
  setActiveStrategyWorkItemId(item.id);
  return item;
}

export function updateStrategyWorkItem(
  id: string,
  patch: Partial<
    Omit<StrategyWorkItem, "id" | "createdAt" | "version">
  > & { bumpVersion?: boolean },
): StrategyWorkItem | null {
  const list = listStrategyWorkItems();
  const idx = list.findIndex((w) => w.id === id);
  if (idx < 0) return null;
  const prev = list[idx]!;
  const { bumpVersion, ...rest } = patch;
  const next: StrategyWorkItem = {
    ...prev,
    ...rest,
    id: prev.id,
    createdAt: prev.createdAt,
    version: bumpVersion === false ? prev.version : prev.version + 1,
    updatedAt: nowIso(),
  };
  list[idx] = next;
  writeList(WORK_KEY, list);
  return next;
}

export function pauseStrategyWorkItem(id: string): StrategyWorkItem | null {
  return updateStrategyWorkItem(id, { status: "paused" });
}

export function resumeStrategyWorkItem(id: string): StrategyWorkItem | null {
  const item = getStrategyWorkItem(id);
  if (!item) return null;
  const status: StrategyWorkStatus =
    item.status === "paused" || item.status === "not_started"
      ? "understanding"
      : item.status;
  setActiveStrategyWorkItemId(id);
  return updateStrategyWorkItem(id, { status });
}

export function listStrategyConnections(
  workItemId?: string,
): StrategyConnection[] {
  const all = readList<StrategyConnection>(CONN_KEY);
  return workItemId
    ? all.filter((c) => c.strategyWorkItemId === workItemId)
    : all;
}

export function addStrategyConnection(
  input: Omit<StrategyConnection, "id" | "createdAt" | "updatedAt">,
): StrategyConnection {
  const ts = nowIso();
  const row: StrategyConnection = {
    ...input,
    id: newId("sconn"),
    createdAt: ts,
    updatedAt: ts,
  };
  writeList(CONN_KEY, [row, ...listStrategyConnections()]);
  return row;
}

/** Test helper — clear V1 stores */
export function __resetStrategyChamberStoresForTests(): void {
  memory.work = [];
  memory.connections = [];
  memory.activeId = null;
  __resetStrategicMemoryStoreForTests();
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(WORK_KEY);
  window.localStorage.removeItem(CONN_KEY);
  window.localStorage.removeItem(ACTIVE_KEY);
}
