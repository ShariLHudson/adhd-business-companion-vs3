import type { ResearchPrepOffer } from "@/lib/research/types";

import { ExecutivePanel } from "../executive";

type ResearchPrepOffersProps = {
  offers: ResearchPrepOffer[];
};

export function ResearchPrepOffers({ offers }: ResearchPrepOffersProps) {
  return (
    <ExecutivePanel
      title="Prepared for you — drafts only"
      subtitle="Nothing executes until you approve"
      defaultOpen
    >
      <ul className="founder-research__prep-list">
        {offers.map((offer) => (
          <li key={offer.id} className="founder-research__prep-item">
            <span className="founder-research__prep-label">{offer.label}</span>
            <span className="founder-research__prep-desc">{offer.description}</span>
            <span className="founder-research__prep-status">{offer.status}</span>
          </li>
        ))}
      </ul>
    </ExecutivePanel>
  );
}
