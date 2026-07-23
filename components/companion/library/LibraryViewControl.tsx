"use client";

import type { LibraryViewMode } from "@/lib/sparkLibraryCollection/types";

type Props = {
  value: LibraryViewMode;
  onChange: (value: LibraryViewMode) => void;
};

export function LibraryViewControl({ value, onChange }: Props) {
  return (
    <div className="spark-library-toolbar__field">
      <label htmlFor="library-view">View</label>
      <select
        id="library-view"
        value={value}
        onChange={(e) => onChange(e.target.value as LibraryViewMode)}
        data-testid="library-view"
      >
        <option value="comfortable">Comfortable Cards</option>
        <option value="compact">Compact List</option>
      </select>
    </div>
  );
}
