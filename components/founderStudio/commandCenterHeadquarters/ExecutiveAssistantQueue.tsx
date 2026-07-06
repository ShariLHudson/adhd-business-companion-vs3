import type { ExecutiveAssistantItem } from "@/lib/executiveCommandCenter/types";

type ExecutiveAssistantQueueProps = {
  items: ExecutiveAssistantItem[];
};

export function ExecutiveAssistantQueue({ items }: ExecutiveAssistantQueueProps) {
  return (
    <section className="founder-hq__assistant" aria-labelledby="hq-assistant-title">
      <h2 className="founder-hq__section-title" id="hq-assistant-title">
        Executive Assistant — waiting for your approval
      </h2>
      <p className="founder-hq__lead">
        Research, documents, builder packets, and campaigns prepared quietly. Nothing ships without you.
      </p>
      <ul className="founder-hq__assistant-list">
        {items.map((item) => (
          <li key={item.id} className="founder-hq__assistant-item">
            <p className="founder-hq__meta">{item.sourceEngine} · {item.kind.replace(/-/g, " ")}</p>
            <p className="founder-hq__assistant-title">{item.title}</p>
            <p className="founder-hq__prose">{item.summary}</p>
            <span className="founder-hq__draft-badge">Draft — approval required</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
