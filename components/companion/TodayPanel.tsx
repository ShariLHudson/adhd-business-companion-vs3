"use client";

/** @deprecated P0.56 — Not mounted. Superseded by TodayHubPanel. */

import { useMemo, useState } from "react";
import type { HomeResumeItem } from "@/lib/homeResumeItem";
import { findTodayResumeItem } from "@/lib/todayPanelDismiss";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

export function TodayPanel({
  onResume,
  onResumeNotNow,
  onStartFresh,
  refreshKey = 0,
}: {
  onResume: (item: HomeResumeItem) => void;
  onResumeNotNow?: (item: HomeResumeItem) => void;
  onStartFresh?: () => void;
  refreshKey?: string | number;
}) {
  const [resumeDismissed, setResumeDismissed] = useState(false);

  const activeItem = useMemo(() => {
    if (resumeDismissed) return null;
    return findTodayResumeItem();
  }, [refreshKey, resumeDismissed]);

  return (
    <section
      className={workspacePanelShellClass({ width: "standard" })}
      data-testid="today-panel"
    >
      <div>
        <h2 className="text-3xl font-bold text-[#2f261f]">Today</h2>
        <p className="text-[#6f6259]">Pick up where you left off — one step at a time.</p>
      </div>

      <div className="mt-5 rounded-3xl border border-[#e7d9c8] bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
          ⚡ Resume Your Flow
        </p>

        {!activeItem ? (
          <div className="mt-3 rounded-2xl border border-[#e7dfd4] bg-[#faf7f2] p-4">
            <p className="text-sm font-semibold text-[#1f1c19]">
              Nothing to resume right now.
            </p>
            {onStartFresh ? (
              <button
                type="button"
                onClick={onStartFresh}
                className="mt-3 rounded-xl border border-[#1e4f4f]/30 px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
              >
                Start Fresh
              </button>
            ) : null}
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-[#e7d9c8] bg-[#faf7f2] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
              {activeItem.typeLabel}
            </p>
            <p className="mt-1 text-xl font-bold text-[#2f261f]">{activeItem.title}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
              Last Action
            </p>
            <p className="mt-1 text-sm text-[#6f625a]">{activeItem.lastAction}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onResume(activeItem)}
                className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#163c3c]"
                data-testid="today-resume-jump-back"
              >
                Resume
              </button>
              {onResumeNotNow ? (
                <button
                  type="button"
                  onClick={() => {
                    onResumeNotNow(activeItem);
                    setResumeDismissed(true);
                  }}
                  className="rounded-xl border border-[#d4cdc3] px-4 py-2.5 text-sm font-semibold text-[#6b635a]"
                >
                  Not Now
                </button>
              ) : null}
              {onStartFresh ? (
                <button
                  type="button"
                  onClick={onStartFresh}
                  className="rounded-xl border border-[#1e4f4f]/30 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f]"
                >
                  Start Fresh
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
