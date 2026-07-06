import type { ResearchAlert } from "@/lib/research/types";

type ResearchAlertsPanelProps = {
  alerts: ResearchAlert[];
};

const ACTION_LABEL: Record<ResearchAlert["suggestedAction"], string> = {
  adopt: "Adopt",
  test: "Test",
  watch: "Watch",
  ignore: "Ignore",
};

export function ResearchAlertsPanel({ alerts }: ResearchAlertsPanelProps) {
  if (alerts.length === 0) return null;

  return (
    <section className="founder-research__alerts" aria-labelledby="research-alerts-title">
      <h2 className="founder-research__section-title" id="research-alerts-title">
        Significant findings
      </h2>
      <p className="founder-research__muted">Only what truly matters — with a clear recommendation.</p>
      <ul className="founder-research__alert-list">
        {alerts.map((alert) => (
          <li key={alert.id} className="founder-research__alert-card">
            <p className="founder-research__alert-title">{alert.title}</p>
            <p className="founder-research__alert-body">
              <strong>What happened:</strong> {alert.whatHappened}
            </p>
            <p className="founder-research__alert-body">
              <strong>Why it matters:</strong> {alert.whyItMatters}
            </p>
            <p className="founder-research__alert-action">
              <span className={`founder-research__action-badge founder-research__action-badge--${alert.suggestedAction}`}>
                {ACTION_LABEL[alert.suggestedAction]}
              </span>
              {alert.actionRationale}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
