"use client";

import type { ChiefOfStaffOffer } from "@/lib/chief-of-staff/types";
import { dismissChiefOffer } from "@/lib/chief-of-staff";

type ChiefOfStaffOfferCardProps = {
  offer: ChiefOfStaffOffer;
  onTellMe: () => void;
  onDismiss: () => void;
};

export function ChiefOfStaffOfferCard({
  offer,
  onTellMe,
  onDismiss,
}: ChiefOfStaffOfferCardProps) {
  function handleDismiss() {
    dismissChiefOffer();
    onDismiss();
  }

  return (
    <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white/90 p-4 shadow-sm">
      <p className="text-center text-base font-medium text-[#1e4f4f]">
        {offer.introLine}
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onTellMe}
          className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#163a3a]"
        >
          Tell me
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
