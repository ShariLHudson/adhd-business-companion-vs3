import {
  DEFAULT_LIBRARY_PAGE_SIZE,
  type LibraryItem,
  type LibraryQueryResult,
} from "./types";

export function paginateLibraryItems<T extends LibraryItem>(
  items: readonly T[],
  visibleCount: number,
  pageSize: number = DEFAULT_LIBRARY_PAGE_SIZE,
): LibraryQueryResult<T> {
  const size = Math.max(1, pageSize);
  const count = Math.max(size, visibleCount);
  const sliced = items.slice(0, count);
  return {
    items: sliced,
    totalMatched: items.length,
    totalSource: items.length,
    hasMore: sliced.length < items.length,
    visibleCount: sliced.length,
  };
}

export function nextVisibleCount(
  currentVisible: number,
  pageSize: number = DEFAULT_LIBRARY_PAGE_SIZE,
): number {
  return currentVisible + Math.max(1, pageSize);
}
