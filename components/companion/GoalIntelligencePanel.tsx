"use client";

import { useState } from "react";
import type { GoalCoachingIntelligence } from "@/lib/goals/goalCoachingIntelligence";

const SECTION_LABEL = "text-xs font-bold uppercase tracking-wide text-[#9a8f82]";

function InsightList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-[#9a8f82]">Nothing notable right now.</p>;
  }
  return (
    <ul className="space-y-1 text-sm text-[#4b463f]">
      {items.map((item) => (
        <li key={item}>• {item}</li>
      ))}
    </ul>
  );
}

export function GoalIntelligencePanel({
  intelligence,
}: {
  intelligence: GoalCoachingIntelligence;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-4" data-testid="goal-intelligence-panel">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-lg py-2 text-left text-sm font-semibold text-[#1f1c19] hover:bg-[#faf7f2]/80"
        aria-expanded={open}
      >
        <span className="text-[#9a8f82]" aria-hidden>
          {open ? "▼" : "▶"}
        </span>
        Goal Intelligence™
      </button>

      {open ? (
        <div className="mt-2 space-y-4 rounded-lg border border-[#efe8de] bg-[#faf7f2]/50 p-3">
          <div>
            <p className={SECTION_LABEL}>Progress Summary</p>
            <p className="mt-1 text-sm text-[#4b463f]">
              {intelligence.progressSummary}
            </p>
          </div>

          <div>
            <p className={SECTION_LABEL}>What&apos;s Working</p>
            <div className="mt-1">
              <InsightList items={intelligence.whatsWorking} />
            </div>
          </div>

          <div>
            <p className={SECTION_LABEL}>What&apos;s Blocking Progress</p>
            <div className="mt-1">
              <InsightList items={intelligence.whatsBlocking} />
            </div>
          </div>

          <div>
            <p className={SECTION_LABEL}>Suggested Next Action</p>
            <ul className="mt-1 space-y-1 text-sm text-[#4b463f]">
              {intelligence.suggestedActions.map((action) => (
                <li key={action}>• {action}</li>
              ))}
            </ul>
          </div>

          {intelligence.patternInsight ? (
            <div data-testid="goal-pattern-insight">
              <p className={SECTION_LABEL}>Pattern Insight</p>
              <p className="mt-1 text-sm text-[#4b463f]">
                {intelligence.patternInsight}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export function GoalNextBestAction({ action }: { action: string }) {
  return (
    <div
      className="mt-4 rounded-lg border border-[#c5e0e0]/60 bg-[#f0f8f8]/60 px-3 py-2.5"
      data-testid="goal-next-best-action"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
        Suggested Next Step
      </p>
      <p className="mt-1 text-sm text-[#2a2520]">{action}</p>
      <p className="mt-1 text-xs text-[#9a8f82]">Optional — only if it feels helpful.</p>
    </div>
  );
}
