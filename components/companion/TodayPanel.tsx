"use client";

import { useMemo, useState } from "react";
import type { HomeResumeItem } from "@/lib/homeResumeItem";
import { formatLastWorkedOn } from "@/lib/formatLastWorkedOn";
import {
  findTodayResumeItem,
  isPlanMyDayDismissedForSession,
} from "@/lib/todayPanelDismiss";
import { CollapsibleSection } from "@/components/companion/CollapsibleSection";
import { initialSectionOpen } from "@/lib/expandableUi";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

const BTN_ROW = "mt-3 flex flex-wrap gap-2";

export function TodayPanel({
  onResume,
  onResumeLater,
  onPlanMyDay,
  onPlanMyDayLater,
  refreshKey = 0,
}: {
  onResume: (item: HomeResumeItem) => void;
  onResumeLater: (item: HomeResumeItem) => void;
  onPlanMyDay?: () => void;
  onPlanMyDayLater?: () => void;
  refreshKey?: string | number;
}) {
  const [resumeDismissed, setResumeDismissed] = useState(false);
  const [planDismissed, setPlanDismissed] = useState(
    () => isPlanMyDayDismissedForSession(),
  );
  const [resumeOpen, setResumeOpen] = useState(initialSectionOpen);
  const [planOpen, setPlanOpen] = useState(initialSectionOpen);

  const activeItem = useMemo(() => {
    if (resumeDismissed) return null;
    return findTodayResumeItem();
  }, [refreshKey, resumeDismissed]);

  const showPlanMyDay =
    Boolean(onPlanMyDay) && !planDismissed && !isPlanMyDayDismissedForSession();

  function toggleResumeSection(id: string) {
    if (id === "resume") setResumeOpen((o) => !o);
  }

  function togglePlanSection(id: string) {
    if (id === "plan-my-day") setPlanOpen((o) => !o);
  }

  return (
    <section className={workspacePanelShellClass({ width: "standard" })}>
      <div>
        <h2 className="text-3xl font-bold text-[#2f261f]">Today</h2>
        <p className="text-[#6f6259]">Resume and plan — open a section when ready.</p>
      </div>

      <div className="mt-5 rounded-3xl border border-[#e7d9c8] bg-white px-4 py-3">
        <CollapsibleSection
          id="resume"
          title="Resume"
          count={activeItem ? 1 : undefined}
          open={resumeOpen}
          onToggle={toggleResumeSection}
        >
          {!activeItem ? (
            <p className="text-sm text-[#6f6259]">
              Nothing in progress right now. Start something in Create or Projects
              — your last real work will show up here.
            </p>
          ) : (
            <div className="rounded-2xl border border-[#e7d9c8] bg-[#faf7f2] p-4">
              <p className="font-semibold text-[#2f261f]">{activeItem.title}</p>
              <p className="mt-1 text-sm text-[#6f6259]">
                {formatLastWorkedOn(activeItem.ts)}
              </p>
              <div className={BTN_ROW}>
                <button
                  type="button"
                  onClick={() => onResume(activeItem)}
                  className="rounded-xl bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#163c3c]"
                >
                  Continue →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResumeDismissed(true);
                    onResumeLater(activeItem);
                  }}
                  className="rounded-xl border border-[#d7c8b8] bg-white px-4 py-2 text-sm font-semibold text-[#6b635a] transition-colors hover:bg-[#fff8ef]"
                >
                  Later
                </button>
              </div>
            </div>
          )}
        </CollapsibleSection>
      </div>

      {showPlanMyDay ? (
        <div className="mt-4 rounded-3xl border border-[#e7d9c8] bg-white px-4 py-3">
          <CollapsibleSection
            id="plan-my-day"
            title="Plan My Day"
            open={planOpen}
            onToggle={togglePlanSection}
          >
            <p className="text-sm text-[#6f6259]">
              Map gentle momentum appointments when you are ready.
            </p>
            <div className={BTN_ROW}>
              <button
                type="button"
                onClick={onPlanMyDay}
                className="rounded-xl border border-[#d7c8b8] bg-white px-4 py-2 text-sm font-semibold text-[#3b2f27] transition-colors hover:bg-[#fff8ef]"
              >
                Start →
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlanDismissed(true);
                  onPlanMyDayLater?.();
                }}
                className="rounded-xl border border-[#d7c8b8] bg-white px-4 py-2 text-sm font-semibold text-[#6b635a] transition-colors hover:bg-[#fff8ef]"
              >
                Later
              </button>
            </div>
          </CollapsibleSection>
        </div>
      ) : null}
    </section>
  );
}
