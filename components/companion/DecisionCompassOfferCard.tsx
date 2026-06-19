"use client";

import type { DecisionCompassOffer } from "@/lib/decisionCompassRouting";

type Props = {
  offer: DecisionCompassOffer;
  onOpenCompass: () => void;
  onTalkThrough: () => void;
  onDismiss: () => void;
};

export function DecisionCompassOfferCard({
  offer,
  onOpenCompass,
  onTalkThrough,
  onDismiss,
}: Props) {
  return (
    <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white/90 p-4 shadow-sm">
      <p className="text-center text-base leading-relaxed text-[#6b635a]">
        {offer.companionLine}
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onOpenCompass}
          className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#163a3a]"
        >
          Open Decision Compass
        </button>
        <button
          type="button"
          onClick={onTalkThrough}
          className="rounded-full border border-[#1e4f4f]/30 bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:bg-white"
        >
          Talk it through here
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full border border-[#d4cdc3] bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#6b635a] transition-colors hover:bg-white"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
