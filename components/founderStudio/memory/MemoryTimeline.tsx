"use client";

import type { FounderTimelineEvent } from "@/lib/founder/memory/types";

type MemoryTimelineProps = {
  events: FounderTimelineEvent[];
};

const KIND_LABELS: Record<FounderTimelineEvent["kind"], string> = {
  "product-idea": "Product Idea",
  "workshop-approved": "Workshop",
  "feature-launched": "Launch",
  "pricing-changed": "Pricing",
  "research-discovered": "Research",
  lesson: "Lesson",
  "customer-insight": "Customer Insight",
  "strategic-shift": "Strategic Shift",
  milestone: "Milestone",
  decision: "Decision",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MemoryTimeline({ events }: MemoryTimelineProps) {
  return (
    <section className="memory-timeline" aria-labelledby="memory-timeline-heading">
      <h2 className="memory-timeline__heading" id="memory-timeline-heading">
        Memory Timeline
      </h2>
      <ol className="memory-timeline__track">
        {events.map((event) => (
          <li key={event.id} className="memory-timeline__event">
            <div className="memory-timeline__marker" aria-hidden="true" />
            <div className="memory-timeline__content">
              <div className="memory-timeline__meta">
                <span className="memory-timeline__kind">
                  {KIND_LABELS[event.kind]}
                </span>
                <time dateTime={event.occurredAt}>{formatWhen(event.occurredAt)}</time>
              </div>
              <h3 className="memory-timeline__title">{event.title}</h3>
              <p className="memory-timeline__summary">{event.summary}</p>
              {event.relatedRefs.length > 0 ? (
                <ul className="memory-timeline__refs">
                  {event.relatedRefs.map((r) => (
                    <li key={`${r.kind}-${r.id}`}>{r.label}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
