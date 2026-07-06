import type { MissionTimelineEvent } from "@/lib/founder/missions";

const KIND_LABELS: Record<MissionTimelineEvent["kind"], string> = {
  idea: "Idea",
  research: "Research",
  decision: "Decision",
  milestone: "Build",
  marketing: "Marketing",
  launch: "Launch",
  update: "Update",
};

type MissionTimelineProps = {
  events: MissionTimelineEvent[];
};

export function MissionTimeline({ events }: MissionTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <section className="founder-mission-timeline" aria-labelledby="founder-mission-timeline-title">
        <h3 className="founder-mission-timeline__title" id="founder-mission-timeline-title">
          Mission timeline
        </h3>
        <p className="founder-mission-timeline__empty">Timeline will grow as this mission moves.</p>
      </section>
    );
  }

  return (
    <section className="founder-mission-timeline" aria-labelledby="founder-mission-timeline-title">
      <h3 className="founder-mission-timeline__title" id="founder-mission-timeline-title">
        Mission timeline
      </h3>
      <ol className="founder-mission-timeline__list">
        {sorted.map((event) => (
          <li key={event.id} className="founder-mission-timeline__item">
            <span className="founder-mission-timeline__kind">{KIND_LABELS[event.kind]}</span>
            <span className="founder-mission-timeline__title-text">{event.title}</span>
            <p className="founder-mission-timeline__summary">{event.summary}</p>
            <time className="founder-mission-timeline__date" dateTime={event.occurredAt}>
              {new Date(event.occurredAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </li>
        ))}
      </ol>
    </section>
  );
}
