"use client";

import type { BlueprintStartPath } from "@/lib/universalBlueprintInterface";

type Props = {
  recommendedPath?: BlueprintStartPath;
  onChoose: (path: BlueprintStartPath) => void;
};

const PATHS: {
  id: BlueprintStartPath;
  title: string;
  hint: string;
}[] = [
  {
    id: "start_from_scratch",
    title: "Start From Scratch",
    hint: "Begin with a blank plan and shape it as you go.",
  },
  {
    id: "start_from_blueprint",
    title: "Start From Blueprint",
    hint: "Use a proven structure — preview first, then adapt.",
  },
  {
    id: "build_from_previous_work",
    title: "Build From Previous Work",
    hint: "Reuse only what you choose from something you’ve already built.",
  },
];

/**
 * Three primary start paths — progressive disclosure, not a catalogue dump.
 */
export function UniversalBlueprintEntry({
  recommendedPath = "start_from_blueprint",
  onChoose,
}: Props) {
  return (
    <section
      className="ubi-root"
      data-testid="universal-blueprint-entry"
      aria-labelledby="ubi-entry-heading"
    >
      <h2 id="ubi-entry-heading" className="text-xl text-[var(--ubi-ink)]">
        How would you like to begin?
      </h2>
      <p className="ubi-muted mt-2">
        One step at a time. You can change depth later without starting over.
      </p>
      <div className="ubi-path-grid mt-4">
        {PATHS.map((path) => (
          <button
            key={path.id}
            type="button"
            className="ubi-path-btn"
            data-primary={path.id === recommendedPath ? "true" : "false"}
            data-testid={`ubi-path-${path.id}`}
            onClick={() => onChoose(path.id)}
          >
            <span className="ubi-path-btn__title">{path.title}</span>
            <span className="ubi-path-btn__hint">{path.hint}</span>
            {path.id === recommendedPath ? (
              <span className="ubi-muted mt-2 block text-xs font-semibold uppercase tracking-wide">
                Suggested next
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}
