import { getIntelligenceRoomOverview } from "@/lib/founder/intelligence/services";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { ExecutivePanel } from "./executive";
import { RoomHeader } from "./executive/RoomHeader";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function inboxLabel(status: string): string {
  if (status === "new") return "New";
  if (status === "needs-review") return "Needs Review";
  if (status === "accepted") return "Accepted";
  return "Archived";
}

export function FounderExecutiveIntelligence() {
  const overview = getIntelligenceRoomOverview();

  return (
    <div className="founder-intelligence">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Founder Intelligence Pipeline"
        title="Executive Intelligence"
        question="What is entering the ecosystem?"
        purpose="Incoming signals, timeline, and inbox — plumbing for SPARK, FLAME, and FIRE."
      />

      <section className="founder-intelligence__pipeline" aria-labelledby="intel-pipeline">
        <h2 className="founder-intelligence__section-title" id="intel-pipeline">
          Pipeline Status
        </h2>
        <ol className="founder-intelligence__pipeline-track">
          {overview.pipelineStatus.map((stage) => (
            <li key={stage.id} className="founder-intelligence__pipeline-stage">
              <span className="founder-intelligence__pipeline-count">{stage.count}</span>
              <span className="founder-intelligence__pipeline-label">{stage.label}</span>
              <span className="founder-intelligence__pipeline-note">{stage.description}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="founder-intelligence__grid">
        <ExecutivePanel title="Incoming Signals" subtitle="Newest observations">
          <ul className="founder-intelligence__list">
            {overview.incomingSignals.map((signal) => (
              <li key={signal.id} className="founder-intelligence__list-item">
                <p className="founder-intelligence__item-title">{signal.title}</p>
                <p className="founder-intelligence__item-meta">
                  {signal.sourceId} · {formatWhen(signal.observedAt)}
                </p>
                <p className="founder-intelligence__item-summary">{signal.summary}</p>
              </li>
            ))}
          </ul>
        </ExecutivePanel>

        <ExecutivePanel title="Executive Timeline" subtitle="Chronological record">
          <ol className="founder-intelligence__timeline">
            {overview.timeline.map((event) => (
              <li key={event.id}>
                <p className="founder-intelligence__item-title">{event.title}</p>
                <p className="founder-intelligence__item-meta">
                  {formatWhen(event.occurredAt)}
                  {event.sourceId ? ` · ${event.sourceId}` : ""}
                </p>
                <p className="founder-intelligence__item-summary">{event.summary}</p>
              </li>
            ))}
          </ol>
        </ExecutivePanel>

        <ExecutivePanel
          title="Intelligence Inbox"
          subtitle="Holding area before SPARK review"
          className="founder-intelligence__inbox-panel"
        >
          {(["new", "needs-review", "accepted", "archived"] as const).map((status) => (
            <div key={status} className="founder-intelligence__inbox-lane">
              <h3 className="founder-intelligence__inbox-lane-title">
                {inboxLabel(status)}
              </h3>
              <ul className="founder-intelligence__list">
                {overview.inbox[status].map((item) => (
                  <li key={item.id} className="founder-intelligence__list-item">
                    <p className="founder-intelligence__item-title">{item.title}</p>
                    <p className="founder-intelligence__item-summary">{item.summary}</p>
                  </li>
                ))}
                {overview.inbox[status].length === 0 ? (
                  <li className="founder-intelligence__empty-lane">None</li>
                ) : null}
              </ul>
            </div>
          ))}
        </ExecutivePanel>

        <ExecutivePanel title="Recent Findings" subtitle="Structured from signals">
          <ul className="founder-intelligence__list">
            {overview.recentFindings.map((finding) => (
              <li key={finding.id} className="founder-intelligence__list-item">
                <p className="founder-intelligence__item-title">{finding.title}</p>
                <p className="founder-intelligence__item-meta">
                  {finding.kind} · {finding.sourceId}
                </p>
                <p className="founder-intelligence__item-summary">{finding.summary}</p>
              </li>
            ))}
          </ul>
        </ExecutivePanel>

        <ExecutivePanel
          title="Source Summary"
          subtitle="Registry with sample activity"
          className="founder-intelligence__sources-panel"
        >
          <ul className="founder-intelligence__source-list">
            {overview.sourceSummary.map((source) => (
              <li key={source.sourceId}>
                <div className="founder-intelligence__source-row">
                  <span className="founder-intelligence__source-name">{source.name}</span>
                  <span
                    className={`founder-intelligence__source-status founder-intelligence__source-status--${source.status}`}
                  >
                    {source.status}
                  </span>
                </div>
                <p className="founder-intelligence__item-meta">
                  {source.category} · {source.signalCount} signals · {source.findingCount}{" "}
                  findings
                </p>
              </li>
            ))}
          </ul>
        </ExecutivePanel>
      </div>
    </div>
  );
}
