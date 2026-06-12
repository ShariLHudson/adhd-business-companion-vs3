"use client";

import type { WorkOnRecommendation } from "@/lib/founderWorkspace/briefing";

type FounderWorkOnModalProps = {
  open: boolean;
  recommendation: WorkOnRecommendation | null;
  loading?: boolean;
  onClose: () => void;
  onGo: () => void;
};

export function FounderWorkOnModal({
  open,
  recommendation,
  loading,
  onClose,
  onGo,
}: FounderWorkOnModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="What should I work on"
        className="w-full max-w-md rounded-2xl border border-[#d4cdc3] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-[#1f1c19]">
          What should I work on?
        </h2>
        <p className="mt-1 text-xs text-[#6b635a]">
          Shari reviewed your projects, issues, experiments, and retests.
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-[#6b635a]">Thinking…</p>
        ) : recommendation ? (
          <div className="mt-4 rounded-xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/6 p-4">
            <p className="text-xs font-semibold uppercase text-[#1e4f4f]">
              Your next step
            </p>
            <p className="mt-2 text-base font-semibold text-[#1f1c19]">
              {recommendation.action}
            </p>
            <p className="mt-2 text-sm text-[#6b635a]">{recommendation.reason}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#6b635a]">
            Add a project or issue to get a recommendation.
          </p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#d4cdc3] px-4 py-2 text-sm"
          >
            Close
          </button>
          {recommendation?.navigateTo ? (
            <button
              type="button"
              onClick={onGo}
              className="rounded-lg bg-[#e0795a] px-4 py-2 text-sm font-semibold text-white"
            >
              Go there
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
