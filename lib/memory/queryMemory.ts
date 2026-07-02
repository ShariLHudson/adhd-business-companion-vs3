/**
 * Memory Library queries — filter, search, chronological scroll data.
 */

import type {
  MemoryDateRange,
  MemoryQuery,
  MemoryTypeFilter,
  UserMemoryEntry,
} from "./types";
import { getAllMemoryEntriesChronological, getUserMemoryStore } from "./userMemoryStore";

export function resolveMemoryDateBounds(
  range: MemoryDateRange | undefined,
): { start: Date | null; end: Date | null } {
  if (!range || range.preset === "all") {
    return { start: null, end: null };
  }
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  if (range.preset === "custom") {
    return {
      start: new Date(range.start),
      end: new Date(range.end),
    };
  }
  const start = new Date(end);
  if (range.preset === "week") {
    start.setDate(start.getDate() - 7);
  } else {
    start.setDate(start.getDate() - 30);
  }
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function matchesSearch(entry: UserMemoryEntry, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    entry.content,
    entry.title ?? "",
    ...entry.tags,
    entry.type,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function inDateRange(
  entry: UserMemoryEntry,
  start: Date | null,
  end: Date | null,
): boolean {
  if (!start && !end) return true;
  const t = new Date(entry.timestamp).getTime();
  if (start && t < start.getTime()) return false;
  if (end && t > end.getTime()) return false;
  return true;
}

function entriesForType(
  typeFilter: MemoryTypeFilter,
): UserMemoryEntry[] {
  const store = getUserMemoryStore();
  if (typeFilter === "all") return getAllMemoryEntriesChronological();
  if (typeFilter === "journal") return store.journals;
  if (typeFilter === "portfolio") return store.portfolioItems;
  return store.evidenceItems;
}

/** Filtered, searchable, chronological list for Memory Library UI. */
export function queryMemoryEntries(query: MemoryQuery = {}): UserMemoryEntry[] {
  const typeFilter = query.typeFilter ?? "all";
  const { start, end } = resolveMemoryDateBounds(query.dateRange);

  return entriesForType(typeFilter)
    .filter((e) => inDateRange(e, start, end))
    .filter((e) => matchesSearch(e, query.search ?? ""))
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
}
