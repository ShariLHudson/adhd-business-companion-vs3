"use client";

import type { DailyDiscoveryBrief } from "@/lib/executiveDiscoveryEngine/types";

type DailyBriefViewProps = {
  brief: DailyDiscoveryBrief;
  onSelectFinding: (id: string) => void;
  onBack: () => void;
};

function FindingCard({
  label,
  finding,
  onSelect,
}: {
  label: string;
  finding: DailyDiscoveryBrief["topDiscovery"];
  onSelect: () => void;
}) {
  return (
    <button type="button" className="founder-discovery-engine__card" onClick={onSelect}>
      <span className="founder-discovery-engine__card-label">{label}</span>
      <span className="founder-discovery-engine__category">{finding.category.replace(/-/g, " ")}</span>
      <span className="founder-discovery-engine__card-headline">{finding.headline}</span>
      <span className="founder-discovery-engine__card-why">{finding.whyImportant}</span>
      <span className="founder-discovery-engine__card-meta">
        {finding.confidence} confidence · {finding.recommendedAction}
      </span>
    </button>
  );
}

export function DailyBriefView({ brief, onSelectFinding, onBack }: DailyBriefViewProps) {
  return (
    <article className="founder-discovery-engine__daily">
      <button type="button" className="founder-discovery-engine__back" onClick={onBack}>
        ← Back
      </button>

      <header className="founder-discovery-engine__header">
        <p className="founder-discovery-engine__meta">Daily Discovery Brief</p>
        <h2 className="founder-discovery-engine__title">{brief.overnightMessage}</h2>
      </header>

      {brief.founderAlert ? (
        <section className="founder-discovery-engine__alert-detail" aria-labelledby="ede-founder-alert">
          <h3 className="founder-discovery-engine__section-title" id="ede-founder-alert">
            Founder Alert
          </h3>
          <span className="founder-discovery-engine__urgency">{brief.founderAlert.urgency}</span>
          <p className="founder-discovery-engine__prose"><strong>{brief.founderAlert.title}</strong></p>
          <p className="founder-discovery-engine__prose">{brief.founderAlert.whyItMatters}</p>
          <button
            type="button"
            className="founder-discovery-engine__link-button"
            onClick={() => onSelectFinding(brief.founderAlert!.findingId)}
          >
            View full finding
          </button>
        </section>
      ) : null}

      <section aria-labelledby="ede-top-discovery">
        <h3 className="founder-discovery-engine__section-title" id="ede-top-discovery">
          Top Discovery
        </h3>
        <FindingCard
          label="Most important today"
          finding={brief.topDiscovery}
          onSelect={() => onSelectFinding(brief.topDiscovery.id)}
        />
      </section>

      <section aria-labelledby="ede-three-findings">
        <h3 className="founder-discovery-engine__section-title" id="ede-three-findings">
          Three Important Findings
        </h3>
        <ul className="founder-discovery-engine__card-grid">
          {brief.importantFindings.map((f) => (
            <li key={f.id}>
              <FindingCard label="Finding" finding={f} onSelect={() => onSelectFinding(f.id)} />
            </li>
          ))}
        </ul>
      </section>

      <div className="founder-discovery-engine__brief-grid">
        <section aria-labelledby="ede-hidden-opp">
          <h3 className="founder-discovery-engine__section-title" id="ede-hidden-opp">
            Hidden Opportunity
          </h3>
          <FindingCard
            label="Nobody searched for this"
            finding={brief.hiddenOpportunity}
            onSelect={() => onSelectFinding(brief.hiddenOpportunity.id)}
          />
        </section>

        <section aria-labelledby="ede-risk">
          <h3 className="founder-discovery-engine__section-title" id="ede-risk">
            Potential Risk
          </h3>
          <FindingCard
            label="Watch carefully"
            finding={brief.potentialRisk}
            onSelect={() => onSelectFinding(brief.potentialRisk.id)}
          />
        </section>
      </div>

      <section className="founder-discovery-engine__question" aria-labelledby="ede-question">
        <h3 className="founder-discovery-engine__section-title" id="ede-question">
          One Question Worth Exploring
        </h3>
        <p className="founder-discovery-engine__prose founder-discovery-engine__question-text">
          {brief.questionWorthExploring}
        </p>
      </section>

      <section aria-labelledby="ede-recommended">
        <h3 className="founder-discovery-engine__section-title" id="ede-recommended">
          Recommended Action
        </h3>
        <FindingCard
          label="Do this first"
          finding={brief.recommendedAction}
          onSelect={() => onSelectFinding(brief.recommendedAction.id)}
        />
      </section>

      <p className="founder-discovery-engine__muted">Everything else waits. Founder never floods — only what matters today.</p>
    </article>
  );
}
