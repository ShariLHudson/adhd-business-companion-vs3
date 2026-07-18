/**
 * Parking Lot views — summary, search, filter, sort, group, pagination.
 * Operates on PlanDayItem parked records (extended fields optional).
 */

import type { PlanDayItem, PlanDayItemSource } from "@/lib/planMyDay/types";
import type { ParkedItemStatus } from "@/lib/planMyDay/types";

export type ParkingLotStatusFilter =
  | "all-parked"
  | "review-soon"
  | "needs-decision"
  | "moved-to-today"
  | "reminder-created"
  | "added-to-project"
  | "resolved"
  | "archived";

export type ParkingLotSourceFilter =
  | "all"
  | "park-it"
  | "clear-my-mind"
  | "conversation"
  | "project"
  | "other"
  | "manual";

export type ParkingLotSort =
  | "newest"
  | "oldest"
  | "review-date"
  | "recently-updated"
  | "category";

export type ParkingLotGroupId =
  | "recently-parked"
  | "review-soon"
  | "needs-decision"
  | "leave-alone"
  | "moved-elsewhere"
  | "resolved-archived";

export type ParkingLotGroup = {
  id: ParkingLotGroupId;
  label: string;
  items: PlanDayItem[];
};

export type ParkingLotSummary = {
  totalParked: number;
  reviewSoon: number;
  recentlyAdded: number;
  needsDecision: number;
  resolvedThisMonth: number;
  attentionToday: number;
};

export type ParkingLotViewPrefs = {
  statusFilter: ParkingLotStatusFilter;
  sourceFilter: ParkingLotSourceFilter;
  sort: ParkingLotSort;
  search: string;
  pageSize: number;
  page: number;
  expandedGroups: ParkingLotGroupId[];
};

export const DEFAULT_PARKING_LOT_VIEW_PREFS: ParkingLotViewPrefs = {
  statusFilter: "all-parked",
  sourceFilter: "all",
  sort: "newest",
  search: "",
  pageSize: 25,
  page: 0,
  expandedGroups: ["recently-parked", "review-soon", "needs-decision"],
};

const VIEW_PREFS_KEY = "companion-parking-lot-view-prefs-v1";

export function loadParkingLotViewPrefs(): ParkingLotViewPrefs {
  if (typeof window === "undefined") return { ...DEFAULT_PARKING_LOT_VIEW_PREFS };
  try {
    const raw = localStorage.getItem(VIEW_PREFS_KEY);
    if (!raw) return { ...DEFAULT_PARKING_LOT_VIEW_PREFS };
    const parsed = JSON.parse(raw) as Partial<ParkingLotViewPrefs>;
    return { ...DEFAULT_PARKING_LOT_VIEW_PREFS, ...parsed };
  } catch {
    return { ...DEFAULT_PARKING_LOT_VIEW_PREFS };
  }
}

