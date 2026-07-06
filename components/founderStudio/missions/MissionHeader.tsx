import Link from "next/link";

import type { ComposedMission } from "@/lib/founder/missions";

type MissionHeaderProps = {
  composed: ComposedMission;
};

export function MissionHeader({ composed }: MissionHeaderProps) {
  const { mission, overview } = composed;
  const { primaryAction } = overview;

  return (
    <header className="founder-mission-header">
      <div className="founder-mission-header__meta">
        <span className="founder-mission-header__phase">{overview.phase}</span>
        <span className="founder-mission-header__priority">{overview.priorityLabel}</span>
      </div>

      <h2 className="founder-mission-header__name">{mission.name}</h2>
      <p className="founder-mission-header__purpose">{mission.purpose}</p>

      <div className="founder-mission-header__metrics">
        <div className="founder-mission-header__metric">
          <span className="founder-mission-header__metric-label">Progress</span>
          <span className="founder-mission-header__metric-value">{overview.progress}%</span>
          <div
            className="founder-mission-header__progress-bar"
            role="progressbar"
            aria-valuenow={overview.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span
              className="founder-mission-header__progress-fill"
              style={{ width: `${overview.progress}%` }}
            />
          </div>
        </div>
        <div className="founder-mission-header__metric">
          <span className="founder-mission-header__metric-label">Strategic value</span>
          <span className="founder-mission-header__metric-value">{overview.strategicValue}</span>
        </div>
        <div className="founder-mission-header__metric">
          <span className="founder-mission-header__metric-label">Estimated impact</span>
          <span className="founder-mission-header__metric-impact">{overview.estimatedImpact}</span>
        </div>
      </div>

      <div className="founder-mission-header__recommendation">
        <p className="founder-mission-header__recommendation-label">Current recommendation</p>
        <p className="founder-mission-header__recommendation-text">
          {overview.currentRecommendation}
        </p>
      </div>

      <div className="founder-mission-header__primary">
        <p className="founder-mission-header__primary-label">One primary action</p>
        <p className="founder-mission-header__primary-title">{primaryAction.title}</p>
        {primaryAction.summary ? (
          <p className="founder-mission-header__primary-summary">{primaryAction.summary}</p>
        ) : null}
        {primaryAction.href ? (
          <Link className="founder-mission-header__primary-action" href={primaryAction.href}>
            {primaryAction.hrefLabel ?? "Begin"}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
