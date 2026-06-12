"use client";

type PendingActionBarProps = {
  emoji: string;
  label: string;
  line?: string;
  onOpen: () => void;
  onDismiss: () => void;
};

export function PendingActionBar({
  emoji,
  label,
  line,
  onOpen,
  onDismiss,
}: PendingActionBarProps) {
  return (
    <div
      className="mb-2 rounded-xl border border-[#1e4f4f]/25 bg-[#1e4f4f]/[0.06] px-3 py-2.5 shadow-sm"
      role="region"
      aria-label="Pending action"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1e4f4f]/70">
        Pending
      </p>
      {line ? (
        <p className="mt-0.5 text-sm leading-snug text-[#6b635a]">{line}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm font-semibold text-[#2d2926]">
          {emoji} {label}
        </span>
        <button
          type="button"
          onClick={onOpen}
          className="rounded-full bg-[#1e4f4f] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
        >
          Open
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full border border-[#1e4f4f]/30 bg-white/80 px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
