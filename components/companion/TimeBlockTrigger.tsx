"use client";

import type { TimeBlock } from "@/lib/companionStore";

// In-app popup shown when a time block's start time arrives (while the app is
// open). Offers the moment-of-start choices.
export function TimeBlockTrigger({
  block,
  onStartNow,
  onSnooze,
  onReschedule,
  onNotReady,
}: {
  block: TimeBlock;
  onStartNow: () => void;
  onSnooze: () => void;
  onReschedule: () => void;
  onNotReady: () => void;
}) {
  const ghost =
    "rounded-xl border-2 border-[#1e4f4f] bg-white px-4 py-2.5 text-base font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="companion-fade-in w-full max-w-md rounded-2xl bg-[#faf6f0] p-6 shadow-2xl">
        <p className="text-sm font-semibold text-[#1e4f4f]">
          🔔 It&apos;s time for
        </p>
        <p className="mt-1 text-2xl font-semibold text-[#1f1c19]">
          {block.title}
        </p>
        <p className="mt-1 text-base text-[#6b635a]">
          You planned {block.durationMin} minutes for this.
        </p>

        <p className="mt-5 text-base font-medium text-[#1f1c19]">
          How do you want to start?
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={onStartNow}
            className="rounded-xl bg-[#1e4f4f] px-4 py-3 text-base font-semibold text-white hover:bg-[#163a3a]"
          >
            ▶ Start now
          </button>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onSnooze} className={ghost}>
              ⏰ Snooze 10 min
            </button>
            <button type="button" onClick={onReschedule} className={ghost}>
              🔁 Reschedule
            </button>
          </div>
          <button
            type="button"
            onClick={onNotReady}
            className="mt-1 rounded-xl px-4 py-2.5 text-base font-medium text-[#6b635a] hover:bg-black/5"
          >
            🌿 I&apos;m not ready
          </button>
        </div>
      </div>
    </div>
  );
}
