"use client";

import { useMemo } from "react";
import type { FounderEvent } from "@/lib/ecosystem/events";
import { selectNetworkDashboard, isDashboardSafe } from "@/lib/ecosystem/network/multiFounderSelectors";
import { COHORT_TOO_SMALL_MESSAGE } from "@/lib/ecosystem/network/multiFounderConfig";

export function NetworkDashboardPanel({
  events,
  founderId = "founder-001",
}: {
  events: FounderEvent[];
  founderId?: string;
}) {
  const dash = useMemo(
    () => selectNetworkDashboard(events, founderId),
    [events, founderId],
  );

  if (!isDashboardSafe(dash)) {
    return (
      <p className="text-sm text-[#6b635a]">
        Network insights are temporarily unavailable.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!dash.cohortReady ? (
        <p className="text-sm text-[#6b635a]">{COHORT_TOO_SMALL_MESSAGE}</p>
      ) : null}

      {dash.networkBenchmarks.length > 0 ? (
        <div>
          <p className="text-xs font-bold uppercase text-[#6b635a]">
            Similar founder benchmarks
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-[#2d2926]">
            {dash.networkBenchmarks.map((b) => (
              <li key={b.label}>
                {b.label}: {b.value}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {dash.commonMomentumDrivers.length > 0 ? (
        <div>
          <p className="text-xs font-bold uppercase text-[#6b635a]">
            Common momentum drivers
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-[#2d2926]">
            {dash.commonMomentumDrivers.map((d) => (
              <li key={d}>• {d}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {dash.commonOverwhelmTriggers.length > 0 ? (
        <div>
          <p className="text-xs font-bold uppercase text-[#6b635a]">
            Common overwhelm triggers
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-[#2d2926]">
            {dash.commonOverwhelmTriggers.map((t) => (
              <li key={t}>• {t}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {dash.recommendedExperiments.length > 0 ? (
        <div>
          <p className="text-xs font-bold uppercase text-[#6b635a]">
            Recommended experiments
          </p>
          <ul className="mt-2 flex flex-col gap-2 text-sm">
            {dash.recommendedExperiments.slice(0, 4).map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-[#e4ddd2] px-3 py-2 text-[#2d2926]"
              >
                <p className="font-medium text-[#1f1c19]">{r.strategy}</p>
                <p className="mt-1 text-xs text-[#6b635a]">{r.framing}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {dash.stageSpecificRisks.length > 0 ? (
        <div>
          <p className="text-xs font-bold uppercase text-[#6b635a]">
            Stage-specific risks
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-[#2d2926]">
            {dash.stageSpecificRisks.map((r) => (
              <li key={`${r.stage}-${r.risk}`}>
                {r.stage}: {r.risk} (~{r.prevalence}%)
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {dash.stageSpecificOpportunities.length > 0 ? (
        <div>
          <p className="text-xs font-bold uppercase text-[#6b635a]">
            Stage-specific opportunities
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-[#2d2926]">
            {dash.stageSpecificOpportunities.map((o) => (
              <li key={`${o.stage}-${o.opportunity}`}>
                {o.stage}: {o.opportunity} (~{o.prevalence}%)
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
