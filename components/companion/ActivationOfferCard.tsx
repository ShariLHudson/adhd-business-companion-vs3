"use client";

import type { ActivationSnapshot } from "@/lib/activation/types";
import { dismissActivationOffer } from "@/lib/activation/activationStore";

type ActivationOfferCardProps = {
  snapshot: ActivationSnapshot;
  onAccept: () => void;
  onDismiss: () => void;
};

/** Gentle activation offer — one small step, user stays in control. */
export function ActivationOfferCard({
  snapshot,
  onAccept,
  onDismiss,
}: ActivationOfferCardProps) {
  function handleDismiss() {
    dismissActivationOffer();
    onDismiss();
  }

  return (
    <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white/90 p-4 shadow-sm">
      <p className="text-center text-base leading-relaxed text-[#6b635a]">
        {snapshot.companionOffer}
      </p>
      {snapshot.likelyBlockers[0] ? (
        <p className="mt-2 text-center text-xs text-[#9a8f82]">
          Likely blocker: {snapshot.likelyBlockers[0].label} —{" "}
          {snapshot.likelyBlockers[0].reason}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#163a3a]"
        >
          ✨ {snapshot.suggestedNextStep.slice(0, 48)}
          {snapshot.suggestedNextStep.length > 48 ? "…" : ""}
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
