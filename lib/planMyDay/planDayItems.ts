import { getDayDesignerStore } from "@/lib/day-designer/dayStore";
import {
  getTimeBlocks,
  todayStr,
  type TimeBlock,
} from "@/lib/companionStore";
import type { PlanDayItem, PlanItemColumn, PlanItemPriority } from "./types";
import type { PlanLifeDomain } from "./types";
import { inferPlanLifeDomain, PLAN_DOMAIN_PALETTE } from "./planItemColors";

const STORE_KEY = "companion-plan-my-day-items-v1";
const DEFERRED_STORE_KEY = "companion-plan-my-day-deferred-v1";

export const PLAN_MY_DAY_UPDATED = "companion-plan-my-day-updated";

function notifyPlanUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PLAN_MY_DAY_UPDATED));
}

type StoredDay = {
  date: string;
  items: PlanDayItem[];
};

function readStored(): StoredDay | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDay;
    if (!parsed?.date || !Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(data: StoredDay): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    notifyPlanUpdated();
  } catch {
    /* storage unavailable */
  }
}

function readDeferred(): Record<string, PlanDayItem[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DEFERRED_STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, PlanDayItem[]>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeDeferred(data: Record<string, PlanDayItem[]>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DEFERRED_STORE_KEY, JSON.stringify(data));
    notifyPlanUpdated();
  } catch {
    /* storage unavailable */
  }
}

function consumeDeferredForDate(date: string): PlanDayItem[] {
  const all = readDeferred();
  const forDate = all[date];
  if (!forDate?.length) return [];
  const next = { ...all };
  delete next[date];
  writeDeferred(next);
  return forDate;
}

