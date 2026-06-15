"use client";

import type { LoopSnapshot } from "@/lib/loop-intelligence/types";
import { dismissLoopOffer } from "@/lib/loop-intelligence/loopEngine";

type LoopOfferCardProps = {
  snapshot: LoopSnapshot;
  onAccept: () => void;
  onDismiss: () => void;
};

/** Gentle loop awareness — never labels or diagnoses. */
export function LoopOfferCard({
  snapshot,
  onAccept,
  onDismiss,
}: LoopOfferCardProps) {
  function handleDismiss() {
    dismissLoopOffer(snapshot.loopType);
    onDismiss();
  }

  return (
    <div className="rounded-2xl border border-[#9a8f82]/20 bg-white/90 p-4 shadow-sm">
      <p className="text-center text-base leading-relaxed text-[#6b635a]">
        {snapshot.companionResponse}
      </p>
      <p className="mt-2 text-center text-xs text-[#9a8f82]">
        {snapshot.possiblePurpose}
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#163a3a]"
        >
          Yes, explore this
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
