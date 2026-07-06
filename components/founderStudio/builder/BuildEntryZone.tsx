"use client";

import type { BuildMode, BuildModeId } from "@/lib/executiveBuilder/types";

type BuildEntryZoneProps = {
  query: string;
  onQueryChange: (value: string) => void;
  buildMode: BuildModeId;
  onBuildModeChange: (mode: BuildModeId) => void;
  buildModes: BuildMode[];
  onSubmit: () => void;
  suggestedBuilds: { id: string; phrase: string }[];
  onSelectSuggested: (phrase: string) => void;
};

export function BuildEntryZone({
  query,
  onQueryChange,
  buildMode,
  onBuildModeChange,
  buildModes,
  onSubmit,
  suggestedBuilds,
  onSelectSuggested,
}: BuildEntryZoneProps) {
  return (
    <section className="founder-builder__entry" aria-labelledby="builder-entry-title">
      <h2 className="founder-builder__section-title" id="builder-entry-title">
        What are we building?
      </h2>
      <p className="founder-builder__lead">
        One question. Complete blueprint. Nothing executes until you approve.
      </p>

      <form
        className="founder-builder__entry-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label htmlFor="build-query" className="sr-only">
          What are we building?
        </label>
        <input
          id="build-query"
          type="text"
          className="founder-builder__entry-input"
          placeholder="Listening Rooms™, workshop, lead magnet, feature…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />

        <label htmlFor="build-mode" className="founder-builder__mode-label">
          Build mode
        </label>
        <select
          id="build-mode"
          className="founder-builder__mode-select"
          value={buildMode}
          onChange={(e) => onBuildModeChange(e.target.value as BuildModeId)}
        >
          {buildModes.map((mode) => (
            <option key={mode.id} value={mode.id}>
              {mode.label} — {mode.description}
            </option>
          ))}
        </select>

        <button type="submit" className="founder-builder__build-button">
          Build
        </button>
      </form>

      <ul className="founder-builder__suggestions">
        {suggestedBuilds.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="founder-builder__suggestion-chip"
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
