"use client";

import type { SimulationSuggestedDecision } from "@/lib/executiveSimulation/types";

type SimulationEntryZoneProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  suggestedDecisions: SimulationSuggestedDecision[];
  onSelectSuggested: (phrase: string) => void;
};

export function SimulationEntryZone({
  query,
  onQueryChange,
  onSubmit,
  suggestedDecisions,
  onSelectSuggested,
}: SimulationEntryZoneProps) {
  return (
    <section className="founder-simulation__entry" aria-labelledby="simulation-entry-title">
      <h2 className="founder-simulation__section-title" id="simulation-entry-title">
        What decision are we exploring?
      </h2>
      <p className="founder-simulation__lead">
        Founder compares possible futures — not predictions. Understand tradeoffs before you commit.
      </p>

      <form
        className="founder-simulation__entry-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label htmlFor="simulation-query" className="sr-only">
          What decision are we exploring?
        </label>
        <input
          id="simulation-query"
          type="text"
          className="founder-simulation__entry-input"
          placeholder="Should we launch now? Raise pricing? Build Founder first?"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <button type="submit" className="founder-simulation__run-button">
          Compare paths
        </button>
      </form>

      <ul className="founder-simulation__suggestions">
        {suggestedDecisions.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="founder-simulation__suggestion-chip"
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
