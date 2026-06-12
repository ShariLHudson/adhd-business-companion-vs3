"use client";

import type { usePomodoroTimer } from "@/lib/usePomodoroTimer";

type Timer = ReturnType<typeof usePomodoroTimer>;

// Persistent bar shown across the whole app while a focus session is running,
// so the countdown and controls follow the user everywhere.
export function FocusActiveBar({
  timer,
  onReturn,
}: {
  timer: Timer;
  onReturn?: () => void;
}) {
  if (!timer.isActive) return null;

  const time = `${String(timer.displayMins).padStart(2, "0")}:${String(
    timer.displaySecs,
  ).padStart(2, "0")}`;

  const ctrl =
    "rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-white/25";

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1.5 bg-[#1e4f4f] px-4 py-2 text-white">
      {/* What you're working on — the task name if we have it, else generic. */}
      <span className="flex min-w-0 items-center gap-1.5">
        <span aria-hidden="true">🎯</span>
        <span className="truncate text-sm font-semibold">
          {timer.label ?? "Focus active"}
        </span>
      </span>
      <span className="font-mono text-base font-semibold tabular-nums">
        {time} left
      </span>
      {onReturn && (
        <button type="button" onClick={onReturn} className={ctrl}>
          Return
        </button>
      )}
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
