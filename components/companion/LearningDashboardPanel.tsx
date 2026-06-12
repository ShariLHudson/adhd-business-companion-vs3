"use client";

import { useMemo } from "react";
import type { FounderEvent } from "@/lib/ecosystem/events";
import { buildLearningDashboard } from "@/lib/ecosystem/learning/dashboardMetrics";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#1e4f4f]/[0.05] px-3 py-2">
      <p className="text-[10px] font-bold uppercase text-[#6b635a]">{label}</p>
      <p className="text-sm font-semibold text-[#1f1c19]">{value}</p>
    </div>
  );
}

export function LearningDashboardPanel({
  events,
  founderId = "founder-001",
}: {
  events: FounderEvent[];
  founderId?: string;
}) {
  const dash = useMemo(
    () => buildLearningDashboard(events, founderId),
    [events, founderId],
  );

  const topAutomation = dash.automationSuccess[0];
  const peakEngagement = [...dash.engagementHeatmap].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Success rate" value={`${dash.overallSuccessRate}%`} />
        <Stat label="Time saved" value={`${dash.totalTimeSavedMinutes} min`} />
        <Stat
          label="Pending"
          value={String(dash.pendingVsExecuted.pending)}
        />
        <Stat
          label="Executed"
          value={String(dash.pendingVsExecuted.executed)}
        />
        <Stat
          label="Dismissed"
          value={String(dash.pendingVsExecuted.dismissed)}
        />
        <Stat
          label="Rejected"
          value={String(dash.pendingVsExecuted.rejected)}
        />
      </div>

      {dash.insights.length > 0 ? (
        <ul className="flex flex-col gap-1 text-sm text-[#2d2926]">
          {dash.insights.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      ) : null}

      {topAutomation ? (
        <div>
          <p className="text-xs font-bold uppercase text-[#6b635a]">
            Automation success metrics
          </p>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm">
            {dash.automationSuccess.slice(0, 5).map((m) => (
              <li
                key={m.key}
                className="flex justify-between rounded-lg border border-[#e4ddd2] px-3 py-2"
              >
                <span className="font-medium text-[#1f1c19]">{m.title}</span>
                <span className="text-xs text-[#6b635a]">
                  {m.approvalRate}% approved · {m.executionRate}% executed
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {dash.timeSavedPerTool.length > 0 ? (
        <div>
          <p className="text-xs font-bold uppercase text-[#6b635a]">
            Time saved per tool
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-[#2d2926]">
            {dash.timeSavedPerTool.slice(0, 6).map((t) => (
              <li key={t.tool}>
                {t.tool}: {t.totalTimeSavedMinutes} min ({t.triggerCount} uses)
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {dash.workflowEfficiency.length > 0 ? (
        <div>
          <p className="text-xs font-bold uppercase text-[#6b635a]">
            Workflow efficiency
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-[#2d2926]">
            {dash.workflowEfficiency.slice(0, 4).map((w) => (
              <li key={w.sequence.join("→")}>
                {w.sequence.join(" → ")} ({w.count}×)
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {peakEngagement && peakEngagement.count > 0 ? (
        <p className="text-xs text-[#6b635a]">
          Engagement heatmap peak: {peakEngagement.day} {peakEngagement.hour}:00 UTC
        </p>
      ) : null}
    </div>
  );
}
