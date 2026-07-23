"use client";

import type { LibrarySortId } from "@/lib/sparkLibraryCollection/types";

type Option = { id: LibrarySortId; label: string };

type Props = {
  value: LibrarySortId;
  options: readonly Option[];
  onChange: (value: LibrarySortId) => void;
  label?: string;
};

export function LibrarySortControl({
  value,
  options,
  onChange,
  label = "Sort",
}: Props) {
  return (
    <div className="spark-library-toolbar__field">
      <label htmlFor="library-sort">{label}</label>
      <select
        id="library-sort"
        value={value}
        onChange={(e) => onChange(e.target.value as LibrarySortId)}
        data-testid="library-sort"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
