"use client";

import type { SimpleDayPlanView } from "@/lib/day-designer/types";
import { dismissDayDesigner } from "@/lib/day-designer";

type DayPlanCardProps = {
  view: SimpleDayPlanView;
  onDismiss: () => void;
};

/** Simple adaptive day plan — focus, first step, wait, margin. No packed schedule. */
export function DayPlanCard({ view, onDismiss }: DayPlanCardProps) {
  function handleDismiss() {
    dismissDayDesigner();
    onDismiss();
  }

  return (
    <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white/90 p-4 shadow-sm">
      <p className="text-center text-sm font-semibold text-[#1e4f4f]">
        Today&apos;s gentle plan
      </p>
      <div className="mt-3 space-y-3 text-sm text-[#6b635a]">
        <div>
          <p className="font-semibold text-[#2d2926]">Today&apos;s focus</p>
          <p>{view.todaysFocus}</p>
        </div>
        <div>
          <p className="font-semibold text-[#2d2926]">First step</p>
          <p>{view.firstStep}</p>
        </div>
        <div>
          <p className="font-semibold text-[#2d2926]">What can wait</p>
          <ul className="mt-1 list-inside list-disc">
            {view.canWait.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-[#2d2926]">Recovery / margin</p>
          <p>{view.recoveryMargin}</p>
        </div>
      </div>
      <p className="mt-3 text-xs italic text-[#9a8f82]">{view.reasoningSummary}</p>
      {view.adhdSupportTips.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-[#9a8f82]">
          {view.adhdSupportTips.map((tip) => (
            <li key={tip}>• {tip}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full border border-[#1e4f4f]/30 bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white"
        >
          Not now — I&apos;ll wing it
        </button>
      </div>
    </div>
  );
}
