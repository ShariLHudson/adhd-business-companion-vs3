"use client";

import type { FounderMemorySearchScope } from "@/lib/founder/memory/types";
import { MEMORY_SEARCH_SCOPES } from "@/lib/founder/memory/search";

type MemorySearchBarProps = {
  query: string;
  scope: FounderMemorySearchScope;
  onQueryChange: (query: string) => void;
  onScopeChange: (scope: FounderMemorySearchScope) => void;
};

export function MemorySearchBar({
  query,
  scope,
  onQueryChange,
  onScopeChange,
}: MemorySearchBarProps) {
  return (
    <section className="memory-search" aria-labelledby="memory-search-heading">
      <h2 className="memory-search__heading" id="memory-search-heading">
        Search the Archive
      </h2>
      <div className="memory-search__controls">
        <input
          type="search"
          className="memory-search__input"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search decisions, ideas, lessons, timeline…"
          aria-label="Search founder memory"
        />
        <select
          className="memory-search__scope"
          value={scope}
          onChange={(event) =>
            onScopeChange(event.target.value as FounderMemorySearchScope)
          }
          aria-label="Search scope"
        >
          {MEMORY_SEARCH_SCOPES.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
