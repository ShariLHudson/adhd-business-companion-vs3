"use client";

import {
  THOUGHT_ACTION_SEPARATE,
  THOUGHT_SEPARATE_INTRO,
  THOUGHT_SEPARATE_PREVIEW,
} from "@/lib/thinkingSpace/copy";

const btnPrimary =
  "rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163c3c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35";

const btnSecondary =
  "rounded-xl border-2 border-[#d4cdc3] bg-white px-4 py-2.5 text-sm font-semibold text-[#3d3630] hover:bg-[#faf7f2]";

type Props = {
  segments: string[];
  onConfirm: () => void;
  onDecline?: () => void;
  declineLabel?: string;
  testId?: string;
};

/**
 * Shari gently offers to separate tangled thoughts — preview first, conversational tone.
 */
export function ThoughtSeparateOffer({
  segments,
  onConfirm,
  onDecline,
  declineLabel,
  testId = "thought-separate-offer",
}: Props) {
  return (
    <div
      className="rounded-2xl border border-[#c5ddd8] bg-[#f0f8f8] px-4 py-4"
      data-testid={testId}
    >
      <p className="text-sm leading-relaxed text-[#5a5248]">
        {THOUGHT_SEPARATE_INTRO}
      </p>
      <p className="mt-3 text-sm font-medium text-[#6b635a]">
        {THOUGHT_SEPARATE_PREVIEW}
      </p>
      <ul className="mt-2 space-y-1.5 text-sm text-[#1f1c19]">
        {segments.map((segment, index) => (
          <li key={`${index}-${segment}`} className="flex gap-2">
            <span className="text-[#9a8f82]" aria-hidden>
              •
            </span>
            <span>{segment}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onConfirm} className={btnPrimary}>
          {THOUGHT_ACTION_SEPARATE}
        </button>
        {onDecline && declineLabel ? (
          <button type="button" onClick={onDecline} className={btnSecondary}>
            {declineLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
