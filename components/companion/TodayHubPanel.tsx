"use client";

import { useMemo, useState } from "react";
import type { HomeResumeItem } from "@/lib/homeResumeItem";
import { findTodayResumeItem } from "@/lib/todayPanelDismiss";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

export function TodayHubPanel({
  onResume,
  onResumeNotNow,
  onStartFresh,
  onOpenPlanMyDay,
  onOpenAdaptMyDay,
  refreshKey = 0,
}: {
  onResume: (item: HomeResumeItem) => void;
  onResumeNotNow?: (item: HomeResumeItem) => void;
  onStartFresh?: () => void;
  onOpenPlanMyDay: () => void;
  onOpenAdaptMyDay: () => void;
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
      <WorkspaceAreaWorksGuide areaId="today" />

      <div className="mt-4">
        <h2 className="text-3xl font-bold text-[#2f261f]">Today™</h2>
        <p className="text-[#6f6259]">What needs attention today?</p>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          onClick={onOpenPlanMyDay}
          className="flex w-full items-center gap-3 rounded-2xl border border-[#1e4f4f]/25 bg-gradient-to-br from-[#f0f8f8] to-white px-4 py-4 text-left hover:border-[#1e4f4f]/45"
          data-testid="today-open-plan-my-day"
        >
          <span className="text-2xl" aria-hidden="true">
            📋
          </span>
          <span>
            <span className="block font-semibold text-[#1f1c19]">Plan My Day</span>
            <span className="block text-sm text-[#6b635a]">
              Choose what fits today — tasks, energy, and time.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenAdaptMyDay}
          className="flex w-full items-center gap-3 rounded-2xl border border-[#e7dfd4] bg-white px-4 py-4 text-left hover:bg-[#faf7f2]"
          data-testid="today-open-adapt-my-day"
        >
          <span className="text-2xl" aria-hidden="true">
            🔄
          </span>
          <span>
            <span className="block font-semibold text-[#1f1c19]">Adapt My Day</span>
            <span className="block text-sm text-[#6b635a]">
              Reality changed — adjust the plan without starting over.
            </span>
          </span>
        </button>

        <div className="rounded-2xl border border-dashed border-[#d4cdc3] bg-[#faf7f2]/60 px-4 py-3">
          <p className="text-sm font-semibold text-[#9a8f82]">Daily Review</p>
          <p className="mt-0.5 text-xs text-[#9a8f82]">Coming soon — end-of-day reflection.</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-[#e7d9c8] bg-white p-5">
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
            <p className="mt-1 text-sm text-[#6f635a]">{activeItem.lastAction}</p>
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
