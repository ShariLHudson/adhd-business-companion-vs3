"use client";

type DiscoveryEntryZoneProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  onDiscoverAll: () => void;
  discoveryCount: number;
  alertCount: number;
};

export function DiscoveryEntryZone({
  query,
  onQueryChange,
  onSubmit,
  onDiscoverAll,
  discoveryCount,
  alertCount,
}: DiscoveryEntryZoneProps) {
  return (
    <section className="founder-relationship-intel__entry" aria-labelledby="ri-entry-title">
      <h2 className="founder-relationship-intel__section-title" id="ri-entry-title">
        What might we be missing?
      </h2>
      <p className="founder-relationship-intel__lead">
        Founder discovers relationships humans rarely notice — hidden patterns, not search results.
      </p>

      {alertCount > 0 ? (
        <p className="founder-relationship-intel__alert-banner">
          {alertCount} Founder Alert{alertCount > 1 ? "s" : ""} — material insights waiting
        </p>
      ) : null}

      <form
        className="founder-relationship-intel__entry-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label htmlFor="ri-query" className="sr-only">
          What might we be missing?
        </label>
        <input
          id="ri-query"
          type="text"
          className="founder-relationship-intel__entry-input"
          placeholder="Customer patterns, gaps, butterfly chains…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <button type="submit" className="founder-relationship-intel__run-button">
          Discover
        </button>
      </form>

      <button type="button" className="founder-relationship-intel__discover-all" onClick={onDiscoverAll}>
        Show all {discoveryCount} active discoveries
      </button>
    </section>
  );
}
