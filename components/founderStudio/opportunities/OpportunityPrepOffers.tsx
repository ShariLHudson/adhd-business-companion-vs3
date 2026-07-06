import type { OpportunityPrepOffer } from "@/lib/opportunities/types";

import { ExecutivePanel } from "../executive";

type OpportunityPrepOffersProps = {
  offers: OpportunityPrepOffer[];
};

export function OpportunityPrepOffers({ offers }: OpportunityPrepOffersProps) {
  return (
    <ExecutivePanel
      title="What Founder can prepare — drafts only"
      subtitle="Nothing executes until you approve"
      defaultOpen
    >
      <ul className="founder-opportunity__prep-list">
        {offers.map((offer) => (
          <li key={offer.id} className="founder-opportunity__prep-item">
            <span className="founder-opportunity__prep-label">{offer.label}</span>
            <span className="founder-opportunity__prep-desc">{offer.description}</span>
            <span className="founder-opportunity__prep-status">{offer.status}</span>
          </li>
        ))}
      </ul>
    </ExecutivePanel>
  );
}
