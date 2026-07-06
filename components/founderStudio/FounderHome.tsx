import { getTodayBrief } from "@/lib/founder/briefs";

import { FounderInputBar } from "./FounderInputBar";
import { FounderIntelStrip } from "./FounderIntelStrip";
import { FounderRoomNav } from "./FounderRoomNav";
import {
  ExecutivePanel,
  PriorityBadge,
} from "./executive";

function trendGlyph(direction: "up" | "down" | "watch") {
  if (direction === "up") return "↑";
  if (direction === "down") return "↓";
  return "◎";
}

export function FounderHome() {
  const brief = getTodayBrief();

  return (
    <div className="founder-home">
      <header className="founder-home__hero">
        <p className="founder-home__eyebrow">Founder Studio™ · Private</p>
        <h1 className="founder-home__greeting">{brief.greeting}</h1>
        <p className="founder-home__prompt">{brief.prompt}</p>
        <FounderInputBar />
      </header>

      <FounderIntelStrip />

      <div className="founder-home__grid">
        <ExecutivePanel
          title="Today at a Glance"
          subtitle="Critical · Opportunities · Quick Wins · On Deck"
          collapsible
          defaultOpen
          className="founder-home__glance"
        >
          <div className="founder-glance">
            {brief.glance.map((section) => (
              <div key={section.id} className="founder-glance__section">
                <h3 className="founder-glance__section-title">{section.title}</h3>
                <ul className="founder-glance__list">
                  {section.items.map((item) => (
                    <li key={item.id} className="founder-glance__item">
                      <PriorityBadge tone={item.tone}>{item.label}</PriorityBadge>
                      <p>{item.summary}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ExecutivePanel>

        <ExecutivePanel
          title={brief.bestIdea.title}
          className="founder-home__best-idea"
        >
          <PriorityBadge tone={brief.bestIdea.tone ?? "insight"}>
            Insight
          </PriorityBadge>
          <p className="founder-home__lead">{brief.bestIdea.summary}</p>
        </ExecutivePanel>

        <ExecutivePanel title="Cursor Priorities" subtitle="Three max">
          <ol className="founder-priority-list">
            {brief.priorities.map((item, index) => (
              <li key={item.id}>
                <span className="founder-priority-list__index">{index + 1}</span>
                <div>
                  <p className="founder-priority-list__title">{item.title}</p>
                  {item.note ? (
                    <p className="founder-priority-list__note">{item.note}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </ExecutivePanel>

        <ExecutivePanel title="Customer Pulse" subtitle="Three signals max">
          <ul className="founder-signal-list">
            {brief.customerSignals.map((signal) => (
              <li key={signal.id}>
                <strong>{signal.label}</strong>
                <span>{signal.detail}</span>
              </li>
            ))}
          </ul>
        </ExecutivePanel>

        <ExecutivePanel title="Trend Radar" collapsible defaultOpen={false}>
          <ul className="founder-trend-list">
            {brief.trends.map((trend) => (
              <li key={trend.id} className={`founder-trend founder-trend--${trend.direction}`}>
                <span className="founder-trend__glyph" aria-hidden="true">
                  {trendGlyph(trend.direction)}
                </span>
                <div>
                  <p className="founder-trend__label">{trend.label}</p>
                  <p className="founder-trend__note">{trend.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </ExecutivePanel>

        <ExecutivePanel title={brief.revenueOpportunity.title}>
          <PriorityBadge tone={brief.revenueOpportunity.tone ?? "revenue"}>
            Revenue
          </PriorityBadge>
          <p className="founder-home__lead">{brief.revenueOpportunity.summary}</p>
        </ExecutivePanel>

        <ExecutivePanel
          title="Ignore Today"
          subtitle="Not your problem today"
          collapsible
          defaultOpen={false}
          className="founder-home__ignore"
        >
          <ul className="founder-ignore-list">
            {brief.ignoreItems.map((item) => (
              <li key={item.id}>
                <PriorityBadge tone="ignore">Ignore</PriorityBadge>
                <span>{item.summary}</span>
              </li>
            ))}
          </ul>
        </ExecutivePanel>
      </div>

      <FounderRoomNav />
    </div>
  );
}
