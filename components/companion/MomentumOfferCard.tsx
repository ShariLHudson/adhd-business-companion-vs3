"use client";

import type { MomentumOffer } from "@/lib/momentum-intelligence/types";
import { dismissMomentumOffer } from "@/lib/momentum-intelligence";

type MomentumOfferCardProps = {
  offer: MomentumOffer;
  onAcknowledge: () => void;
  onDismiss: () => void;
};

export function MomentumOfferCard({
  offer,
  onAcknowledge,
  onDismiss,
}: MomentumOfferCardProps) {
  function handleDismiss() {
    dismissMomentumOffer();
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
          onClick={onAcknowledge}
          className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#163a3a]"
        >
          That helps
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
