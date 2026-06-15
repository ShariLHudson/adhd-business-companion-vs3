"use client";

import type { RelationshipOffer } from "@/lib/relationship-intelligence/types";
import { dismissRelationshipOffer } from "@/lib/relationship-intelligence";

type RelationshipRememberCardProps = {
  offer: RelationshipOffer;
  onAccept: () => void;
  onDismiss: () => void;
};

/** Gentle offer to remember someone — user controls all reminders. */
export function RelationshipRememberCard({
  offer,
  onAccept,
  onDismiss,
}: RelationshipRememberCardProps) {
  function handleDismiss() {
    dismissRelationshipOffer(offer.signal.extractedName ?? undefined, new Date());
    onDismiss();
  }

  return (
    <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white/90 p-4 shadow-sm">
      <p className="text-center text-base leading-relaxed text-[#6b635a]">
        {offer.companionOffer}
      </p>
      {offer.suggestedTouchpoints[0] ? (
        <p className="mt-2 text-center text-xs text-[#9a8f82]">
          Later, if you want: {offer.suggestedTouchpoints[0].label} —{" "}
          {offer.suggestedTouchpoints[0].gentlePrompt}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#163a3a]"
        >
          Yes
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
