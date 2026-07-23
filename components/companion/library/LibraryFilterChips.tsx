"use client";

import { activeFilterChips } from "@/lib/sparkLibraryCollection/filter";
import type {
  LibraryFilterId,
  LibraryRecordKind,
} from "@/lib/sparkLibraryCollection/types";

type Props = {
  filter: LibraryFilterId;
  kind: LibraryRecordKind;
  search: string;
  onClearFilter: () => void;
  onClearSearch: () => void;
  onClearAll: () => void;
};

export function LibraryFilterChips({
  filter,
  kind,
  search,
  onClearFilter,
  onClearSearch,
  onClearAll,
}: Props) {
  const chips = activeFilterChips(filter, kind);
  const hasSearch = Boolean(search.trim());
  if (!chips.length && !hasSearch) return null;

  return (
    <div className="spark-library-chips" data-testid="library-filter-chips">
      {hasSearch ? (
        <span className="spark-library-chip" data-testid="library-chip-search">
          Search: {search.trim()}
          <button
            type="button"
            aria-label="Remove search"
            onClick={onClearSearch}
          >
            ×
          </button>
        </span>
      ) : null}
      {chips.map((chip) => (
        <span
          key={chip.id}
          className="spark-library-chip"
          data-testid={`library-chip-${chip.id}`}
        >
          {chip.label}
          <button
            type="button"
            aria-label={`Remove filter ${chip.label}`}
            onClick={onClearFilter}
          >
            ×
          </button>
        </span>
      ))}
      <button
        type="button"
        className="spark-library-clear"
        data-testid="library-clear-filters"
        onClick={onClearAll}
      >
        Clear Filters
      </button>
    </div>
  );
}
