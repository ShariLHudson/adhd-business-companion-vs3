"use client";

import type {
  StressCauseId,
  StressCauseOption,
  StressReliefOffer,
  StressReliefOption,
} from "@/lib/stressRouting";
import {
  STRESS_CAUSE_OPTIONS,
  STRESS_RELIEF_OPTIONS,
  stressCauseRecommendationLine,
} from "@/lib/stressRouting";

type Props = {
  offer: StressReliefOffer;
  onSelectOption: (id: StressReliefOption["id"]) => void;
  onSelectCause: (id: StressCauseId) => void;
  onDismiss?: () => void;
};

export function StressReliefOptionsCard({
  offer,
  onSelectOption,
  onSelectCause,
  onDismiss,
}: Props) {
  if (offer.kind === "recommendation") {
    return (
      <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white/90 p-4 shadow-sm">
        <p className="text-center text-base leading-relaxed text-[#6b635a]">
          {stressCauseRecommendationLine(offer.cause)}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => onSelectOption(offer.primary.id)}
            className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#163a3a]"
          >
            {offer.primary.emoji} {offer.primary.label}
          </button>
          {offer.secondary ? (
            <button
              type="button"
              onClick={() => onSelectOption(offer.secondary!.id)}
              className="rounded-full border border-[#1e4f4f]/30 bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:bg-white"
            >
              {offer.secondary.emoji} {offer.secondary.label}
            </button>
          ) : null}
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-full border border-[#d4cdc3] bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#6b635a] transition-colors hover:bg-white"
            >
              Keep Talking
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white/90 p-4 shadow-sm">
      <p className="text-center text-sm font-medium text-[#6b635a]">
        What might help right now?
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {STRESS_RELIEF_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectOption(opt.id)}
            className="rounded-full border border-[#1e4f4f]/25 bg-white px-3.5 py-2 text-sm font-semibold text-[#1e4f4f] transition-colors hover:border-[#1e4f4f]/45 hover:bg-[#f5f1ea]"
          >
            {opt.emoji} {opt.label}
          </button>
        ))}
      </div>
      <div className="mt-4 border-t border-[#e7dfd4] pt-4">
        <p className="text-center text-sm text-[#9a8f82]">
          What&apos;s making the stress feel strongest right now?
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {STRESS_CAUSE_OPTIONS.map((cause: StressCauseOption) => (
            <button
              key={cause.id}
              type="button"
              onClick={() => onSelectCause(cause.id)}
              className="rounded-full border border-[#d4cdc3] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#6b635a] transition-colors hover:border-[#1e4f4f]/35 hover:text-[#1e4f4f]"
            >
              {cause.label}
            </button>
          ))}
        </div>
      </div>
      {onDismiss ? (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={onDismiss}
            className="text-sm font-semibold text-[#9a8f82] hover:text-[#1e4f4f]"
          >
            Just keep talking
          </button>
        </div>
      ) : null}
    </div>
  );
}
