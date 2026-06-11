"use client";

import type { usePomodoroTimer } from "@/lib/usePomodoroTimer";

type Timer = ReturnType<typeof usePomodoroTimer>;

// Persistent bar shown across the whole app while a focus session is running,
// so the countdown and controls follow the user everywhere.
export function FocusActiveBar({ timer }: { timer: Timer }) {
  if (!timer.isActive) return null;

  const time = `${String(timer.displayMins).padStart(2, "0")}:${String(
    timer.displaySecs,
  ).padStart(2, "0")}`;

  const ctrl =
    "rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-white/25";

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-3 bg-[#1e4f4f] px-4 py-2 text-white">
      <span className="text-xs font-bold uppercase tracking-[0.15em]">
        Focus Active
      </span>
      <span className="font-mono text-base font-semibold tabular-nums">
        {time} remaining
      </span>
      {timer.running ? (
        <button type="button" onClick={timer.pause} className={ctrl}>
          Pause
        </button>
      ) : (
        <button type="button" onClick={timer.start} className={ctrl}>
          Resume
        </button>
      )}
      <button type="button" onClick={timer.reset} className={ctrl}>
        End
      </button>
    </div>
  );
}
