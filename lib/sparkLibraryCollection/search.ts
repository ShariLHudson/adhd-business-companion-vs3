import type { LibraryItem } from "./types";

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/** Match search against title, description, type, tags, linked name, audience. */
export function libraryItemMatchesSearch(
  item: LibraryItem,
  query: string,
): boolean {
  const q = normalize(query);
  if (!q) return true;
  const haystack = [
    item.title,
    item.description,
    item.typeLabel,
    item.statusLabel,
    item.clientOrAudience,
    item.relationship?.label,
    ...(item.tags ?? []),
  ]
    .map(normalize)
    .join(" ");
  return haystack.includes(q);
}

export function filterLibraryItemsBySearch<T extends LibraryItem>(
  items: readonly T[],
  query: string,
): T[] {
  const q = normalize(query);
  if (!q) return [...items];
  return items.filter((item) => libraryItemMatchesSearch(item, q));
}
