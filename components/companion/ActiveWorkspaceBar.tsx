"use client";

import type { usePomodoroTimer } from "@/lib/usePomodoroTimer";
import { CompanionObjectVisual } from "@/components/companion/CompanionObjectVisual";

type Timer = ReturnType<typeof usePomodoroTimer>;

export type ActiveWorkspaceItem = {
  id: string;
  objectId: string;
  label: string;
  detail?: string;
  running?: boolean;
  onOpen: () => void;
  onClose?: () => void;
  onPause?: () => void;
  onResume?: () => void;
};

const ctrl =
  "rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-white/25";

export function ActiveWorkspaceBar({ items }: { items: ActiveWorkspaceItem[] }) {
  if (!items.length) return null;

  return (
    <div
      className="sticky top-0 z-30 flex shrink-0 flex-col gap-1 border-b border-[#163a3a] bg-[#1e4f4f] px-4 py-2 text-white shadow-sm"
      role="region"
      aria-label="Active workspaces"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
        Active
      </p>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5"
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <CompanionObjectVisual
                objectId={item.objectId}
                size="xs"
                variant="icon"
                className="shrink-0"
              />
              <span className="truncate text-sm font-semibold">{item.label}</span>
              {item.detail ? (
                <span className="truncate text-sm text-white/80">
                  {item.detail}
                </span>
              ) : null}
            </span>
            <button type="button" onClick={item.onOpen} className={ctrl}>
              Open
            </button>
            {item.onPause && item.running ? (
              <button type="button" onClick={item.onPause} className={ctrl}>
                Pause
              </button>
            ) : null}
            {item.onResume && !item.running ? (
              <button type="button" onClick={item.onResume} className={ctrl}>
                Resume
              </button>
            ) : null}
            {item.onClose ? (
              <button type="button" onClick={item.onClose} className={ctrl}>
                Close
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Build focus timer row for the active bar. */
export function focusTimerWorkspaceItem(
  timer: Timer,
  onOpen: () => void,
): ActiveWorkspaceItem | null {
  if (!timer.isActive) return null;
  const time = `${String(timer.displayMins).padStart(2, "0")}:${String(
    timer.displaySecs,
  ).padStart(2, "0")}`;
  const focusTitle = timer.sessionMeta?.focusItem ?? timer.label;
  return {
    id: "focus-timer",
    objectId: "focus-my-brain",
    label: `Focus Session — ${time} left`,
    detail: focusTitle?.trim() ? focusTitle.trim().slice(0, 48) : undefined,
    running: timer.running,
    onOpen,
    onPause: timer.pause,
    onResume: timer.start,
    onClose: timer.reset,
  };
}
