"use client";

import { useMemo, useState } from "react";
import type { AppSection, SidebarNavId } from "@/lib/companionUi";
import type { HomeResumeItem } from "@/lib/homeResumeItem";
import {
  dismissHomeResumeForSession,
  findLatestHomeResumeItem,
  isHomeResumeDismissedForSession,
} from "@/lib/homeResumeItem";
import {
  activeAvatarSummary,
  buildHomeSuggestedStep,
  buildTodayMomentum,
  type HomeSuggestedStep,
  type StartupOpenTarget,
} from "@/lib/startupFriction";

type HomeContinuityStackProps = {
  onResume: (item: HomeResumeItem) => void;
  onOpenTarget: (target: StartupOpenTarget) => void;
  onOpenAvatars: () => void;
  refreshKey?: string | number;
};

export function HomeContinuityStack({
  onResume,
  onOpenTarget,
  onOpenAvatars,
  refreshKey = 0,
}: HomeContinuityStackProps) {
  const resumeItem = useMemo(
    () => findLatestHomeResumeItem(),
    [refreshKey],
  );
  const suggested = useMemo(() => buildHomeSuggestedStep(), [refreshKey]);
  const momentum = useMemo(() => buildTodayMomentum(), [refreshKey]);
  const avatar = useMemo(() => activeAvatarSummary(), [refreshKey]);

  const [dismissedResumeId, setDismissedResumeId] = useState<string | null>(
    () =>
      resumeItem && isHomeResumeDismissedForSession(resumeItem.id)
        ? resumeItem.id
        : null,
  );

  const showResume =
    resumeItem && dismissedResumeId !== resumeItem.id;

  function handleSuggested(step: HomeSuggestedStep) {
    onOpenTarget(step.openTarget);
  }

  return (
    <div
      className="mb-3 flex flex-col gap-2.5"
      data-testid="home-continuity-stack"
    >
      {showResume ? (
        <div
          className="rounded-2xl border border-[#c5e0e0] bg-gradient-to-br from-[#f0f8f8] to-[#faf7f2] px-4 py-3.5"
          role="region"
          aria-label="Continue what you started"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
            Continue what you started
          </p>
          <p className="mt-1 text-base font-semibold text-[#1f1c19]">
            {resumeItem.title}
          </p>
          <p className="mt-0.5 text-sm text-[#6b635a]">
            Next: {resumeItem.nextStep}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onResume(resumeItem)}
              className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white"
            >
              Continue →
            </button>
            <button
              type="button"
              onClick={() => {
                dismissHomeResumeForSession(resumeItem.id);
                setDismissedResumeId(resumeItem.id);
              }}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-[#6b635a]"
            >
              Not now
            </button>
          </div>
        </div>
      ) : null}

      {suggested ? (
        <div
          className="rounded-2xl border border-[#e7dfd4] bg-white/90 px-4 py-3"
          data-testid="home-suggested-step"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            Suggested
          </p>
          <p className="mt-1 text-sm text-[#1f1c19]">{suggested.reason}</p>
          <button
            type="button"
            onClick={() => handleSuggested(suggested)}
            className="mt-2 rounded-lg border border-[#1e4f4f]/35 bg-[#f0f8f8] px-3 py-1.5 text-sm font-semibold text-[#1e4f4f]"
          >
            {suggested.action}
          </button>
        </div>
      ) : null}

      {momentum.length > 0 ? (
        <div
          className="rounded-2xl border border-[#e7dfd4] bg-white/80 px-4 py-3"
          data-testid="home-momentum-widget"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            Today&apos;s momentum
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {momentum.map((stat) => (
              <li
                key={stat.id}
                className="rounded-xl bg-[#faf7f2] px-2.5 py-1.5 text-xs font-semibold text-[#1f1c19]"
              >
                <span aria-hidden="true">{stat.icon} </span>
                {stat.count} {stat.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {avatar ? (
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e7dfd4] bg-white/70 px-3 py-2"
          data-testid="home-avatar-bar"
        >
          <p className="text-sm text-[#1f1c19]">
            <span className="text-[#6b635a]">Using avatar:</span>{" "}
            <span className="font-semibold">{avatar.name}</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onOpenAvatars}
              className="text-xs font-semibold text-[#1e4f4f]"
            >
              View
            </button>
            <button
              type="button"
              onClick={onOpenAvatars}
              className="text-xs font-semibold text-[#6b635a]"
            >
              Change
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
