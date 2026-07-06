import type { BusinessOpportunity } from "@/lib/opportunities/types";

type OpportunityCardProps = {
  opportunity: BusinessOpportunity;
  onSelect: (id: string) => void;
  featured?: boolean;
};

const REC_LABEL: Record<BusinessOpportunity["recommendation"], string> = {
  build: "Build",
  prototype: "Prototype",
  "research-further": "Research further",
  watch: "Watch",
  ignore: "Ignore",
  delay: "Delay",
  partner: "Partner",
  automate: "Automate",
};

export function OpportunityCard({ opportunity, onSelect, featured }: OpportunityCardProps) {
  return (
    <li className={`founder-opportunity__card${featured ? " founder-opportunity__card--featured" : ""}`}>
      <button
        type="button"
        className="founder-opportunity__card-button"
        onClick={() => onSelect(opportunity.id)}
      >
        <span className="founder-opportunity__card-type">{opportunity.typeLabel}</span>
        <span className="founder-opportunity__card-name">{opportunity.name}</span>
        <p className="founder-opportunity__card-summary">{opportunity.executiveSummary}</p>
        <div className="founder-opportunity__card-meta">
          <span>Impact: {opportunity.potentialImpact}</span>
          <span>Confidence: {opportunity.confidence}</span>
          <span className={`founder-opportunity__rec founder-opportunity__rec--${opportunity.recommendation}`}>
            {REC_LABEL[opportunity.recommendation]}
          </span>
        </div>
      </button>
    </li>
  );
}
