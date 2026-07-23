import { filterLibraryItems } from "./filter";
import { paginateLibraryItems } from "./paginate";
import { filterLibraryItemsBySearch } from "./search";
import { sortLibraryItems } from "./sort";
import type {
  LibraryFilterId,
  LibraryItem,
  LibraryQueryResult,
  LibraryRecordKind,
  LibrarySortId,
  LibraryUiState,
} from "./types";

export type LibraryQueryInput = {
  items: readonly LibraryItem[];
  kind: LibraryRecordKind;
  search?: string;
  filter?: LibraryFilterId;
  sort?: LibrarySortId;
  visibleCount?: number;
  pageSize?: number;
  /** When provided, overrides individual fields. */
  ui?: Partial<LibraryUiState>;
};

/**
 * Compose search → filter → sort → paginate for a library surface.
 */
export function applyLibraryQuery(
  input: LibraryQueryInput,
): LibraryQueryResult {
  const search = input.ui?.search ?? input.search ?? "";
  const filter = input.ui?.filter ?? input.filter ?? "all";
  const sort = input.ui?.sort ?? input.sort ?? "recently_updated";
  const pageSize = input.ui?.pageSize ?? input.pageSize ?? 12;
  const visibleCount =
    input.ui?.visibleCount ?? input.visibleCount ?? pageSize;

  const searched = filterLibraryItemsBySearch(input.items, search);
  const filtered = filterLibraryItems(searched, filter, input.kind);
  const sorted = sortLibraryItems(filtered, sort);
  const page = paginateLibraryItems(sorted, visibleCount, pageSize);
  return {
    ...page,
    totalSource: input.items.length,
    totalMatched: sorted.length,
  };
}
