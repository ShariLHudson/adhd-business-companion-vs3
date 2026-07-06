"use client";

import type { ExecutiveIntegration } from "@/lib/executiveIntegration/types";
import {
  integrationStatusDisplayLabel,
  resolveIntegrationActionHref,
  resolveIntegrationConnectionLabel,
  type MarketingIntegrationLiveStatus,
} from "@/lib/executiveIntegration";

const CONNECTION_CLASS = {
  connected: "connected",
  "not-connected": "needs-configuration",
} as const;

type IntegrationCardProps = {
  integration: ExecutiveIntegration;
  liveStatus?: MarketingIntegrationLiveStatus;
};

export function IntegrationCard({ integration, liveStatus }: IntegrationCardProps) {
  const isMarketing =
    integration.id === "postcraft" || integration.id === "gohighlevel";
  const connection = isMarketing
    ? resolveIntegrationConnectionLabel(integration, liveStatus)
    : null;

  const statusLabel = integrationStatusDisplayLabel(integration, liveStatus);

  const statusClass = connection
    ? CONNECTION_CLASS[connection]
    : integration.status;

  return (
    <article className={`founder-integration__card founder-integration__card--${statusClass}`}>
      <header className="founder-integration__card-header">
        <div>
          <h4 className="founder-integration__card-name">{integration.name}</h4>
          <p className="founder-integration__card-tagline">{integration.tagline}</p>
        </div>
        <span className={`founder-integration__status founder-integration__status--${statusClass}`}>
          {statusLabel}
        </span>
      </header>

      {integration.capabilities.length > 0 ? (
        <div className="founder-integration__capabilities">
          <p className="founder-integration__capabilities-title">What it will do</p>
          <ul className="founder-integration__capabilities-list">
            {integration.capabilities.map((cap) => (
              <li key={cap.id}>{cap.label}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <ul className="founder-integration__highlights">
        {integration.highlights.map((h) => (
          <li key={h.id}>
            <span className="founder-integration__highlight-label">{h.label}</span>
            <span className="founder-integration__highlight-value">{h.value}</span>
          </li>
        ))}
      </ul>

      {integration.lastActivitySummary ? (
        <p className="founder-integration__activity">{integration.lastActivitySummary}</p>
      ) : null}

      {integration.lastConnectedAt ? (
        <p className="founder-integration__meta">
          Last connected {new Date(integration.lastConnectedAt).toLocaleDateString()}
        </p>
      ) : null}

      <p className="founder-integration__orchestration">{integration.orchestrationNote}</p>

      {integration.quickActions.length > 0 ? (
        <div className="founder-integration__actions">
          {integration.quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className="founder-integration__action-button"
              onClick={() => {
                const href =
                  resolveIntegrationActionHref(integration.id, action.id) ??
                  (action.kind === "open" ? integration.openUrl : undefined);
                if (href) {
                  window.open(href, "_blank", "noopener,noreferrer");
                }
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}
