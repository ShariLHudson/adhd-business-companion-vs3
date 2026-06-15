"use client";

import type { DecisionOffer } from "@/lib/decision-intelligence/types";
import { dismissDecisionOffer } from "@/lib/decision-intelligence";

type DecisionOfferCardProps = {
  offer: DecisionOffer;
  onNarrow: () => void;
  onPark: () => void;
  onDismiss: () => void;
};

/** Gentle decision support — narrow, park, or not now. */
export function DecisionOfferCard({
  offer,
  onNarrow,
  onPark,
  onDismiss,
}: DecisionOfferCardProps) {
  function handleDismiss() {
    dismissDecisionOffer();
    onDismiss();
  }

  return (
    <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white/90 p-4 shadow-sm">
      <p className="text-center text-base leading-relaxed text-[#6b635a]">
        {offer.companionOffer}
      </p>
      <p className="mt-2 text-center text-xs text-[#9a8f82]">{offer.insight}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onNarrow}
          className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#163a3a]"
        >
          Help me narrow
        </button>
        <button
          type="button"
          onClick={onPark}
          className="rounded-full border border-[#1e4f4f]/30 bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white"
        >
          Park it
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full border border-[#d4cdc3] bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#6b635a] hover:bg-white"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
