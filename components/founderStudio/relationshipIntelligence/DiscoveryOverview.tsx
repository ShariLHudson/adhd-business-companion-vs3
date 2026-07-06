"use client";

import type { RelationshipIntelligenceSessionView } from "@/lib/executiveRelationshipIntelligence/types";

type DiscoveryOverviewProps = {
  session: RelationshipIntelligenceSessionView;
  onSelectDiscovery: (id: string) => void;
  onClose: () => void;
};

export function DiscoveryOverview({ session, onSelectDiscovery, onClose }: DiscoveryOverviewProps) {
  return (
    <article className="founder-relationship-intel__overview">
      <button type="button" className="founder-relationship-intel__back" onClick={onClose}>
        ← New discovery
      </button>

      <header className="founder-relationship-intel__header">
        <p className="founder-relationship-intel__meta">{session.discoveries.length} discoveries</p>
        <h2 className="founder-relationship-intel__title">{session.query}</h2>
      </header>

      {session.founderAlerts.length > 0 ? (
        <section className="founder-relationship-intel__alerts" aria-labelledby="founder-alerts">
          <h3 className="founder-relationship-intel__section-title" id="founder-alerts">
            Founder Alert™
          </h3>
          <ul className="founder-relationship-intel__alert-list">
            {session.founderAlerts.map((alert) => (
              <li key={alert.id} className="founder-relationship-intel__alert-card">
                <span className="founder-relationship-intel__urgency">{alert.urgency}</span>
                <strong>{alert.title}</strong>
                <p className="founder-relationship-intel__prose">{alert.whyItMatters}</p>
                <button
                  type="button"
                  className="founder-relationship-intel__alert-link"
                  onClick={() => onSelectDiscovery(alert.discoveryId)}
                >
                  View full discovery
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="founder-relationship-intel__cards" aria-labelledby="discovery-cards">
        <h3 className="founder-relationship-intel__section-title" id="discovery-cards">
          Nobody asked — but Founder noticed
        </h3>
        <ul className="founder-relationship-intel__card-grid">
          {session.discoveries.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                className="founder-relationship-intel__card"
                onClick={() => onSelectDiscovery(d.id)}
              >
                <span className="founder-relationship-intel__category">{d.category.replace(/-/g, " ")}</span>
                <span className="founder-relationship-intel__card-opener">{d.nobodyAskedOpener}</span>
                <span className="founder-relationship-intel__card-headline">{d.headline}</span>
                <span className="founder-relationship-intel__card-why">{d.whyShariShouldCare}</span>
                <span className="founder-relationship-intel__card-meta">
                  {d.confidence} confidence · {d.recommendedAction.replace(/-/g, " ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
