"use client";

import { useEffect, useState } from "react";
import {
  CATEGORIZATION_MODE_HINT,
  CATEGORIZATION_MODE_LABEL,
  loadCategorizationMode,
  saveCategorizationMode,
  type CategorizationMode,
} from "@/lib/brainDumpClusterPreferences";

const SELECT_CLASS =
  "mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

export function CategorizationModePicker({
  onChange,
}: {
  onChange?: (mode: CategorizationMode) => void;
}) {
  const [mode, setMode] = useState<CategorizationMode>(() =>
    loadCategorizationMode(),
  );

  useEffect(() => {
    setMode(loadCategorizationMode());
  }, []);

  function handleChange(next: CategorizationMode) {
    saveCategorizationMode(next);
    setMode(next);
    onChange?.(next);
  }

  return (
    <div
      className="rounded-xl border border-[#e7dfd4] bg-white/80 px-4 py-3"
      data-testid="categorization-mode-picker"
    >
      <label className="block text-sm font-semibold text-[#1f1c19]">
        Categorization
        <select
          value={mode}
          onChange={(e) => handleChange(e.target.value as CategorizationMode)}
          className={SELECT_CLASS}
          data-testid="categorization-mode-select"
        >
          {(Object.keys(CATEGORIZATION_MODE_LABEL) as CategorizationMode[]).map(
            (key) => (
              <option key={key} value={key}>
                {CATEGORIZATION_MODE_LABEL[key]}
              </option>
            ),
          )}
        </select>
      </label>
      <p className="mt-2 text-sm text-[#6b635a]">{CATEGORIZATION_MODE_HINT[mode]}</p>
    </div>
  );
}
