"use client";

import { useState } from "react";
import { getWorkspaceHelpContent } from "@/lib/workspaceHelpContent";

/**
 * Small help icon — replaces permanent "How To Use" dropdowns.
 */
export function PlanDayHelpIcon({ areaId = "plan-my-day" }: { areaId?: string }) {
  const help = getWorkspaceHelpContent(areaId);
  const [open, setOpen] = useState(false);

  if (!help) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e7dfd4] bg-white text-sm font-bold text-[#6b635a] hover:border-[#1e4f4f]/40 hover:text-[#1e4f4f]"
        aria-expanded={open}
        aria-label={`Help for ${help.areaName}`}
        data-testid="plan-day-help-icon"
      >
        ?
      </button>
      {open ? (
        <div
          className="absolute right-0 top-full z-20 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-[#e7dfd4] bg-white p-4 shadow-lg"
          role="dialog"
          aria-label={`${help.areaName} help`}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-[#b45309]">
            {help.areaName}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#2d2926]">
            {help.whatItIs}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#4b463f]">
            {help.whenToUse}
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 text-sm font-semibold text-[#1e4f4f] hover:underline"
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
