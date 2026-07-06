import type { OpportunityDiscoveryOverview } from "@/lib/opportunities/types";

import { OpportunityCard } from "./OpportunityCard";

type OpportunityOverviewProps = {
  overview: OpportunityDiscoveryOverview;
  onSelect: (id: string) => void;
};

function OpportunitySection({
  title,
  subtitle,
  items,
  onSelect,
  featuredFirst,
}: {
  title: string;
  subtitle?: string;
  items: OpportunityDiscoveryOverview["emerging"];
  onSelect: (id: string) => void;
  featuredFirst?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <section className="founder-opportunity__section" aria-labelledby={`opp-${title.replace(/\s/g, "-")}`}>
      <h2 className="founder-opportunity__section-title" id={`opp-${title.replace(/\s/g, "-")}`}>
        {title}
      </h2>
      {subtitle ? <p className="founder-opportunity__muted">{subtitle}</p> : null}
      <ul className="founder-opportunity__card-list">
        {items.map((opp, i) => (
          <OpportunityCard
            key={opp.id}
            opportunity={opp}
            onSelect={onSelect}
            featured={featuredFirst && i === 0}
          />
        ))}
      </ul>
    </section>
  );
}

export function OpportunityOverview({ overview, onSelect }: OpportunityOverviewProps) {
  return (
    <div className="founder-opportunity__overview">
      <section className="founder-opportunity__hero" aria-labelledby="opp-todays-biggest">
        <h2 className="founder-opportunity__section-title" id="opp-todays-biggest">
          Today&apos;s biggest opportunity
        </h2>
        <ul className="founder-opportunity__card-list">
          <OpportunityCard
            opportunity={overview.todaysBiggest}
            onSelect={onSelect}
            featured
          />
        </ul>
      </section>

      <OpportunitySection
        title="Top emerging opportunities"
        subtitle="Evidence-backed — max three"
        items={overview.emerging}
        onSelect={onSelect}
      />
      <OpportunitySection title="Quick wins" items={overview.quickWins} onSelect={onSelect} />
      <OpportunitySection title="Long-term opportunities" items={overview.longTerm} onSelect={onSelect} />
      <OpportunitySection
        title="Competitive threats"
        subtitle="Watch carefully — respond with positioning, not panic"
        items={overview.competitiveThreats}
        onSelect={onSelect}
      />
      <OpportunitySection title="Ideas worth watching" items={overview.watching} onSelect={onSelect} />
    </div>
  );
}
