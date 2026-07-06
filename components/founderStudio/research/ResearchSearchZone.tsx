"use client";

import type { ResearchSuggestedQuery } from "@/lib/research/types";

type ResearchSearchZoneProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  suggestedQueries: ResearchSuggestedQuery[];
  onSelectSuggested: (phrase: string) => void;
};

export function ResearchSearchZone({
  query,
  onQueryChange,
  onSubmit,
  suggestedQueries,
  onSelectSuggested,
}: ResearchSearchZoneProps) {
  return (
    <section className="founder-research__search" aria-labelledby="research-search-title">
      <h2 className="founder-research__section-title" id="research-search-title">
        Ask your research department
      </h2>
      <p className="founder-research__lead">
        Plain language. Spark context. Answer → evidence → what to do next.
      </p>
      <form
        className="founder-research__search-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label htmlFor="research-query" className="sr-only">
          Research question
        </label>
        <input
          id="research-query"
          type="search"
          className="founder-research__search-input"
          placeholder="What does Shari need to know?"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <button type="submit" className="founder-research__search-button">
          Research
        </button>
      </form>
      <ul className="founder-research__suggestions">
        {suggestedQueries.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="founder-research__suggestion-chip"
              onClick={() => onSelectSuggested(item.phrase)}
            >
              {item.phrase}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
