"use client";

import type { GraphSuggestedSearch, SparkEcosystemArea } from "@/lib/executiveIntelligenceGraph/types";

type GraphEntryZoneProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  suggestedSearches: GraphSuggestedSearch[];
  ecosystemAreas: SparkEcosystemArea[];
  onSelectSearch: (phrase: string) => void;
  onSelectNode: (nodeId: string) => void;
  featuredNodeId: string;
};

export function GraphEntryZone({
  query,
  onQueryChange,
  onSubmit,
  suggestedSearches,
  ecosystemAreas,
  onSelectSearch,
  onSelectNode,
  featuredNodeId,
}: GraphEntryZoneProps) {
  return (
    <>
      <section className="founder-graph__entry" aria-labelledby="graph-entry-title">
        <h2 className="founder-graph__section-title" id="graph-entry-title">
          Explore the living brain
        </h2>
        <p className="founder-graph__lead">
          Every product, decision, and idea connected — relationships, not folders.
        </p>

        <form
          className="founder-graph__entry-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <label htmlFor="graph-query" className="sr-only">
            Search the intelligence graph
          </label>
          <input
            id="graph-query"
            type="text"
            className="founder-graph__entry-input"
            placeholder="Show everything connected to Listening Rooms…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
          <button type="submit" className="founder-graph__run-button">
            Explore
          </button>
        </form>

        <ul className="founder-graph__suggestions">
          {suggestedSearches.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="founder-graph__suggestion-chip"
                onClick={() => onSelectSearch(item.phrase)}
              >
                {item.phrase}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="founder-graph__ecosystem" aria-labelledby="ecosystem-view">
        <h2 className="founder-graph__section-title" id="ecosystem-view">
          Spark ecosystem
        </h2>
        <ul className="founder-graph__ecosystem-grid">
          {ecosystemAreas.map((area) => (
            <li key={area.id} className={`founder-graph__eco-card founder-graph__eco-card--${area.direction}`}>
              <span className="founder-graph__eco-label">{area.label}</span>
              <span className="founder-graph__eco-count">{area.nodeCount} nodes</span>
              <p className="founder-graph__eco-summary">{area.summary}</p>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="founder-graph__featured-link"
          onClick={() => onSelectNode(featuredNodeId)}
        >
          Explore featured node — Listening Rooms
        </button>
      </section>
    </>
  );
}