export function saveParkingLotViewPrefs(prefs: ParkingLotViewPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VIEW_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

function parkedAt(item: PlanDayItem): number {
  return Date.parse(item.createdAt ?? item.updatedAt ?? "") || 0;
}

function updatedAt(item: PlanDayItem): number {
  return Date.parse(item.updatedAt ?? item.createdAt ?? "") || 0;
}

function reviewSoon(item: PlanDayItem, withinDays = 7): boolean {
  if (!item.reviewDate) return false;
  const review = Date.parse(item.reviewDate);
  if (Number.isNaN(review)) return false;
  const now = Date.now();
  const horizon = now + withinDays * 24 * 60 * 60 * 1000;
  return review <= horizon;
}

function isActiveParked(item: PlanDayItem): boolean {
  const status = item.parkStatus ?? "parked";
  return (
    status === "parked" ||
    status === "review-soon" ||
    status === "needs-decision"
  );
}

export function resolveParkedStatus(item: PlanDayItem): ParkedItemStatus {
  if (item.parkStatus) return item.parkStatus;
  if (item.done) return "resolved";
  if (reviewSoon(item)) return "review-soon";
  return "parked";
}

export function buildParkingLotSummary(
  items: PlanDayItem[],
  now = new Date(),
): ParkingLotSummary {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  let totalParked = 0;
  let reviewSoonCount = 0;
  let recentlyAdded = 0;
  let needsDecision = 0;
  let resolvedThisMonth = 0;

  for (const item of items) {
    const status = resolveParkedStatus(item);
    if (isActiveParked(item)) {
      totalParked += 1;
      if (reviewSoon(item)) reviewSoonCount += 1;
      if (parkedAt(item) >= weekAgo) recentlyAdded += 1;
      if (status === "needs-decision") needsDecision += 1;
    }
    if (
      (status === "resolved" || status === "archived") &&
      updatedAt(item) >= monthStart
    ) {
      resolvedThisMonth += 1;
    }
  }

  return {
    totalParked,
    reviewSoon: reviewSoonCount,
    recentlyAdded,
    needsDecision,
    resolvedThisMonth,
    attentionToday: reviewSoonCount + needsDecision,
  };
}

function matchesSearch(item: PlanDayItem, q: string): boolean {
  if (!q.trim()) return true;
  const hay = [
    item.title,
    item.notes ?? "",
    item.parkCategory ?? item.category ?? "",
    ...(item.tags ?? []),
    item.source ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q.trim().toLowerCase());
}

function matchesStatus(
  item: PlanDayItem,
  filter: ParkingLotStatusFilter,
): boolean {
  const status = resolveParkedStatus(item);
  switch (filter) {
    case "all-parked":
      return isActiveParked(item);
    case "review-soon":
      return isActiveParked(item) && reviewSoon(item);
    case "needs-decision":
      return status === "needs-decision";
    case "moved-to-today":
      return status === "moved-to-today";
    case "reminder-created":
      return status === "reminder-created";
    case "added-to-project":
      return status === "added-to-project";
    case "resolved":
      return status === "resolved";
    case "archived":
      return status === "archived";
    default:
      return true;
  }
}

function matchesSource(
  item: PlanDayItem,
  filter: ParkingLotSourceFilter,
): boolean {
  if (filter === "all") return true;
  const source = item.source ?? "manual";
  if (filter === "other") {
    return (
      source === "other" ||
      source === "time-block" ||
      source === "day-designer" ||
      source === "rhythm"
    );
  }
  if (filter === "manual") return source === "manual" || source === "park-it";
  return source === filter;
}

export function sortParkedItems(
  items: PlanDayItem[],
  sort: ParkingLotSort,
): PlanDayItem[] {
  const copy = [...items];
  switch (sort) {
    case "oldest":
      return copy.sort((a, b) => parkedAt(a) - parkedAt(b));
    case "review-date":
      return copy.sort((a, b) => {
        const ar = a.reviewDate ? Date.parse(a.reviewDate) : Number.MAX_SAFE_INTEGER;
        const br = b.reviewDate ? Date.parse(b.reviewDate) : Number.MAX_SAFE_INTEGER;
        return ar - br;
      });
    case "recently-updated":
      return copy.sort((a, b) => updatedAt(b) - updatedAt(a));
    case "category":
      return copy.sort((a, b) =>
        (a.parkCategory ?? a.category ?? "").localeCompare(
          b.parkCategory ?? b.category ?? "",
        ),
      );
    case "newest":
    default:
      return copy.sort((a, b) => parkedAt(b) - parkedAt(a));
  }
}

export function filterParkedItems(
  items: PlanDayItem[],
  prefs: Pick<
    ParkingLotViewPrefs,
    "statusFilter" | "sourceFilter" | "search" | "sort"
  >,
): PlanDayItem[] {
  const filtered = items.filter(
    (item) =>
      matchesSearch(item, prefs.search) &&
      matchesStatus(item, prefs.statusFilter) &&
      matchesSource(item, prefs.sourceFilter),
  );
  return sortParkedItems(filtered, prefs.sort);
}

export function groupParkedItems(items: PlanDayItem[]): ParkingLotGroup[] {
  const groups: Record<ParkingLotGroupId, PlanDayItem[]> = {
    "recently-parked": [],
    "review-soon": [],
    "needs-decision": [],
    "leave-alone": [],
    "moved-elsewhere": [],
    "resolved-archived": [],
  };
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const item of items) {
    const status = resolveParkedStatus(item);
    if (status === "resolved" || status === "archived") {
      groups["resolved-archived"].push(item);
      continue;
    }
    if (
      status === "moved-to-today" ||
      status === "reminder-created" ||
      status === "added-to-project"
    ) {
      groups["moved-elsewhere"].push(item);
      continue;
    }
    if (status === "needs-decision") {
      groups["needs-decision"].push(item);
      continue;
    }
    if (reviewSoon(item) || status === "review-soon") {
      groups["review-soon"].push(item);
      continue;
    }
    if (parkedAt(item) >= weekAgo) {
      groups["recently-parked"].push(item);
      continue;
    }
    groups["leave-alone"].push(item);
  }

  const labels: Record<ParkingLotGroupId, string> = {
    "recently-parked": "Recently Parked",
    "review-soon": "Review Soon",
    "needs-decision": "Needs a Decision",
    "leave-alone": "Leave Alone for Now",
    "moved-elsewhere": "Moved Elsewhere",
    "resolved-archived": "Resolved or Archived",
  };

  return (Object.keys(groups) as ParkingLotGroupId[])
    .map((id) => ({
      id,
      label: labels[id],
      items: groups[id],
    }))
    .filter((g) => g.items.length > 0);
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): { pageItems: T[]; totalPages: number; page: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const start = safePage * pageSize;
  return {
    pageItems: items.slice(start, start + pageSize),
    totalPages,
    page: safePage,
  };
}

export function sourceMatchesParkIt(source: PlanDayItemSource | undefined): boolean {
  return source === "park-it" || source === "manual";
}
