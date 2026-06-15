"use client";

type RecoveryOfferCardProps = {
  line: string;
  onAccept: () => void;
  onDismiss: () => void;
};

/** Gentle recovery offer — before productivity framing. */
export function RecoveryOfferCard({
  line,
  onAccept,
  onDismiss,
}: RecoveryOfferCardProps) {
  return (
    <div className="rounded-2xl border border-[#7a9e9e]/25 bg-[#f8fbfa] p-4 shadow-sm">
      <p className="text-center text-base leading-relaxed text-[#6b635a]">{line}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#163a3a]"
        >
          Yes — lighter day sounds good
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full border border-[#1e4f4f]/30 bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
