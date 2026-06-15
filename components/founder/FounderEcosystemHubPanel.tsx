"use client";

import { evaluateEcosystem } from "@/lib/ecosystem-intelligence/ecosystemEngine";
import { ecosystemHealthLabel } from "@/lib/ecosystem-intelligence/ecosystemInsights";
import { priorityLabel } from "@/lib/ecosystem-intelligence/ecosystemPriority";
import { buildFounderEcosystemReport } from "@/lib/ecosystem-intelligence/founderEcosystemReporting";

export function FounderEcosystemHubPanel() {
  const report = buildFounderEcosystemReport();
  const live = evaluateEcosystem();

  const suppressed = live.suppressions.slice(0, 6);

  return (
    <section className="rounded-xl border border-[#1e4f4f]/25 bg-[#f8fbfa] p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Ecosystem Intelligence Hub
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        One Companion — coordinated signals, reduced noise.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#ebe4d9] bg-white p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            User ecosystem
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {ecosystemHealthLabel(live.userState.health)}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-white p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Founder ecosystem
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {ecosystemHealthLabel(live.founderState.health)}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-white p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Top priority
          </p>
          <p className="mt-1 text-sm font-semibold capitalize text-[#1f1c19]">
            {priorityLabel(live.topSignal)}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-white p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Active layers
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {live.activeIntelligenceLayers.length}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-[#6b635a]">
        <span className="font-semibold text-[#2d2926]">Priority reason:</span>{" "}
        {live.priorityReason}
      </p>

      {report.topUserNeeds.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Top user support needs</li>
          {report.topUserNeeds.map((need) => (
            <li key={need}>{need}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {live.founderState.topRisk ? (
          <div className="rounded-lg border border-[#ebe4d9] bg-white p-3 text-xs text-[#6b635a]">
            <p className="font-semibold text-[#2d2926]">Top founder risk</p>
            <p className="mt-1">{live.founderState.topRisk}</p>
          </div>
        ) : null}
        {live.founderState.topOpportunity ? (
          <div className="rounded-lg border border-[#ebe4d9] bg-white p-3 text-xs text-[#6b635a]">
            <p className="font-semibold text-[#2d2926]">Top founder opportunity</p>
            <p className="mt-1">{live.founderState.topOpportunity}</p>
          </div>
        ) : null}
      </div>

      {suppressed.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Suppressed signals</li>
          {suppressed.map((s) => (
            <li key={s}>• {s.replace(/_/g, " ")}</li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-xs font-medium text-[#1e4f4f]">
        Recommended system improvement: {report.recommendedSystemImprovement}
      </p>
      <p className="mt-1 text-xs text-[#9a8f82]">{report.notes}</p>
    </section>
  );
}
