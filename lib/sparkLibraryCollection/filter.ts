import type {
  LibraryCreationFilterId,
  LibraryFilterId,
  LibraryItem,
  LibraryProjectFilterId,
  LibraryRecordKind,
} from "./types";

function matchesCreationFilter(
  item: LibraryItem,
  filter: LibraryCreationFilterId,
): boolean {
  switch (filter) {
    case "all":
      return !item.archived;
    case "in_progress":
      return (
        !item.archived &&
        (item.statusId === "active" ||
          item.statusId === "in_progress" ||
          /progress|motion|active/i.test(item.statusLabel))
      );
    case "draft":
      return (
        !item.archived &&
        (item.statusId === "draft" ||
          item.statusId === "drafting" ||
          /draft|discovery/i.test(item.statusLabel))
      );
    case "completed":
      return (
        !item.archived &&
        (item.statusId === "completed" ||
          item.statusId === "complete" ||
          /complete/i.test(item.statusLabel))
      );
    case "favorites":
      return !item.archived && item.favorite;
    case "archived":
      return item.archived;
    default:
      return !item.archived;
  }
}

function matchesProjectFilter(
  item: LibraryItem,
  filter: LibraryProjectFilterId,
): boolean {
  switch (filter) {
    case "all":
      return !item.archived;
    case "active":
      return (
        !item.archived &&
        (item.statusId === "in-motion" ||
          item.statusId === "in-progress" ||
          item.statusId === "active-focus" ||
          /active|motion|progress/i.test(item.statusLabel))
      );
    case "planning":
      return (
        !item.archived &&
        (item.statusId === "dreaming" ||
          item.statusId === "not-started" ||
          item.statusId === "planning" ||
          /plan|dream|not started/i.test(item.statusLabel))
      );
    case "waiting":
      return (
        !item.archived &&
        (item.statusId === "paused" ||
          item.statusId === "resting" ||
          item.statusId === "waiting" ||
          /wait|pause|rest/i.test(item.statusLabel))
      );
    case "completed":
      return (
        !item.archived &&
        (item.statusId === "completed" ||
          item.statusId === "nearly-ready" ||
          /complete|ready/i.test(item.statusLabel))
      );
    case "favorites":
      return !item.archived && item.favorite;
    case "archived":
      return item.archived;
    default:
      return !item.archived;
  }
}

export function libraryItemMatchesFilter(
  item: LibraryItem,
  filter: LibraryFilterId,
  kind: LibraryRecordKind,
): boolean {
  if (kind === "creation") {
    return matchesCreationFilter(item, filter as LibraryCreationFilterId);
  }
  return matchesProjectFilter(item, filter as LibraryProjectFilterId);
}

export function filterLibraryItems<T extends LibraryItem>(
  items: readonly T[],
  filter: LibraryFilterId,
  kind: LibraryRecordKind,
): T[] {
  return items.filter((item) => libraryItemMatchesFilter(item, filter, kind));
}

export function activeFilterChips(
  filter: LibraryFilterId,
  kind: LibraryRecordKind,
): Array<{ id: LibraryFilterId; label: string }> {
  if (filter === "all") return [];
  const label =
    kind === "creation"
      ? (
          {
            all: "All",
            in_progress: "In Progress",
            draft: "Draft",
            completed: "Completed",
            favorites: "Favorites",
            archived: "Archived",
          } as Record<string, string>
        )[filter]
      : (
          {
            all: "All",
            active: "Active",
            planning: "Planning",
            waiting: "Waiting",
            completed: "Completed",
            favorites: "Favorites",
            archived: "Archived",
          } as Record<string, string>
        )[filter];
  return label ? [{ id: filter, label }] : [];
}
