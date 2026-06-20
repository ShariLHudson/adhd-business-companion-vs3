"use client";

import { useState } from "react";
import { initialSectionOpen } from "@/lib/expandableUi";
import { getWorkspaceAreaWorkflow } from "@/lib/workspaceAreaWorkflows";

/** Top-level workflow overview — collapsed by default; coexists with section help. */
export function WorkspaceAreaWorksGuide({ areaId }: { areaId: string }) {
  const workflow = getWorkspaceAreaWorkflow(areaId);
  const [open, setOpen] = useState(initialSectionOpen);

  if (!workflow?.steps.length) return null;

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-[#1e4f4f]/15 bg-white/85 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-[#f0f5f5]/60"
        aria-expanded={open}
      >
        <span className="text-[#9a8f82]" aria-hidden="true">
          {open ? "▼" : "▶"}
        </span>
        <span className="text-sm font-semibold text-[#1e4f4f]">
          How This Area Works
        </span>
      </button>
      {open ? (
        <div className="border-t border-[#e7dfd4] px-4 py-4">
          <ol className="flex flex-col gap-2.5">
            {workflow.steps.map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1e4f4f] text-xs font-bold text-white"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-[#4b463f]">
                  {step}
                </span>
              </li>
            ))}
          </ol>
          {workflow.tip ? (
            <p className="mt-4 rounded-xl border border-[#1e4f4f]/15 bg-[#f0f5f5] px-3 py-2.5 text-sm leading-relaxed text-[#2d2926]">
              <span className="font-semibold text-[#1e4f4f]">Tip: </span>
              {workflow.tip}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
