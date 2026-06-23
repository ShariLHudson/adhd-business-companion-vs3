"use client";

import type { BusinessConfidenceOffer } from "@/lib/businessIntelligenceConfidenceOffer";

type Props = {
  offer: BusinessConfidenceOffer;
  onUpdateProfile: () => void;
  onContinueAnyway: () => void;
};

export function BusinessConfidenceOfferCard({
  offer,
  onUpdateProfile,
  onContinueAnyway,
}: Props) {
  return (
    <div
      className="rounded-2xl border border-[#1e4f4f]/15 bg-white/90 p-4 shadow-sm"
      data-testid="business-confidence-offer"
    >
      <p className="text-center text-base leading-relaxed text-[#2d2926]">
        {offer.message}
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onUpdateProfile}
          className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#163a3a]"
        >
          {offer.updateLabel}
        </button>
        <button
          type="button"
          onClick={onContinueAnyway}
          className="rounded-full border border-[#1e4f4f]/30 bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:bg-white"
        >
          Continue Anyway
        </button>
      </div>
    </div>
  );
}
