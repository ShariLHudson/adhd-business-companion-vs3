import type { LibraryItem, LibrarySortId } from "./types";

function timeValue(iso: string | null | undefined): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

export function compareLibraryItems(
  a: LibraryItem,
  b: LibraryItem,
  sort: LibrarySortId,
): number {
  switch (sort) {
    case "recently_updated":
      return timeValue(b.updatedAt) - timeValue(a.updatedAt);
    case "recently_created":
      return timeValue(b.createdAt) - timeValue(a.createdAt);
    case "name_asc":
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    case "name_desc":
      return b.title.localeCompare(a.title, undefined, { sensitivity: "base" });
    case "status":
      return a.statusLabel.localeCompare(b.statusLabel, undefined, {
        sensitivity: "base",
      });
    case "creation_type":
      return (a.typeLabel ?? "").localeCompare(b.typeLabel ?? "", undefined, {
        sensitivity: "base",
      });
    case "due_date": {
      const ad = timeValue(a.dueAt);
      const bd = timeValue(b.dueAt);
      if (!ad && !bd) return timeValue(b.updatedAt) - timeValue(a.updatedAt);
      if (!ad) return 1;
      if (!bd) return -1;
      return ad - bd;
    }
    default:
      return timeValue(b.updatedAt) - timeValue(a.updatedAt);
  }
}

export function sortLibraryItems<T extends LibraryItem>(
  items: readonly T[],
  sort: LibrarySortId,
): T[] {
  return [...items].sort((a, b) => compareLibraryItems(a, b, sort));
}
