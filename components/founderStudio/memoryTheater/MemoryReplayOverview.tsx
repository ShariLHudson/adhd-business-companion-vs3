"use client";

import type { MemoryReplay } from "@/lib/executiveMemoryTheater/types";

type MemoryReplayOverviewProps = {
  replay: MemoryReplay;
  onOpenDetail: () => void;
  onClose: () => void;
};

export function MemoryReplayOverview({ replay, onOpenDetail, onClose }: MemoryReplayOverviewProps) {
  return (
    <article className="founder-memory-theater__overview">
      <button type="button" className="founder-memory-theater__back" onClick={onClose}>
        ← New replay
      </button>

      <header className="founder-memory-theater__header">
        <p className="founder-memory-theater__meta">
          {replay.kind.replace(/-/g, " ")} · {replay.period}
        </p>
        <h2 className="founder-memory-theater__title">{replay.title}</h2>
        <p className="founder-memory-theater__subtitle">{replay.subtitle}</p>
        <p className="founder-memory-theater__prose">{replay.executiveSummary}</p>
      </header>

      <section className="founder-memory-theater__story-rail" aria-labelledby="story-rail">
        <h3 className="founder-memory-theater__section-title" id="story-rail">
          The story
        </h3>
        <ol className="founder-memory-theater__timeline">
          {replay.story.map((stage, index) => (
            <li key={stage.id} className="founder-memory-theater__timeline-step">
              <span className="founder-memory-theater__timeline-marker">{index + 1}</span>
              <div>
                <strong>{stage.label}</strong>
                <p className="founder-memory-theater__prose">{stage.narrative}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {replay.evolutionMap ? (
        <section className="founder-memory-theater__evolution" aria-labelledby="evolution-map">
          <h3 className="founder-memory-theater__section-title" id="evolution-map">
            Evolution map
          </h3>
          <ol className="founder-memory-theater__evolution-steps">
            {replay.evolutionMap.map((step) => (
              <li key={step.id}>
                <strong>{step.label}</strong>
                {step.date ? <span className="founder-memory-theater__muted"> · {step.date}</span> : null}
                <p className="founder-memory-theater__prose">{step.summary}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="founder-memory-theater__shari-preview" aria-labelledby="shari-preview">
        <h3 className="founder-memory-theater__section-title" id="shari-preview">
          What Present-Day Shari would say
        </h3>
        <p className="founder-memory-theater__prose">{replay.shariReflection.presentToPast}</p>
        <p className="founder-memory-theater__muted">{replay.shariReflection.growthSummary}</p>
      </section>

      <button type="button" className="founder-memory-theater__detail-button" onClick={onOpenDetail}>
        Open full replay — decision room, historical simulation, wisdom index
      </button>
    </article>
  );
}
