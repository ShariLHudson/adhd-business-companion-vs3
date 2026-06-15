"use client";

import type { BusinessOSSortOffer } from "@/lib/business-os/types";
import { dismissBusinessOSSortOffer } from "@/lib/business-os";

type BusinessOSSortCardProps = {
  offer: BusinessOSSortOffer;
  onSort: () => void;
  onDismiss: () => void;
};

export function BusinessOSSortCard({
  offer,
  onSort,
  onDismiss,
}: BusinessOSSortCardProps) {
  function handleDismiss() {
    dismissBusinessOSSortOffer();
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
          onClick={onSort}
          className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#163a3a]"
        >
          Help me sort
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