export function dateStrFromOffset(days: number, from = todayStr()): string {
  const d = new Date(`${from}T12:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function tomorrowStr(): string {
  return dateStrFromOffset(1);
}

export function formatPlanDueDate(dueDate?: string): string {
  if (!dueDate) return "—";
  const today = todayStr();
  if (dueDate === today) return "Today";
  if (dueDate === tomorrowStr()) return "Tomorrow";
  try {
    const d = new Date(`${dueDate}T12:00:00`);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dueDate;
  }
}

const PRIORITY_WEIGHT: Record<PlanItemPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export function planItemPriorityWeight(item: PlanDayItem): number {
  return PRIORITY_WEIGHT[item.priority ?? "medium"];
}

function uid(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function columnFromBlock(b: TimeBlock): PlanItemColumn {
  if (b.status === "completed") return "done";
  if (b.status === "progress" || b.status === "triggered") return "doing";
  return "ready";
}

function itemFromTimeBlock(b: TimeBlock): PlanDayItem {
  return {
    id: `tb-${b.id}`,
    title: b.title,
    durationMinutes: b.durationMin,
    flexible: b.durationFlexible,
    startTime: b.startTime || undefined,
    column: columnFromBlock(b),
    done: b.status === "completed",
    projectId: b.projectId,
    notes: b.note,
    createdAt: b.createdAt,
    sourceTimeBlockId: b.id,
  };
}

/** Build items from today’s time blocks + adaptive day plan. */
export function seedPlanItemsFromSources(): PlanDayItem[] {
  const today = todayStr();
  const seen = new Set<string>();
  const items: PlanDayItem[] = [];

  const blocks = getTimeBlocks().filter(
    (b) => b.date === today && b.status !== "not-today",
  );
  for (const b of blocks) {
    const key = b.title.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    items.push(itemFromTimeBlock(b));
  }

  const dayPlan = getDayDesignerStore().plans.find((p) => p.date === today);
  if (dayPlan) {
    for (const block of dayPlan.suggestedBlocks) {
      if (block.title.toLowerCase().includes("margin")) continue;
      const key = block.title.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      items.push({
        id: `day-${block.id}`,
        title: block.title,
        durationMinutes: block.durationMinutes,
        flexible: block.durationMinutes <= 15,
        column: "ready",
        done: false,
        createdAt: new Date().toISOString(),
      });
    }
    for (const p of dayPlan.priorities) {
      const key = p.label.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      items.push({
        id: `pri-${p.id}`,
        title: p.label,
        durationMinutes: p.estimatedMinutes,
        flexible: !p.estimatedMinutes,
        column: "ready",
        done: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return assignDefaultTimes(items);
}

/** Spread default start times when missing (9:00, +1h each). */
export function assignDefaultTimes(items: PlanDayItem[]): PlanDayItem[] {
  let hour = 9;
  let minute = 0;
  return items.map((item) => {
    if (item.startTime) return item;
    const startTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    hour += 1;
    if (hour > 17) hour = 9;
    return { ...item, startTime };
  });
}

export function loadTodayPlanItems(): PlanDayItem[] {
  const today = todayStr();
  const stored = readStored();
  let items: PlanDayItem[];

  if (stored?.date === today && stored.items.length > 0) {
    items = stored.items;
  } else {
    items = seedPlanItemsFromSources();
  }

  const deferred = consumeDeferredForDate(today);
  if (deferred.length > 0) {
    items = assignDefaultTimes([...items, ...deferred]);
  }

  if (
    deferred.length > 0 ||
    !stored ||
    stored.date !== today ||
    stored.items.length === 0
  ) {
    writeStored({ date: today, items });
  }

  return items;
}

/** Archive the current plan snapshot and clear today's planning view for a new-day reset. */
export function resetTodayPlanForNewDay(): void {
  const today = todayStr();
  const stored = readStored();
  if (stored?.items?.length) {
    const deferred = readDeferred();
    const archiveKey =
      stored.date === today ? `archived-${today}` : stored.date;
    deferred[archiveKey] = [...(deferred[archiveKey] ?? []), ...stored.items];
    writeDeferred(deferred);
  }
  writeStored({ date: today, items: [] });
}

export function saveTodayPlanItems(items: PlanDayItem[]): PlanDayItem[] {
  const today = todayStr();
  writeStored({ date: today, items });
  return items;
}

export function updatePlanItem(
  items: PlanDayItem[],
  id: string,
  patch: Partial<PlanDayItem>,
): PlanDayItem[] {
  return saveTodayPlanItems(
    items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
  );
}

export function movePlanItemColumn(
  items: PlanDayItem[],
  id: string,
  column: PlanItemColumn,
): PlanDayItem[] {
  return movePlanItemKanban(items, id, column).items;
}

export type KanbanMoveResult = {
  items: PlanDayItem[];
  enteredDoing: boolean;
  enteredDone: boolean;
  itemTitle: string;
};

/** Kanban drag — updates column immediately with focus + completion side effects. */
export function movePlanItemKanban(
  items: PlanDayItem[],
  id: string,
  column: PlanItemColumn,
): KanbanMoveResult {
  const item = items.find((i) => i.id === id);
  if (!item) {
    return {
      items,
      enteredDoing: false,
      enteredDone: false,
      itemTitle: "",
    };
  }

  const prevColumn = item.column;
  const patch: Partial<PlanDayItem> = { column };

  if (column === "done") {
    patch.done = true;
    patch.keptForReference = false;
  } else {
    patch.done = false;
  }

  if (column === "doing") {
    patch.snoozedUntil = undefined;
    patch.focusRank = Date.now();
  }

  if (column === "parked" || column === "ready") {
    patch.snoozedUntil = undefined;
  }

  const next = saveTodayPlanItems(
    items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
  );

  return {
    items: next,
    enteredDoing: column === "doing" && prevColumn !== "doing",
    enteredDone: column === "done" && prevColumn !== "done",
    itemTitle: item.title,
  };
}

export function togglePlanItemDone(
  items: PlanDayItem[],
  id: string,
): PlanDayItem[] {
  const item = items.find((i) => i.id === id);
  if (!item) return items;
  const done = !item.done;
  return updatePlanItem(items, id, {
    done,
    column: done ? "done" : item.column === "done" ? "ready" : item.column,
  });
}

/** Active in today's working list — not completed, parked, or snoozed. */
export function isPlanItemActive(item: PlanDayItem): boolean {
  if (item.column === "parked") return false;
  if (item.done && !item.keptForReference) return false;
  if (item.snoozedUntil && new Date(item.snoozedUntil) > new Date()) {
    return false;
  }
  return true;
}

export function deletePlanItem(
  items: PlanDayItem[],
  id: string,
): PlanDayItem[] {
  return saveTodayPlanItems(items.filter((i) => i.id !== id));
}

export function duplicatePlanItem(
  items: PlanDayItem[],
  id: string,
): PlanDayItem[] {
  const source = items.find((i) => i.id === id);
  if (!source) return items;
  const copy: PlanDayItem = {
    ...source,
    id: uid(),
    title: `${source.title} (copy)`,
    column: "ready",
    done: false,
    keptForReference: false,
    snoozedUntil: undefined,
    createdAt: new Date().toISOString(),
  };
  return saveTodayPlanItems([...items, copy]);
}

export function snoozePlanItem(
  items: PlanDayItem[],
  id: string,
  minutes = 30,
): PlanDayItem[] {
  const until = new Date(Date.now() + minutes * 60_000).toISOString();
  return updatePlanItem(items, id, { snoozedUntil: until });
}

/** Remove from today and schedule for a future date. */
export function deferPlanItemToDate(
  items: PlanDayItem[],
  id: string,
  targetDate: string,
): PlanDayItem[] {
  const item = items.find((i) => i.id === id);
  if (!item || targetDate === todayStr()) return items;

  const moved: PlanDayItem = {
    ...item,
    column: "ready",
    done: false,
    dueDate: targetDate,
    snoozedUntil: undefined,
    focusRank: undefined,
    keptForReference: false,
  };

  const deferred = readDeferred();
  deferred[targetDate] = [...(deferred[targetDate] ?? []), moved];
  writeDeferred(deferred);

  return saveTodayPlanItems(items.filter((i) => i.id !== id));
}

export function formatPlanItemCreated(item: PlanDayItem): string {
  if (!item.createdAt) return "Today";
  try {
    const d = new Date(item.createdAt);
    const today = todayStr();
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (day === today) return "Today";
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "Today";
  }
}

export function currentFocusItem(items: PlanDayItem[]): PlanDayItem | null {
  const doing = items.filter(
    (i) => i.column === "doing" && isPlanItemActive(i),
  );
  if (doing.length > 0) {
    return [...doing].sort((a, b) => {
      const priorityDiff =
        planItemPriorityWeight(b) - planItemPriorityWeight(a);
      if (priorityDiff !== 0) return priorityDiff;
      const rankDiff = (b.focusRank ?? 0) - (a.focusRank ?? 0);
      if (rankDiff !== 0) return rankDiff;
      return (a.startTime ?? "").localeCompare(b.startTime ?? "");
    })[0]!;
  }
  return (
    items.find(
      (i) =>
        isPlanItemActive(i) &&
        i.column !== "done" &&
        i.column !== "parked",
    ) ?? null
  );
}

export function nextFocusOptions(
  items: PlanDayItem[],
  excludeId?: string,
): PlanDayItem[] {
  return items
    .filter(
      (i) =>
        isPlanItemActive(i) &&
        i.column !== "parked" &&
        i.id !== excludeId,
    )
    .slice(0, 4);
}

export function formatPlanTime(startTime?: string): string {
  if (!startTime) return "Flexible";
  const [h, m] = startTime.split(":").map(Number);
  if (Number.isNaN(h)) return startTime;
  const d = new Date();
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function durationLabel(item: PlanDayItem): string {
  if (item.flexible && !item.durationMinutes) return "Flexible";
  if (item.durationMinutes) return `${item.durationMinutes} min`;
  return "—";
}

export function planItemMetaLabel(
  item: PlanDayItem,
  colorCoding = true,
): string {
  const parts: string[] = [];
  if (item.startTime) parts.push(formatPlanTime(item.startTime));
  const dur = durationLabel(item);
  if (dur !== "—") parts.push(dur);
  if (colorCoding) {
    const domain = item.category ?? inferPlanLifeDomain(item.title);
    parts.push(PLAN_DOMAIN_PALETTE[domain].label);
  }
  const joined = parts.join(" · ");
  return joined || (colorCoding ? "Flexible" : "Anytime");
}

export type QuickPlanItemInput = {
  title: string;
  category?: PlanLifeDomain | "auto";
  startTime?: string;
  durationMinutes?: number;
};

export function countActivePlanItems(): number {
  return loadTodayPlanItems().filter(isPlanItemActive).length;
}

export function addQuickPlanItem(
  input: string | QuickPlanItemInput,
): PlanDayItem[] {
  const parsed: QuickPlanItemInput =
    typeof input === "string" ? { title: input } : input;
  const trimmed = parsed.title.trim();
  const items = loadTodayPlanItems();
  if (!trimmed) return items;

  const hasTime = Boolean(parsed.startTime?.trim());
  const explicitCategory =
    parsed.category && parsed.category !== "auto" ? parsed.category : undefined;

  const next: PlanDayItem = {
    id: uid(),
    title: trimmed,
    column: "ready",
    done: false,
    category: explicitCategory,
    startTime: hasTime ? parsed.startTime!.trim() : undefined,
    flexible: !parsed.durationMinutes,
    durationMinutes: parsed.durationMinutes,
    createdAt: new Date().toISOString(),
  };
  return saveTodayPlanItems([...items, next]);
}
