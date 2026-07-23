"use client";

import { useEffect, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  debounceMs?: number;
  testId?: string;
};

export function LibrarySearch({
  value,
  onChange,
  label,
  placeholder = "Search…",
  debounceMs = 220,
  testId = "library-search",
}: Props) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (draft !== value) onChange(draft);
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [draft, debounceMs, onChange, value]);

  return (
    <div className="spark-library-toolbar__field spark-library-toolbar__field--search">
      <label htmlFor={testId}>{label}</label>
      <input
        id={testId}
        type="search"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        data-testid={testId}
        autoComplete="off"
      />
    </div>
  );
}
