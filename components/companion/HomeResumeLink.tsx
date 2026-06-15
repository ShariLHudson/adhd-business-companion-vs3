"use client";

import { useMemo, useState } from "react";
import type { RecentWorkItem } from "@/lib/companionStore";
import {
  collectHomeRecentWork,
  sortHomeRecentWorkForDisplay,
} from "@/lib/homeRecentWork";

const KIND_EMOJI: Record<RecentWorkItem["kind"], string> = {
  draft: "📝",
  project: "📋",
  chat: "💬",
};

export function HomeResumeLink({
  onResume,
  refreshKey = 0,
}: {
  onResume: (item: RecentWorkItem) => void;
  /** Bump when section or last activity changes so the list stays fresh. */
  refreshKey?: string | number;
}) {
  const [open, setOpen] = useState(false);
  const items = useMemo(
    () => sortHomeRecentWorkForDisplay(collectHomeRecentWork()),
    [refreshKey],
  );

  if (!open) {
    return (
      <div className="mx-auto w-full max-w-md px-4 pb-1 text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm font-semibold text-[#1e4f4f] underline decoration-[#1e4f4f]/30 underline-offset-4 hover:decoration-[#1e4f4f]"
        >
          📌 Resume something we were working on
        </button>
      </div>
    );
  }

  return (
    <div className="companion-fade-in mx-auto w-full max-w-md px-4 pb-2 text-center">
      <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
        Pick one to resume
      </p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => {
                onResume(item);
                setOpen(false);
              }}
              className="w-full rounded-xl border border-[#d4cdc3] bg-white/90 px-3 py-2.5 text-left text-sm font-medium text-[#1f1c19] transition-colors hover:border-[#1e4f4f]/40 hover:bg-white"
            >
              <span aria-hidden="true" className="mr-1.5">
                {KIND_EMOJI[item.kind]}
              </span>
              {item.title}
              {item.subtitle && item.kind !== "project" ? (
                <span className="mt-0.5 block text-xs font-normal text-[#9a8f82]">
                  {item.subtitle}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-2 text-xs font-semibold text-[#9a8f82] hover:text-[#6b635a]"
      >
        Hide
      </button>
    </div>
  );
}
