"use client";

import { useState } from "react";

export const PLAN_DAY_HOW_DO_I_COPY =
  "Write down anything you want to do today.\nDon't worry about organizing it.\nYou can always change it later.";

/**
 * Small expandable help — closed by default; directions only when opened.
 */
export function PlanDayHowDoI() {
  const [open, setOpen] = useState(false);

  return (
    <div className="plan-day-how-do-i" data-testid="plan-day-how-do-i">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="plan-day-how-do-i__toggle inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:text-[#163c3c] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
        aria-expanded={open}
        data-testid="plan-day-how-do-i-toggle"
      >
        How Do I?
        <span aria-hidden="true" className="text-xs font-bold">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <p
          className="plan-day-how-do-i__body mt-2 max-w-xl whitespace-pre-line text-sm leading-relaxed text-[#4b463f]"
          data-testid="plan-day-how-do-i-body"
        >
          {PLAN_DAY_HOW_DO_I_COPY}
        </p>
      ) : null}
    </div>
  );
}
