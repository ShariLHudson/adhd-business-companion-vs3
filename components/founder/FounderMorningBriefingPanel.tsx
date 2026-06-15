"use client";

import { useMemo } from "react";

import { buildFounderMorningBriefing } from "@/lib/founder-briefing/briefingEngine";
import { statusColorClass, statusLabel } from "@/lib/founder-briefing/briefingPriorities";

function BriefingList({
  items,
  empty,
}: {
  items: { title: string; reason: string }[];
  empty: string;
}) {
  if (!items.length) {
    return <p className="text-xs text-[#9a8f82]">{empty}</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.title} className="text-sm">
          <p className="font-medium text-[#1f1c19]">{item.title}</p>
          <p className="text-xs text-[#6b635a]">{item.reason}</p>
        </li>
      ))}
    </ul>
  );
}

/** Ecosystem morning briefing — under 60 seconds, no giant tables. */
export function FounderMorningBriefingPanel() {
  const briefing = useMemo(() => buildFounderMorningBriefing(), []);

  return (
    <section className="rounded-xl border border-[#1e4f4f]/25 bg-gradient-to-br from-[#1e4f4f]/6 to-white p-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Morning Briefing
      </p>
      <h2 className="mt-1 text-lg font-semibold text-[#1f1c19]">
        {briefing.greeting}
      </h2>
      <p
        className={`mt-1 text-sm font-medium capitalize ${statusColorClass(briefing.overallStatus)}`}
      >
        {statusLabel(briefing.overallStatus)}
      </p>

      <ul className="mt-3 space-y-1 text-sm text-[#6b635a]">
        {briefing.summaryLines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-[10px] font-bold uppercase text-[#1e4f4f]">
            Top priorities
          </h3>
          <div className="mt-2">
            <BriefingList
              items={briefing.topPriorities}
              empty="Nothing urgent — ecosystem looks steady."
            />
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase text-[#1e4f4f]">
            Opportunities
          </h3>
          <div className="mt-2">
            <BriefingList
              items={briefing.opportunities}
              empty="No standout opportunities yet."
            />
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase text-[#c9684d]">
            Risks
          </h3>
          <div className="mt-2">
            <BriefingList
              items={briefing.risks}
              empty="No elevated risks right now."
            />
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase text-[#1e4f4f]">
            Wins
          </h3>
          <div className="mt-2">
            <BriefingList
              items={briefing.wins}
              empty="Wins will show as more data comes in."
            />
          </div>
        </div>
      </div>

      {briefing.recommendations.length > 0 ? (
        <div className="mt-4 rounded-lg border border-[#ebe4d9] bg-white/80 p-3">
          <h3 className="text-[10px] font-bold uppercase text-[#1e4f4f]">
            Recommended actions (max 3)
          </h3>
          <ul className="mt-2 space-y-1 text-xs text-[#6b635a]">
            {briefing.recommendations.map((rec) => (
              <li key={rec}>· {rec}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
