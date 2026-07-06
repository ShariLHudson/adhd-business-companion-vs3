"use client";

import type { FounderMemorySearchResult } from "@/lib/founder/memory/types";

type MemorySearchResultsProps = {
  results: FounderMemorySearchResult[];
  query: string;
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MemorySearchResults({ results, query }: MemorySearchResultsProps) {
  if (!query.trim()) return null;

  return (
    <section className="memory-search-results" aria-live="polite">
      <p className="memory-search-results__count">
        {results.length} result{results.length === 1 ? "" : "s"}
      </p>
      {results.length === 0 ? (
        <p className="memory-search-results__empty">No matches in sample archive.</p>
      ) : (
        <ul className="memory-search-results__list">
          {results.map((result) => (
            <li key={`${result.scope}-${result.id}`} className="memory-search-results__item">
              <span className="memory-search-results__scope">{result.scope}</span>
              <p className="memory-search-results__title">{result.title}</p>
              <p className="memory-search-results__excerpt">{result.excerpt}</p>
              <p className="memory-search-results__date">{formatWhen(result.occurredAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
