"use client";

import type { ExecutiveIntegration } from "@/lib/executiveIntegration/types";
import {
  resolveIntegrationActionHref,
  resolveIntegrationConnectionLabel,
  type MarketingIntegrationLiveStatus,
} from "@/lib/executiveIntegration";

import { IntegrationCard } from "./IntegrationCard";

type MarketingIntegrationsPanelProps = {
  integrations: ExecutiveIntegration[];
  liveStatus: MarketingIntegrationLiveStatus;
};

const CONNECTION_LABEL = {
  connected: "Connected",
  "not-connected": "Not connected",
} as const;

export function MarketingIntegrationsPanel({
  integrations,
  liveStatus,
}: MarketingIntegrationsPanelProps) {
  const featured = integrations.filter(
    (i) => i.id === "postcraft" || i.id === "gohighlevel",
  );

  if (featured.length === 0) return null;

  return (
    <section className="founder-integration__marketing" aria-labelledby="marketing-integrations-title">
      <h2 className="founder-integration__section-title" id="marketing-integrations-title">
        PostCraft & GoHighLevel
      </h2>
      <p className="founder-integration__lead">
        Marketing delivery — Founder prepares, you approve. Status reflects live configuration.
      </p>
      <div className="founder-integration__card-grid founder-integration__card-grid--featured">
        {featured.map((integration) => {
          const connection = resolveIntegrationConnectionLabel(integration, liveStatus);
          return (
            <article
              key={integration.id}
              className={`founder-integration__card founder-integration__card--featured founder-integration__card--${connection}`}
            >
              <header className="founder-integration__card-header">
                <div>
                  <h3 className="founder-integration__card-name">{integration.name}</h3>
                  <p className="founder-integration__card-tagline">{integration.tagline}</p>
                </div>
                <span className={`founder-integration__status founder-integration__status--${connection}`}>
                  {CONNECTION_LABEL[connection]}
                </span>
              </header>

              <div className="founder-integration__capabilities">
                <p className="founder-integration__capabilities-title">What it will do</p>
                <ul className="founder-integration__capabilities-list">
                  {integration.capabilities.map((cap) => (
                    <li key={cap.id}>{cap.label}</li>
                  ))}
                </ul>
              </div>

              {integration.lastActivitySummary ? (
                <p className="founder-integration__activity">{integration.lastActivitySummary}</p>
              ) : null}

              <p className="founder-integration__orchestration">{integration.orchestrationNote}</p>

              <div className="founder-integration__actions">
                {integration.quickActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className="founder-integration__action-button"
                    onClick={() => {
                      const href =
                        resolveIntegrationActionHref(integration.id, action.id) ??
                        integration.openUrl;
                      if (href) {
                        window.open(href, "_blank", "noopener,noreferrer");
                      }
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
