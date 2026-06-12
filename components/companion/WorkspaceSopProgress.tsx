"use client";

import { memo } from "react";
import {
  getCurrentSopStep,
  getSopProgress,
  getWorkflow,
  type WorkspaceSession,
} from "@/lib/workspaceSop";
import { workspaceSessionEqual } from "@/lib/workspacePanelSync";

function WorkspaceSopProgressInner({
  session,
}: {
  session: WorkspaceSession | null;
}) {
  if (!session) return null;

  const wf = getWorkflow(session.workflowId);
  const items = getSopProgress(session);
  const current = getCurrentSopStep(session);

  return (
    <div className="sticky top-0 z-10 border-b border-[#e8e0d4] bg-[#faf8f5] shadow-sm">
      <div className="border-b border-[#e8e0d4]/80 bg-[#1e4f4f]/[0.06] px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
          Current step
        </p>
        <p className="mt-0.5 text-base font-semibold text-[#1f1c19]">
          {current.label}
        </p>
        <p className="mt-1 text-sm text-[#6b635a]">
          {session.currentStepHint ??
            `Shari is helping you with the ${current.label.toLowerCase()}.`}
        </p>
      </div>
      <div className="px-4 py-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#9a8f82]">
          {wf.title}
        </p>
        <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
          {items.map((item) => (
            <li
              key={item.id}
              className={`text-xs font-medium ${
                item.status === "done"
                  ? "text-[#1e4f4f]"
                  : item.status === "current"
                    ? "text-[#1f1c19]"
                    : "text-[#9a8f82]"
              }`}
            >
              <span aria-hidden="true" className="mr-0.5">
                {item.status === "done" ? "✓" : "○"}
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export const WorkspaceSopProgress = memo(
  WorkspaceSopProgressInner,
  (prev, next) => workspaceSessionEqual(prev.session, next.session),
);
