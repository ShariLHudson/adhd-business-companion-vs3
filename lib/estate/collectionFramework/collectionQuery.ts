import type { EstateCollectionItem } from "./types";

export type CollectionBrowseState = {
  search: string;
  favoritesOnly: boolean;
  category: string | null;
  visibleCount: number;
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

export function filterCollectionItems(
  items: readonly EstateCollectionItem[],
  state: CollectionBrowseState,
): EstateCollectionItem[] {
  return items.filter((item) => {
    if (state.favoritesOnly && !item.favorite) return false;
    if (state.category && item.category !== state.category) return false;
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
