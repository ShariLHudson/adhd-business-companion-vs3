import { FounderCard } from "./FounderCard";
import { FounderInputBar } from "./FounderInputBar";
import { FounderIntelStrip } from "./FounderIntelStrip";
import { FounderLabel } from "./FounderLabel";
import { FounderPanel } from "./FounderPanel";
import { FounderRoomNav } from "./FounderRoomNav";
import {
  FOUNDER_BEST_IDEA,
  FOUNDER_CURSOR_PRIORITIES,
  FOUNDER_CUSTOMER_PULSE,
  FOUNDER_HOME_GLANCE,
  FOUNDER_IGNORE_TODAY,
  FOUNDER_REVENUE_OPPORTUNITY,
  FOUNDER_TREND_RADAR,
} from "@/lib/founderStudio/sampleData";

function trendGlyph(direction: "up" | "down" | "watch") {
  if (direction === "up") return "↑";
  if (direction === "down") return "↓";
  return "◎";
}

export function FounderHome() {
  return (
    <div className="founder-home">
      <header className="founder-home__hero">
        <p className="founder-home__eyebrow">Founder Studio™ · Private</p>
        <h1 className="founder-home__greeting">Good Morning, Shari.</h1>
        <p className="founder-home__prompt">What would help most right now?</p>
        <FounderInputBar />
      </header>

      <FounderIntelStrip />

      <div className="founder-home__grid">
        <FounderPanel
          title="Today at a Glance"
          subtitle="Critical · Opportunities · Quick Wins · On Deck"
          collapsible
          defaultOpen
          className="founder-home__glance"
        >
          <div className="founder-glance">
            {FOUNDER_HOME_GLANCE.map((section) => (
              <div key={section.id} className="founder-glance__section">
                <h3 className="founder-glance__section-title">{section.title}</h3>
                <ul className="founder-glance__list">
                  {section.items.map((item) => (
                    <li key={item.id} className="founder-glance__item">
                      <FounderLabel tone={item.tone}>{item.label}</FounderLabel>
                      <p>{item.summary}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </FounderPanel>

        <FounderPanel title={FOUNDER_BEST_IDEA.title} className="founder-home__best-idea">
          <FounderLabel tone={FOUNDER_BEST_IDEA.tone}>Insight</FounderLabel>
          <p className="founder-home__lead">{FOUNDER_BEST_IDEA.summary}</p>
        </FounderPanel>

        <FounderPanel title="Cursor Priorities" subtitle="Three max">
          <ol className="founder-priority-list">
            {FOUNDER_CURSOR_PRIORITIES.map((item, index) => (
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
        </FounderPanel>

        <FounderPanel title="Customer Pulse" subtitle="Three signals max">
          <ul className="founder-signal-list">
            {FOUNDER_CUSTOMER_PULSE.map((signal) => (
              <li key={signal.id}>
                <strong>{signal.label}</strong>
                <span>{signal.detail}</span>
              </li>
            ))}
          </ul>
        </FounderPanel>

        <FounderPanel title="Trend Radar" collapsible defaultOpen={false}>
          <ul className="founder-trend-list">
            {FOUNDER_TREND_RADAR.map((trend) => (
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
        </FounderPanel>

        <FounderPanel title={FOUNDER_REVENUE_OPPORTUNITY.title}>
          <FounderLabel tone={FOUNDER_REVENUE_OPPORTUNITY.tone}>Revenue</FounderLabel>
          <p className="founder-home__lead">{FOUNDER_REVENUE_OPPORTUNITY.summary}</p>
        </FounderPanel>

        <FounderPanel
          title="Ignore Today"
          subtitle="Not your problem today"
          collapsible
          defaultOpen={false}
          className="founder-home__ignore"
        >
          <ul className="founder-ignore-list">
            {FOUNDER_IGNORE_TODAY.map((line) => (
              <li key={line}>
                <FounderLabel tone="ignore">Ignore</FounderLabel>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </FounderPanel>
      </div>

      <FounderRoomNav />
    </div>
  );
}
