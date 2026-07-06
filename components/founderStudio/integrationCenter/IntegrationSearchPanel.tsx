"use client";

import type { IntegrationSearchView } from "@/lib/executiveIntegration/types";

type IntegrationSearchPanelProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  searchView: IntegrationSearchView | null;
};

export function IntegrationSearchPanel({
  query,
  onQueryChange,
  onSearch,
  searchView,
}: IntegrationSearchPanelProps) {
  return (
    <section className="founder-integration__search" aria-labelledby="integration-search-title">
      <h2 className="founder-integration__section-title" id="integration-search-title">
        Executive Search
      </h2>
      <p className="founder-integration__lead">
        Find anything across connected systems — missions, campaigns, documents, prompts.
      </p>

      <form
        className="founder-integration__search-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >
        <label htmlFor="integration-search" className="sr-only">
          Search across connected systems
        </label>
        <input
          id="integration-search"
          type="search"
          className="founder-integration__search-input"
          placeholder="Listening Rooms, PostCraft campaign, latest email…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <button type="submit" className="founder-integration__search-button">
          Search
        </button>
      </form>

      {searchView && searchView.results.length > 0 ? (
        <ul className="founder-integration__search-results">
          {searchView.results.map((result) => (
            <li key={result.id} className="founder-integration__search-result">
              <p className="founder-integration__search-result-title">{result.title}</p>
              <p className="founder-integration__search-result-meta">
                {result.integrationName} · {result.groupId.replace(/-/g, " ")}
              </p>
              <p className="founder-integration__search-result-summary">{result.summary}</p>
              {result.openUrl ? (
                <a
                  className="founder-integration__search-link"
                  href={result.openUrl}
                  target={result.openUrl.startsWith("http") ? "_blank" : undefined}
                  rel={result.openUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  Open
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : searchView ? (
        <p className="founder-integration__muted">No matches — try a product name or document title.</p>
      ) : null}
    </section>
  );
}
