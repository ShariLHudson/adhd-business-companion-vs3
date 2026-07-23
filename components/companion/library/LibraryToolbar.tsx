"use client";

import type { ReactNode } from "react";
import { LibraryFilterControl } from "./LibraryFilterControl";
import { LibraryFilterChips } from "./LibraryFilterChips";
import { LibrarySearch } from "./LibrarySearch";
import { LibrarySortControl } from "./LibrarySortControl";
import { LibraryViewControl } from "./LibraryViewControl";
import type {
  LibraryFilterId,
  LibraryRecordKind,
  LibrarySortId,
  LibraryViewMode,
} from "@/lib/sparkLibraryCollection/types";

type FilterOption = { id: LibraryFilterId; label: string };
type SortOption = { id: LibrarySortId; label: string };

type Props = {
  kind: LibraryRecordKind;
  search: string;
  filter: LibraryFilterId;
  sort: LibrarySortId;
  view: LibraryViewMode;
  filterOptions: readonly FilterOption[];
  sortOptions: readonly SortOption[];
  searchLabel: string;
  matchedCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: LibraryFilterId) => void;
  onSortChange: (value: LibrarySortId) => void;
  onViewChange: (value: LibraryViewMode) => void;
  onClearFilters: () => void;
  trailing?: ReactNode;
};

export function LibraryToolbar({
  kind,
  search,
  filter,
  sort,
  view,
  filterOptions,
  sortOptions,
  searchLabel,
  matchedCount,
  totalCount,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onViewChange,
  onClearFilters,
  trailing,
}: Props) {
  return (
    <div data-testid="library-toolbar">
      <div className="spark-library-toolbar">
        <LibrarySearch
          value={search}
          onChange={onSearchChange}
          label={searchLabel}
          placeholder={searchLabel}
        />
        <LibraryFilterControl
          value={filter}
          options={filterOptions}
          onChange={onFilterChange}
        />
        <LibrarySortControl
          value={sort}
          options={sortOptions}
          onChange={onSortChange}
        />
        <LibraryViewControl value={view} onChange={onViewChange} />
        {trailing}
      </div>
      <LibraryFilterChips
        filter={filter}
        kind={kind}
        search={search}
        onClearFilter={() => onFilterChange("all")}
        onClearSearch={() => onSearchChange("")}
        onClearAll={onClearFilters}
      />
      <p className="spark-library-meta" data-testid="library-count">
        Showing {matchedCount} of {totalCount}
      </p>
    </div>
  );
}
