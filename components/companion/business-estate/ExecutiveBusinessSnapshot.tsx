"use client";

import {
  buildExecutiveSnapshotFacts,
  executiveBusinessStatusLabel,
  executiveSnapshotNarrative,
  getExecutiveBusinessStatus,
} from "@/lib/profile/executiveOfficePresentation";

type Props = {
  revision: number;
};

/** Business Snapshot — compact executive briefing from approved facts only. */
export function ExecutiveBusinessSnapshot({ revision }: Props) {
  const facts = buildExecutiveSnapshotFacts();
  const status = getExecutiveBusinessStatus();
  const statusLabel = executiveBusinessStatusLabel(status);
  const narrative = executiveSnapshotNarrative();
  const hasNamedFacts = facts.some(
    (f) => f.label !== "Profile status",
  );

  return (
    <section
      className="executive-office-snapshot"
      aria-label="Business Snapshot"
      key={revision}
    >
      <div className="executive-office-snapshot__head">
        <p className="executive-office-snapshot__eyebrow">Business Snapshot</p>
        <span
          className={`executive-office-snapshot__status executive-office-snapshot__status--${status}`}
        >
          {statusLabel}
        </span>
      </div>

      {hasNamedFacts ? (
        <dl className="executive-office-snapshot__facts">
          {facts.map((fact) => (
            <div key={fact.label} className="executive-office-snapshot__fact">
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="executive-office-snapshot__empty">{narrative}</p>
      )}
    </section>
  );
}
