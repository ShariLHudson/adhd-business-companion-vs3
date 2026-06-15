"use client";

import type { PredictiveSupportOffer } from "@/lib/predictive-support/types";
import { dismissPredictiveOffer } from "@/lib/predictive-support";

type PredictiveSupportOfferCardProps = {
  offer: PredictiveSupportOffer;
  onAccept: () => void;
  onDismiss: () => void;
};

export function PredictiveSupportOfferCard({
  offer,
  onAccept,
  onDismiss,
}: PredictiveSupportOfferCardProps) {
  function handleDismiss() {
    dismissPredictiveOffer();
    onDismiss();
  }

  return (
    <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white/90 p-4 shadow-sm">
      <p className="text-center text-base leading-relaxed text-[#6b635a]">
        {offer.companionOffer}
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#163a3a]"
        >
          Tell me gently
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
