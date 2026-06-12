"use client";

import type { FounderAction } from "@/lib/ecosystem/actions/actionTypes";

type FounderActionBarProps = {
  action: FounderAction;
  onOpen: () => void;
  onDone: () => void;
  onLater: () => void;
  onDismiss: () => void;
};

export function FounderActionBar({
  action,
  onOpen,
  onDone,
  onLater,
  onDismiss,
}: FounderActionBarProps) {
  return (
    <div
      className="mb-2 rounded-xl border border-[#c08a3e]/35 bg-[#c08a3e]/[0.08] px-3 py-2.5 shadow-sm"
      role="region"
      aria-label="Recommended action"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#9a6a1e]/80">
        Recommended next
      </p>
      <p className="mt-0.5 text-sm font-semibold leading-snug text-[#2d2926]">
        {action.emoji ?? "📋"} {action.title}
      </p>
      {action.nextStep ? (
        <p className="mt-0.5 text-xs leading-snug text-[#6b635a]">
          {action.nextStep}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={onOpen}
          className="rounded-full bg-[#1e4f4f] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#163a3a]"
        >
          Open
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full bg-[#1e4f4f]/15 px-3 py-1.5 text-xs font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/25"
        >
          Done
        </button>
        <button
          type="button"
          onClick={onLater}
          className="rounded-full border border-[#1e4f4f]/20 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#6b635a] hover:bg-white"
        >
          Later
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-[#9a8f82] hover:bg-[#1e4f4f]/10"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
