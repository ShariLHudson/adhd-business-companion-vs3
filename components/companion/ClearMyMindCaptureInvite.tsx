"use client";

import {
  CLEAR_MY_MIND_CONTINUE_PROMPT,
  clearMyMindHeldCountLine,
} from "@/lib/clearMyMindCopy";
import { MY_THOUGHTS_OPEN } from "@/lib/thinkingSpace/copy";
import { recordReliefSignal } from "@/lib/reliefIntelligence";

type Props = {
  totalThoughtCount: number;
  sessionShareCount: number;
  sessionId?: string;
  onOpenMyThoughts: () => void;
};

/**
 * Quiet invitation — never interrupts capture.
 * Clear My Mind™ captures; My Thoughts™ organizes.
 */
export function ClearMyMindCaptureInvite({
  totalThoughtCount,
  sessionShareCount,
  sessionId,
  onOpenMyThoughts,
}: Props) {
  if (totalThoughtCount === 0 && sessionShareCount === 0) {
    return null;
  }

  const count = Math.max(totalThoughtCount, sessionShareCount);

  return (
    <div
      className="companion-fade-in mt-2 rounded-2xl border border-[#e7dfd4]/80 bg-[#faf7f2]/60 px-4 py-4"
      data-testid="clear-my-mind-capture-invite"
    >
      {count > 0 ? (
        <p className="text-sm leading-relaxed text-[#5a5248]">
          {clearMyMindHeldCountLine(count)}
        </p>
      ) : null}
      {sessionShareCount > 0 ? (
        <p className="mt-2 text-sm font-medium text-[#6b635a]">
          {CLEAR_MY_MIND_CONTINUE_PROMPT}
        </p>
      ) : null}
      {totalThoughtCount > 0 ? (
        <button
          type="button"
          onClick={() => {
            if (sessionId) {
              recordReliefSignal({
                kind: "opened-my-thoughts",
                sessionId,
              });
            }
            onOpenMyThoughts();
          }}
          className="mt-3 rounded-xl border border-[#c5ddd8] bg-[#f0f8f8] px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:bg-[#e6f4f4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35"
          data-testid="open-my-thoughts"
        >
          {MY_THOUGHTS_OPEN}
        </button>
      ) : null}
    </div>
  );
}
