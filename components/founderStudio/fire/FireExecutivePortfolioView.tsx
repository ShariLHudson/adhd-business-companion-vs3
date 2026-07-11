import type {
  FireAlertPriority,
  FireBriefStatus,
  FireExecutivePortfolio,
} from "@/lib/founder/types/fireBrief";

import { FireViewDetailsLink } from "./FireViewDetailsLink";

type FireExecutivePortfolioProps = {
  portfolio: FireExecutivePortfolio;
  /** Archives show a back context; today omits. */
  variant?: "today" | "archive";
};

function statusLabel(status: FireBriefStatus): string {
  if (status === "draft") return "Draft";
  if (status === "reviewed") return "Reviewed";
  return "Archived";
}

function alertLevelLabel(level: FireAlertPriority): string {
  if (level === "attention") return "Attention";
  if (level === "awareness") return "Awareness";
  return "Noted";
}

export function FireExecutivePortfolioView({
  portfolio,
  variant = "today",
}: FireExecutivePortfolioProps) {
  return (
    <article
      className={`fire-portfolio${variant === "archive" ? " fire-portfolio--archive" : ""}`}
      aria-labelledby="fire-portfolio-title"
    >
      <header className="fire-portfolio__cover">
        <div className="fire-portfolio__brand">
          <p className="fire-portfolio__mark">FIRE</p>
          <p className="fire-portfolio__engine">
            Founder Intelligence Report Engine
          </p>
        </div>
        <h2 className="fire-portfolio__title" id="fire-portfolio-title">
          {variant === "today" ? "Today's Executive Brief" : "Executive Brief"}
        </h2>
        <dl className="fire-portfolio__meta">
          <div>
            <dt>Date</dt>
            <dd>{portfolio.dateDisplay}</dd>
          </div>
          <div>
            <dt>Issue</dt>
            <dd>No. {portfolio.issueNumber}</dd>
          </div>
          <div>
            <dt>Prepared For</dt>
            <dd>{portfolio.preparedFor}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <span
                className={`fire-portfolio__status fire-portfolio__status--${portfolio.status}`}
              >
                {statusLabel(portfolio.status)}
              </span>
            </dd>
          </div>
          <div>
            <dt>Reading Time</dt>
            <dd>{portfolio.readingTimeMinutes} minutes</dd>
          </div>
        </dl>
        <div className="fire-portfolio__focus">
          <p className="fire-portfolio__focus-label">Primary Focus</p>
          <p className="fire-portfolio__focus-text">{portfolio.primaryFocus}</p>
        </div>
      </header>

      <section className="fire-portfolio__section" aria-labelledby="fire-summary">
        <div className="fire-portfolio__section-head">
          <h3 id="fire-summary">Executive Summary</h3>
          <FireViewDetailsLink workspaceId="discover" />
        </div>
        <ul className="fire-portfolio__summary-list">
          {portfolio.executiveSummary.map((bullet) => (
            <li key={bullet.id}>
              <span className="fire-portfolio__summary-change">{bullet.whatChanged}</span>
              <span className="fire-portfolio__summary-matter">{bullet.whyItMatters}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="fire-portfolio__section" aria-labelledby="fire-priorities">
        <div className="fire-portfolio__section-head">
          <h3 id="fire-priorities">
            {variant === "today" ? "Today's Priorities" : "Priorities"}
          </h3>
          <FireViewDetailsLink workspaceId="start" />
        </div>
        <ol className="fire-portfolio__priority-list">
          {portfolio.priorities.map((priority, index) => (
            <li key={priority.id}>
              <span className="fire-portfolio__priority-index">{index + 1}</span>
              <div className="fire-portfolio__priority-body">
                <p className="fire-portfolio__priority-title">{priority.title}</p>
                <p className="fire-portfolio__priority-why">{priority.whyItMatters}</p>
                <p className="fire-portfolio__priority-meta">
                  <span>Impact: {priority.estimatedImpact}</span>
                  <span>{priority.recommendedAction}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {portfolio.alerts.length > 0 ? (
        <section className="fire-portfolio__section" aria-labelledby="fire-alerts">
          <div className="fire-portfolio__section-head">
            <h3 id="fire-alerts">Founder Alerts</h3>
            <FireViewDetailsLink workspaceId="team" />
          </div>
          <ul className="fire-portfolio__alert-list">
            {portfolio.alerts.map((alert) => (
              <li key={alert.id} className={`fire-portfolio__alert fire-portfolio__alert--${alert.priorityLevel}`}>
                <span className="fire-portfolio__alert-level">
                  {alertLevelLabel(alert.priorityLevel)}
                </span>
                <p className="fire-portfolio__alert-title">{alert.title}</p>
                <p className="fire-portfolio__alert-text">{alert.explanation}</p>
                <p className="fire-portfolio__alert-action">{alert.recommendedAction}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="fire-portfolio__section" aria-labelledby="fire-opportunities">
        <div className="fire-portfolio__section-head">
          <h3 id="fire-opportunities">Opportunities</h3>
          <FireViewDetailsLink workspaceId="grow" />
        </div>
        <dl className="fire-portfolio__opportunities">
          <div>
            <dt>Top Opportunity</dt>
            <dd>{portfolio.opportunities.top}</dd>
          </div>
          <div>
            <dt>Revenue Opportunity</dt>
            <dd>{portfolio.opportunities.revenue}</dd>
          </div>
          <div>
            <dt>Product Opportunity</dt>
            <dd>{portfolio.opportunities.product}</dd>
          </div>
          <div>
            <dt>Relationship Opportunity</dt>
            <dd>{portfolio.opportunities.relationship}</dd>
          </div>
          <div>
            <dt>Learning Opportunity</dt>
            <dd>{portfolio.opportunities.learning}</dd>
          </div>
        </dl>
      </section>

      {portfolio.decisions.length > 0 ? (
        <section className="fire-portfolio__section" aria-labelledby="fire-decisions">
          <div className="fire-portfolio__section-head">
            <h3 id="fire-decisions">Executive Decisions</h3>
            <FireViewDetailsLink workspaceId="team" />
          </div>
          <ul className="fire-portfolio__decision-list">
            {portfolio.decisions.map((decision) => (
              <li key={decision.id}>
                <p className="fire-portfolio__decision-title">{decision.title}</p>
                <p className="fire-portfolio__decision-summary">{decision.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="fire-portfolio__section" aria-labelledby="fire-dashboard">
        <div className="fire-portfolio__section-head">
          <h3 id="fire-dashboard">Executive Dashboard</h3>
        </div>
        <div className="fire-portfolio__dashboard">
          {portfolio.dashboardPanels.map((panel) => (
            <div key={panel.id} className="fire-portfolio__dashboard-panel">
              <p className="fire-portfolio__dashboard-title">{panel.title}</p>
              <p className="fire-portfolio__dashboard-summary">{panel.summary}</p>
              <FireViewDetailsLink workspaceId={panel.detailWorkspaceId} />
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
