"use client";

import type { ExecutiveIntegration, IntegrationStatus } from "@/lib/executiveIntegration/types";

const STATUS_LABEL: Record<IntegrationStatus, string> = {
  connected: "Connected",
  "needs-configuration": "Needs Configuration",
  offline: "Offline",
  future: "Future",
  unavailable: "Unavailable",
};

type IntegrationCardProps = {
  integration: ExecutiveIntegration;
};

export function IntegrationCard({ integration }: IntegrationCardProps) {
  return (
    <article className={`founder-integration__card founder-integration__card--${integration.status}`}>
      <header className="founder-integration__card-header">
        <div>
          <h4 className="founder-integration__card-name">{integration.name}</h4>
          <p className="founder-integration__card-tagline">{integration.tagline}</p>
        </div>
        <span className="founder-integration__status">{STATUS_LABEL[integration.status]}</span>
      </header>

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
                if (integration.openUrl && action.kind === "open") {
                  window.open(integration.openUrl, "_blank", "noopener,noreferrer");
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
