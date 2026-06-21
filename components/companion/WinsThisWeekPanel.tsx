"use client";

import { useMemo } from "react";
import {
  buildWeeklyWins,
  formatWeeklyWinLine,
  getWeeklyWinMoments,
  getWeeklyWinsHistory,
} from "@/lib/weeklyWins";
import { hasEvidenceForWin } from "@/lib/evidenceBankStore";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

export function WinsThisWeekPanel({
  refreshKey = 0,
  onSaveToEvidenceBank,
  onOpenEvidenceBank,
}: {
  refreshKey?: string | number;
  onSaveToEvidenceBank?: (whatHappened: string, sourceWinId: string) => void;
  onOpenEvidenceBank?: () => void;
}) {
  const snapshot = useMemo(() => buildWeeklyWins(), [refreshKey]);
  const history = useMemo(() => getWeeklyWinsHistory(), [refreshKey]);
  const moments = useMemo(() => getWeeklyWinMoments(), [refreshKey]);

  return (
    <section className={workspacePanelShellClass({ width: "standard" })}>
      <div>
        <h2 className="text-3xl font-bold text-[#2f261f]">Wins This Week</h2>
        <p className="text-[#6f6259]">
          What happened this week — progress matters more than completion.
        </p>
        {onOpenEvidenceBank ? (
          <button
            type="button"
            onClick={onOpenEvidenceBank}
            className="mt-2 text-sm font-semibold text-[#b45309] hover:underline"
          >
            Open Evidence Bank →
          </button>
        ) : null}
      </div>

      <WorkspaceAreaWorksGuide areaId="wins-this-week" />

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

      {moments.length > 0 && onSaveToEvidenceBank ? (
        <div className="mt-4 rounded-3xl border border-[#e7d9c8] bg-[#faf7f2] p-5">
          <h3 className="text-sm font-bold text-[#2f261f]">This week&apos;s moments</h3>
          <p className="mt-1 text-xs text-[#6f6259]">
            Save a win to Evidence Bank when you want to capture why it mattered.
          </p>
          <ul className="mt-3 space-y-2">
            {moments.map((moment) => {
              const saved = hasEvidenceForWin(moment.sourceWinId);
              return (
                <li
                  key={moment.id}
                  className="flex flex-col gap-2 rounded-2xl border border-[#e7d9c8] bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-2 text-sm text-[#2f261f]">
                    <span aria-hidden="true">{moment.icon}</span>
                    <span className="min-w-0">{moment.whatHappened}</span>
                  </div>
                  {saved ? (
                    <span className="shrink-0 text-xs font-semibold text-[#9a8f82]">
                      Saved to Evidence Bank
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onSaveToEvidenceBank(
                          moment.whatHappened,
                          moment.sourceWinId,
                        )
                      }
                      className="shrink-0 rounded-full border border-[#e7d9c8] bg-[#faf7f2] px-3 py-1.5 text-xs font-semibold text-[#2f261f] hover:bg-[#f3ebe0]"
                    >
                      Save to Evidence Bank
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

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
