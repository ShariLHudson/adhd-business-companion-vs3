"use client";

import { evaluateChiefOfStaff } from "@/lib/chief-of-staff/chiefEngine";
import { chiefAssessmentLabel } from "@/lib/chief-of-staff/chiefInsights";
import { buildFounderChiefReport } from "@/lib/chief-of-staff/founderChiefReporting";

export function FounderChiefOfStaffPanel() {
  const report = buildFounderChiefReport();
  const live = evaluateChiefOfStaff();

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Chief of Staff Intelligence
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        Focus on the right work — capacity before growth.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Assessment
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {chiefAssessmentLabel(live.overallAssessment)}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Founder capacity
          </p>
          <p className="mt-1 text-xl font-semibold capitalize text-[#1f1c19]">
            {live.founderCapacity}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Recommended focus
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1f1c19]">
            {live.recommendedFocus}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Samples (7d)
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.sampleSize}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3 text-xs text-[#6b635a]">
          <p className="font-semibold text-[#2d2926]">Biggest risk</p>
          <p className="mt-1">{live.biggestRisk}</p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3 text-xs text-[#6b635a]">
          <p className="font-semibold text-[#2d2926]">Biggest opportunity</p>
          <p className="mt-1">{live.biggestOpportunity}</p>
        </div>
      </div>

      {live.recommendedActions.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Top actions</li>
          {live.recommendedActions.map((a) => (
            <li key={a.id}>{a.label}</li>
          ))}
        </ul>
      ) : null}

      {live.projectsToIgnore.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">
            Today you can safely ignore
          </li>
          {live.projectsToIgnore.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-xs font-medium text-[#1e4f4f]">
        Recommended founder action: {report.recommendedFounderAction}
      </p>
      <p className="mt-1 text-xs text-[#9a8f82]">{report.notes}</p>
    </section>
  );
}
