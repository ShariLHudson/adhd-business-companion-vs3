"use client";

type Props = {
  message: string;
  reviewLabel: string;
  leaveLabel: string;
  onReview: () => void;
  onLeave: () => void;
};

/**
 * Small optional previous-day notice — never an automatic task dump.
 */
export function PlanDayPreviousDayPrompt({
  message,
  reviewLabel,
  leaveLabel,
  onReview,
  onLeave,
}: Props) {
  return (
    <div
      className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/80 px-4 py-3"
      role="status"
      data-testid="plan-day-previous-day-prompt"
    >
      <p className="text-base leading-relaxed text-[#1f1c19]">{message}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onReview}
          className="rounded-xl border border-[#1e4f4f] bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
          data-testid="plan-day-previous-day-review"
        >
          {reviewLabel}
        </button>
        <button
          type="button"
          onClick={onLeave}
          className="rounded-xl border border-[#c9bfb0] bg-white px-4 py-2 text-sm font-semibold text-[#4b463f] hover:bg-[#f5f0ea]"
          data-testid="plan-day-previous-day-leave"
        >
          {leaveLabel}
        </button>
      </div>
    </div>
  );
}
