"use client";

import type { VisualThinkingHomeType } from "@/lib/visualThinkingHome";

export function VisualThinkingHomeBox({
  type,
  onOpen,
  compact = false,
}: {
  type: VisualThinkingHomeType;
  onOpen: () => void;
  compact?: boolean;
}) {
  const comingSoon = type.comingSoon === true;

  if (compact) {
    return (
      <button
        type="button"
        onClick={comingSoon ? undefined : onOpen}
        disabled={comingSoon}
        className="flex w-full items-center gap-2.5 rounded-lg border border-[#efe8de] bg-[#faf7f2]/50 px-3 py-2 text-left hover:bg-[#faf7f2] disabled:cursor-not-allowed disabled:opacity-60"
        data-testid={`visual-thinking-home-${type.id}`}
      >
        <span className="text-base" aria-hidden>
          {type.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[#1f1c19]">
            {type.title}
          </span>
          {comingSoon ? (
            <span className="text-xs text-[#9a8f82]">Coming soon</span>
          ) : null}
        </span>
        {!comingSoon ? (
          <span className="shrink-0 text-xs font-semibold text-[#1e4f4f]">Open</span>
        ) : null}
      </button>
    );
  }

  return (
    <article
      className="flex flex-col rounded-xl border border-[#e7dfd4] bg-white p-4 shadow-sm"
      data-testid={`visual-thinking-home-${type.id}`}
    >
      <div className="flex items-start gap-3">
        <span
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0f8f8] text-xl"
          aria-hidden
        >
          {type.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-[#1f1c19]">{type.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#6b635a]">
            {type.shortDescription}
          </p>
        </div>
      </div>
      {comingSoon ? (
        <p
          className="mt-4 w-full rounded-lg border border-[#e7dfd4] bg-[#faf7f2] px-4 py-2 text-center text-sm font-semibold text-[#6b635a] sm:w-auto sm:self-start"
          data-testid={`visual-thinking-coming-soon-${type.id}`}
        >
          Coming Soon
        </p>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="mt-4 w-full rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163c3c] sm:w-auto sm:self-start"
          data-testid={`visual-thinking-open-${type.id}`}
        >
          Open
        </button>
      )}
    </article>
  );
}
