import type { EstateCollectionItem } from "./types";

export type CollectionBrowseState = {
  search: string;
  favoritesOnly: boolean;
  category: string | null;
  source: string | null;
  emotion: string | null;
  projectName: string | null;
  personName: string | null;
  confidenceBoostOnly: boolean;
  recentOnly: boolean;
  datePreset: string | null;
  hallCandidateOnly: boolean;
  visibleCount: number;
};

export const DEFAULT_COLLECTION_BROWSE_STATE: Omit<
  CollectionBrowseState,
  "visibleCount"
> = {
  search: "",
  favoritesOnly: false,
  category: null,
  source: null,
  emotion: null,
  projectName: null,
  personName: null,
  confidenceBoostOnly: false,
  recentOnly: false,
  datePreset: null,
  hallCandidateOnly: false,
};

export function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

export function itemMatchesSearch(
  item: EstateCollectionItem,
  search: string,
): boolean {
  const q = normalizeSearchText(search);
  if (!q) return true;
  const haystack = [
    item.title,
    item.body,
    item.badge,
    item.category,
    item.detail,
    ...(item.fields?.map((f) => `${f.label} ${f.value}`) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function listCollectionCategories(
  items: readonly EstateCollectionItem[],
): string[] {
  const set = new Set<string>();
  for (const item of items) {
    if (item.category?.trim()) set.add(item.category.trim());
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

function fieldValue(
  item: EstateCollectionItem,
  label: string,
): string {
  const match = item.fields?.find(
    (f) => f.label.toLowerCase() === label.toLowerCase(),
  );
  return match?.value?.trim() ?? "";
}

export function listCollectionFieldValues(
  items: readonly EstateCollectionItem[],
  fieldLabel: string,
): string[] {
  const set = new Set<string>();
  for (const item of items) {
    const value = fieldValue(item, fieldLabel);
    if (value) set.add(value);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

function startOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function datePresetRange(
  preset: string,
): { start: number; end: number } | null {
  const now = new Date();
  const today = startOfDay(now);
  const day = 24 * 60 * 60 * 1000;
  switch (preset) {
    case "today":
      return { start: today, end: today + day };
    case "yesterday":
      return { start: today - day, end: today };
    case "this-week": {
      const dow = now.getDay();
      const start = today - (dow === 0 ? 6 : dow - 1) * day;
      return { start, end: today + day };
    }
    case "last-week": {
      const dow = now.getDay();
      const thisWeekStart = today - (dow === 0 ? 6 : dow - 1) * day;
      return { start: thisWeekStart - 7 * day, end: thisWeekStart };
    }
    case "this-month":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
        end: today + day,
      };
    case "last-month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
      const end = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return { start, end };
    }
    case "this-year":
      return {
        start: new Date(now.getFullYear(), 0, 1).getTime(),
        end: today + day,
      };
    default:
      return null;
  }
}

export function filterCollectionItems(
  items: readonly EstateCollectionItem[],
  state: CollectionBrowseState,
): EstateCollectionItem[] {
  const recentCutoff = state.recentOnly
    ? Date.now() - 30 * 24 * 60 * 60 * 1000
    : null;
  const dateRange = state.datePreset
    ? datePresetRange(state.datePreset)
    : null;
  return items.filter((item) => {
    if (state.hallCandidateOnly) {
      const hall = fieldValue(item, "Hall candidate");
      if (hall.toLowerCase() !== "yes") return false;
    }
    if (dateRange) {
      const created = new Date(item.createdAt).getTime();
      if (created < dateRange.start || created >= dateRange.end) return false;
    }
    if (state.favoritesOnly && !item.favorite) return false;
    if (state.category && item.category !== state.category) return false;
    if (state.source) {
      const source = fieldValue(item, "Source") || item.badge || "";
      if (source.toLowerCase() !== state.source.toLowerCase()) return false;
    }
    if (state.emotion) {
      if (
        fieldValue(item, "Emotion").toLowerCase() !==
        state.emotion.toLowerCase()
      ) {
        return false;
      }
    }
    if (state.projectName) {
      if (
        !fieldValue(item, "Project")
          .toLowerCase()
          .includes(state.projectName.toLowerCase())
      ) {
        return false;
      }
    }
    if (state.personName) {
      const person =
        fieldValue(item, "Person") || fieldValue(item, "Who benefited");
      if (!person.toLowerCase().includes(state.personName.toLowerCase())) {
        return false;
      }
    }
    if (state.confidenceBoostOnly) {
      const boost = fieldValue(item, "Confidence boost");
      if (!/^yes\b/i.test(boost) && boost.toLowerCase() !== "true") {
        return false;
      }
    }
    if (
      recentCutoff != null &&
      new Date(item.createdAt).getTime() < recentCutoff
    ) {
      return false;
    }
    return itemMatchesSearch(item, state.search);
  });
}

export function paginateCollectionItems<T>(
  items: readonly T[],
  visibleCount: number,
): { visible: T[]; hasMore: boolean; total: number } {
  const total = items.length;
  const visible = items.slice(0, visibleCount);
  return {
    visible,
    hasMore: visible.length < total,
    total,
  };
}
