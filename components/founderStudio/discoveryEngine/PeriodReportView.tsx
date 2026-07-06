"use client";

import type {
  MonthlyExecutiveDiscoveryReport,
  WeeklyDiscoveryReport,
} from "@/lib/executiveDiscoveryEngine/types";

type PeriodReportViewProps = {
  mode: "weekly" | "monthly";
  weekly?: WeeklyDiscoveryReport;
  monthly?: MonthlyExecutiveDiscoveryReport;
  onSelectFinding: (id: string) => void;
  onBack: () => void;
};

function BulletSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="founder-discovery-engine__report-section">
      <h3 className="founder-discovery-engine__section-title">{title}</h3>
      <ul className="founder-discovery-engine__bullets">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function PeriodReportView({
  mode,
  weekly,
  monthly,
  onSelectFinding,
  onBack,
}: PeriodReportViewProps) {
  const isWeekly = mode === "weekly";
  const label = isWeekly ? weekly?.weekLabel : monthly?.monthLabel;
  const title = isWeekly ? "Weekly Discovery Report" : "Monthly Executive Discovery Report";

  return (
    <article className="founder-discovery-engine__report">
      <button type="button" className="founder-discovery-engine__back" onClick={onBack}>
        ← Back
      </button>

      <header className="founder-discovery-engine__header">
        <p className="founder-discovery-engine__meta">{title}</p>
        <h2 className="founder-discovery-engine__title">{label}</h2>
      </header>

      {isWeekly && weekly ? (
        <>
          <section aria-labelledby="ede-weekly-discoveries">
            <h3 className="founder-discovery-engine__section-title" id="ede-weekly-discoveries">
              Most Important Discoveries
            </h3>
            <ul className="founder-discovery-engine__card-grid">
              {weekly.mostImportantDiscoveries.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    className="founder-discovery-engine__card"
                    onClick={() => onSelectFinding(f.id)}
                  >
                    <span className="founder-discovery-engine__card-headline">{f.headline}</span>
                    <span className="founder-discovery-engine__card-why">{f.summary}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <BulletSection title="Emerging Patterns" items={weekly.emergingPatterns} />
          <BulletSection title="Customer Changes" items={weekly.customerChanges} />
          <BulletSection title="Technology Changes" items={weekly.technologyChanges} />
          <BulletSection title="Competitive Changes" items={weekly.competitiveChanges} />
          <BulletSection title="Business Opportunities" items={weekly.businessOpportunities} />
          <BulletSection title="Recommended Priorities" items={weekly.recommendedPriorities} />
        </>
      ) : null}

      {!isWeekly && monthly ? (
        <>
          <BulletSection title="What Changed?" items={monthly.whatChanged} />
          <BulletSection title="What Surprised Us?" items={monthly.whatSurprisedUs} />
          <BulletSection title="Opportunities Emerging" items={monthly.opportunitiesEmerging} />
          <BulletSection title="Opportunities Disappeared" items={monthly.opportunitiesDisappeared} />
          <BulletSection title="What Should Spark Build Next?" items={monthly.whatSparkShouldBuildNext} />
          <BulletSection title="What Should We Stop Doing?" items={monthly.whatToStopDoing} />
          <BulletSection title="What Should We Learn?" items={monthly.whatToLearn} />
          <BulletSection title="What Should We Automate?" items={monthly.whatToAutomate} />
        </>
      ) : null}
    </article>
  );
}
