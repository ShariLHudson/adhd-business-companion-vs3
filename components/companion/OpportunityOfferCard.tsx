"use client";

import type { OpportunityOffer } from "@/lib/opportunity-intelligence/types";
import { dismissOpportunityOffer } from "@/lib/opportunity-intelligence";

type OpportunityOfferCardProps = {
  offer: OpportunityOffer;
  onExplore: () => void;
  onDismiss: () => void;
};

/** Gentle opportunity suggestion — explore or not now, no FOMO. */
export function OpportunityOfferCard({
  offer,
  onExplore,
  onDismiss,
}: OpportunityOfferCardProps) {
  function handleDismiss() {
    dismissOpportunityOffer(offer.opportunity.id);
    onDismiss();
  }

  return (
    <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white/90 p-4 shadow-sm">
      <p className="text-center text-base leading-relaxed text-[#6b635a]">
        {offer.companionOffer}
      </p>
      <p className="mt-2 text-center text-xs text-[#9a8f82]">
        {offer.opportunity.title} — {offer.opportunity.reason}
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onExplore}
          className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#163a3a]"
        >
          Explore
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full border border-[#1e4f4f]/30 bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
