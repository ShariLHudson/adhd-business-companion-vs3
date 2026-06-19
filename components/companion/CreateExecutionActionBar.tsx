"use client";

import type { ExecutionActionId } from "@/lib/createExecution";

const ACTION_LABELS: Record<ExecutionActionId, string> = {
  "add-to-project": "Add To Existing Project",
  "create-project": "Create Project From This",
  "action-plan": "Create Action Plan",
  "task-list": "Create Task List",
  "google-doc": "Save To Google Docs",
  "google-sheet": "Save To Google Sheets",
  "download-pdf": "Download PDF",
};

export function CreateExecutionActionBar({
  actions,
  onAction,
  disabled,
}: {
  actions: ExecutionActionId[];
  onAction: (action: ExecutionActionId) => void;
  disabled?: boolean;
}) {
  if (!actions.length) return null;

  return (
    <div
      className="mt-4 rounded-xl border border-[#c9dfd8] bg-[#f0f7f5] px-4 py-3"
      data-testid="create-execution-action-bar"
      role="region"
      aria-label="Take action"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
        Take Action
      </p>
      <p className="mt-0.5 text-sm text-[#6b635a]">
        Move this from draft to execution — project, tasks, or Google.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            disabled={disabled}
            onClick={() => onAction(action)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
              action === "create-project"
                ? "bg-[#1e4f4f] text-white hover:bg-[#163a3a]"
                : "border border-[#1e4f4f]/30 bg-white text-[#1e4f4f] hover:bg-[#1e4f4f]/8"
            }`}
          >
            {ACTION_LABELS[action]}
          </button>
        ))}
      </div>
    </div>
  );
}
