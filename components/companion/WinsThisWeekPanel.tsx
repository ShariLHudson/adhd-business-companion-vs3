"use client";

import { useMemo } from "react";
import {
  buildWeeklyWins,
  formatWeeklyWinLine,
  getWeeklyWinsHistory,
} from "@/lib/weeklyWins";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

export function WinsThisWeekPanel({ refreshKey = 0 }: { refreshKey?: string | number }) {
  const snapshot = useMemo(() => buildWeeklyWins(), [refreshKey]);
  const history = useMemo(() => getWeeklyWinsHistory(), [refreshKey]);

  return (
    <section className={workspacePanelShellClass({ width: "standard" })}>
      <div>
        <h2 className="text-3xl font-bold text-[#2f261f]">Wins This Week</h2>
        <p className="text-[#6f6259]">
          Progress matters more than completion. Every small step counts.
        </p>
      </div>

      <WorkspaceAreaWorksGuide areaId="wins-this-week" />
      <WorkspaceAreaWorksGuide areaId="evidence-bank" />

      <div className="mt-5 rounded-3xl border border-[#e7d9c8] bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          {snapshot.weekLabel}
        </p>
        {snapshot.stats.length === 0 ? (
          <p className="mt-3 text-sm text-[#6f6259]">
            No wins recorded yet this week.
            <br />
            Every small step counts.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {snapshot.stats.map((stat) => (
              <li
                key={stat.id}
                className="flex items-start gap-2 text-sm text-[#2f261f]"
              >
                <span aria-hidden="true">{stat.icon}</span>
                <span>{formatWeeklyWinLine(stat)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {history.length > 0 ? (
        <div className="mt-4 rounded-3xl border border-[#e7d9c8] bg-[#faf7f2] p-5">
          <h3 className="text-sm font-bold text-[#2f261f]">Previous weeks</h3>
          <p className="mt-1 text-xs text-[#6f6259]">
            Kept for you — not shown on Today.
          </p>
          <ul className="mt-3 space-y-3">
            {history.slice(0, 8).map((entry) => (
              <li key={entry.weekKey} className="text-sm text-[#2f261f]">
                <p className="font-semibold">{entry.weekLabel}</p>
                {entry.stats.length === 0 ? (
                  <p className="mt-0.5 text-xs text-[#6f6259]">No wins recorded</p>
                ) : (
                  <ul className="mt-1 space-y-0.5 text-xs text-[#6b635a]">
                    {entry.stats.map((stat) => (
                      <li key={stat.id}>{formatWeeklyWinLine(stat)}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
