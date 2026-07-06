"use client";

import type { MemoryReplayEntryPoint } from "@/lib/executiveMemoryTheater/types";

type MemoryTheaterEntryProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  entryPoints: MemoryReplayEntryPoint[];
  neverAgainLibrary: string[];
  doThisAgainLibrary: string[];
  onSelectEntry: (phrase: string) => void;
};

export function MemoryTheaterEntry({
  query,
  onQueryChange,
  onSubmit,
  entryPoints,
  neverAgainLibrary,
  doThisAgainLibrary,
  onSelectEntry,
}: MemoryTheaterEntryProps) {
  return (
    <>
      <section className="founder-memory-theater__entry" aria-labelledby="memory-theater-entry-title">
        <h2 className="founder-memory-theater__section-title" id="memory-theater-entry-title">
          What would you like to replay?
        </h2>
        <p className="founder-memory-theater__lead">
          Walk into the living history of Visual Spark Studios — elegant stories, not document archives.
        </p>

        <form
          className="founder-memory-theater__entry-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <label htmlFor="memory-theater-query" className="sr-only">
            What would you like to replay?
          </label>
          <input
            id="memory-theater-query"
            type="text"
            className="founder-memory-theater__entry-input"
            placeholder="Replay a decision, launch, mission, or year…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
          <button type="submit" className="founder-memory-theater__run-button">
            Begin replay
          </button>
        </form>

        <ul className="founder-memory-theater__entry-grid">
          {entryPoints.map((ep) => (
            <li key={ep.id}>
              <button
                type="button"
                className="founder-memory-theater__entry-card"
                onClick={() => onSelectEntry(ep.phrase)}
              >
                <span className="founder-memory-theater__entry-label">{ep.label}</span>
                <span className="founder-memory-theater__entry-phrase">{ep.phrase}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="founder-memory-theater__libraries" aria-labelledby="wisdom-libraries">
        <h2 className="founder-memory-theater__section-title" id="wisdom-libraries">
          Organizational wisdom
        </h2>
        <div className="founder-memory-theater__library-pair">
          <div>
            <h3 className="founder-memory-theater__subhead">Never again</h3>
            <ul className="founder-memory-theater__bullets">
              {neverAgainLibrary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="founder-memory-theater__subhead">Do this again</h3>
            <ul className="founder-memory-theater__bullets">
              {doThisAgainLibrary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
