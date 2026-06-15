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

  if (!items.length) return null;

  return (
    <div className="mx-auto w-full max-w-xl text-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-sm font-semibold text-[#1e4f4f] hover:text-[#163a3a]"
      >
        📌 Continue Previous Work {open ? "▲" : "▼"}
      </button>
      {open ? (
        <ul className="companion-fade-in mt-2 flex flex-col gap-1.5">
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
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
