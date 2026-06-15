"use client";

import type { RecognitionMoment } from "@/lib/recognition/types";
import {
  dismissRecognition,
  logRecognitionSent,
} from "@/lib/recognition/recognitionStore";

type RecognitionMomentCardProps = {
  moment: RecognitionMoment;
  onDismiss: () => void;
};

/** Warm recognition card — message only in foundation phase (effects ship later). */
export function RecognitionMomentCard({
  moment,
  onDismiss,
}: RecognitionMomentCardProps) {
  function handleDismiss() {
    dismissRecognition(moment.id);
    logRecognitionSent(moment.type, moment.milestoneKey);
    onDismiss();
  }

  return (
    <div
      className="recognition-moment-card companion-fade-in mx-auto mt-4 w-full max-w-md rounded-2xl border border-[#1e4f4f]/20 bg-white/95 p-5 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
            {moment.title}
          </p>
          <p className="mt-2 text-base leading-relaxed text-[#2d2926]">
            {moment.message}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-[#6b635a] hover:bg-[#f5f0e8]"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <p className="mt-3 text-xs text-[#9a8f82]">
        No pressure to stay — just wanted you to know.
      </p>
    </div>
  );
}
