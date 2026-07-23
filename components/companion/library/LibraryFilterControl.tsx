"use client";

import type { LibraryFilterId } from "@/lib/sparkLibraryCollection/types";

type Option = { id: LibraryFilterId; label: string };

type Props = {
  value: LibraryFilterId;
  options: readonly Option[];
  onChange: (value: LibraryFilterId) => void;
  label?: string;
};

export function LibraryFilterControl({
  value,
  options,
  onChange,
  label = "Filter",
}: Props) {
  return (
    <div className="spark-library-toolbar__field">
      <label htmlFor="library-filter">{label}</label>
      <select
        id="library-filter"
        value={value}
        onChange={(e) => onChange(e.target.value as LibraryFilterId)}
        data-testid="library-filter"
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
