"use client";

import type { ExperimentMetricRow } from "@/lib/founderWorkspace/experimentMetrics";

function statusColor(status: string, success: boolean | null): string {
  if (success === true) return "border-[#1e4f4f]/40 bg-[#1e4f4f]/8";
  if (success === false) return "border-[#a85c4a]/40 bg-[#a85c4a]/8";
  if (status === "testing") return "border-[#e8c547]/50 bg-[#e8c547]/10";
  if (status === "parked") return "border-[#d4cdc3] bg-[#faf8f5]";
  return "border-[#d4cdc3] bg-white";
}

function statusDot(status: string, success: boolean | null): string {
  if (success === true) return "bg-[#1e4f4f]";
  if (success === false) return "bg-[#a85c4a]";
  if (status === "testing") return "bg-[#e8c547]";
  return "bg-[#6b635a]";
}

export function ExperimentWidget({
  row,
  selected,
  onSelect,
}: {
  row: ExperimentMetricRow;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-xl border p-4 text-left shadow-sm transition-shadow hover:shadow-md ${statusColor(row.status, row.success)} ${
        selected ? "ring-2 ring-[#1e4f4f]/40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${statusDot(row.status, row.success)}`}
              aria-hidden
            />
            <h3 className="truncate font-semibold text-[#1f1c19]">{row.title}</h3>
          </div>
          {row.relatedProjectTitle ? (
            <p className="mt-0.5 truncate text-xs text-[#6b635a]">
              → {row.relatedProjectTitle}
            </p>
          ) : null}
        </div>
        {row.insightsFlagged > 0 ? (
          <span className="shrink-0 rounded-full bg-[#a85c4a]/15 px-2 py-0.5 text-[10px] font-semibold text-[#a85c4a]">
            {row.insightsFlagged} flagged
          </span>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-[#6b635a]">Complete</p>
          <p className="text-lg font-semibold text-[#1f1c19]">{row.completionRate}%</p>
        </div>
        <div>
          <p className="text-[#6b635a]">Time</p>
          <p className="text-lg font-semibold text-[#1f1c19]">{row.timeInvestedMinutes}m</p>
        </div>
        <div>
          <p className="text-[#6b635a]">Tasks</p>
          <p className="font-semibold">
            {row.tasksCompleted}/{row.taskCount}
          </p>
        </div>
        <div>
          <p className="text-[#6b635a]">Tokens</p>
          <p className="font-semibold">{row.apiTokens}</p>
        </div>
      </div>

      {row.projectDelayed ? (
        <p className="mt-2 text-[11px] font-medium text-[#a85c4a]">Linked project delayed</p>
      ) : null}
    </button>
  );
}
