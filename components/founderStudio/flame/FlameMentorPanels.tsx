import type { FlameMentorPanel } from "@/lib/founder/flame/types";

type FlameMentorPanelsProps = {
  panels: FlameMentorPanel[];
};

export function FlameMentorPanels({ panels }: FlameMentorPanelsProps) {
  return (
    <section className="founder-flame-panels" aria-labelledby="flame-panels-heading">
      <h2 className="founder-flame-panels__title" id="flame-panels-heading">
        Mentor Presence
      </h2>
      <div className="founder-flame-panels__grid">
        {panels.map((panel) => (
          <article
            key={panel.id}
            className={`founder-flame-panel founder-flame-panel--${panel.kind}`}
          >
            <h3 className="founder-flame-panel__title">{panel.title}</h3>
            <p className="founder-flame-panel__body">{panel.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
