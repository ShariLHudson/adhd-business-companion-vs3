"use client";

import { useEffect, useMemo, useState } from "react";
import { GoalMetricVisualization } from "@/components/companion/GoalMetricVisualization";
import {
  DEFAULT_INSIGHTS_EXPORT_INCLUDES,
  buildOutcomeInsightsCards,
  buildOutcomeMotivationMessages,
  downloadOutcomeInsightsCsv,
  downloadOutcomeInsightsHtml,
  formatInsightsExportHtml,
  printOutcomeInsights,
  type OutcomeInsightsExportIncludes,
} from "@/lib/goals/outcomeGoalInsights";
import {
  getActiveGoalMetrics,
  listAllOutcomeGoals,
  OUTCOME_GOALS_UPDATED,
  type OutcomeGoal,
} from "@/lib/goals/outcomeGoals";
import { itemLinkedToGoal } from "@/lib/goals/goalLinking";
import { getEvidenceEntries } from "@/lib/evidenceBankStore";
import { getSavedGrowthWins } from "@/lib/growthWinsStore";
import { getPortfolioEntries } from "@/lib/portfolioStore";

const EXPORT_LABELS: { key: keyof OutcomeInsightsExportIncludes; label: string }[] =
  [
    { key: "summary", label: "Summary" },
    { key: "charts", label: "Charts" },
    { key: "activity", label: "Activity" },
    { key: "milestones", label: "Milestones" },
    { key: "wins", label: "Wins" },
    { key: "evidence", label: "Evidence" },
    { key: "portfolio", label: "Portfolio" },
    { key: "notes", label: "Notes" },
  ];

function GoalInsightsDashboard({
  goal,
  expanded,
  onToggle,
}: {
  goal: OutcomeGoal;
  expanded: boolean;
  onToggle: () => void;
}) {
  const wins = getSavedGrowthWins().filter((w) => itemLinkedToGoal(w, goal.id));
  const evidence = getEvidenceEntries().filter((e) => itemLinkedToGoal(e, goal.id));
  const portfolio = getPortfolioEntries().filter((p) => itemLinkedToGoal(p, goal.id));
  const metrics = getActiveGoalMetrics(goal);

  return (
    <article className="overflow-hidden rounded-xl border border-[#e7dfd4] bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-[#faf7f2]/80"
      >
        <span className="text-sm text-[#9a8f82]" aria-hidden>
          {expanded ? "▼" : "▶"}
        </span>
        <span className="font-semibold text-[#1f1c19]">{goal.statement}</span>
        <span className="ml-auto text-xs text-[#1e4f4f]">Dashboard →</span>
      </button>
      {expanded ? (
        <div className="border-t border-[#efe8de] px-4 pb-4 pt-3 text-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
            Goal Summary
          </p>
          <div className="mt-2 space-y-3">
            {metrics.map((m) => (
              <GoalMetricVisualization key={m.id} metric={m} />
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase text-[#9a8f82]">Wins</p>
              <p className="mt-1 text-[#6b635a]">{wins.length} linked</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-[#9a8f82]">Evidence</p>
              <p className="mt-1 text-[#6b635a]">{evidence.length} linked</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-[#9a8f82]">Portfolio</p>
              <p className="mt-1 text-[#6b635a]">{portfolio.length} linked</p>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function OutcomeGoalInsightsTab() {
  const [tick, setTick] = useState(0);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [includes, setIncludes] = useState<OutcomeInsightsExportIncludes>(
    DEFAULT_INSIGHTS_EXPORT_INCLUDES,
  );

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(OUTCOME_GOALS_UPDATED, bump);
    return () => window.removeEventListener(OUTCOME_GOALS_UPDATED, bump);
  }, []);

  const goals = useMemo(() => {
    void tick;
    return listAllOutcomeGoals();
  }, [tick]);

  const motivation = useMemo(() => buildOutcomeMotivationMessages(), [tick]);
  const cards = useMemo(() => buildOutcomeInsightsCards(), [tick]);

  function toggleInclude(key: keyof OutcomeInsightsExportIncludes) {
    setIncludes((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function exportHtml() {
    const html = formatInsightsExportHtml(goals, includes);
    downloadOutcomeInsightsHtml(html);
  }

  return (
    <div className="flex flex-col gap-5" data-testid="outcome-goal-insights">
      <div className="space-y-2 rounded-xl border border-[#c5e0e0] bg-[#f0f8f8] px-4 py-4">
        {motivation.map((msg) => (
          <p
            key={msg}
            className="text-sm font-semibold leading-relaxed text-[#1e4f4f]"
            data-testid="insights-motivation"
          >
            {msg}
          </p>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="rounded-xl border border-[#e7dfd4] bg-white px-4 py-3"
            data-testid={`insights-card-${card.id}`}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
              {card.label}
            </p>
            <p className="mt-1 text-base font-semibold text-[#1f1c19]">
              {card.value}
            </p>
            {card.hint ? (
              <p className="mt-0.5 text-xs text-[#6b635a]">{card.hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-wide text-[#9a8f82]">
          Goal Dashboards
        </h3>
        <div className="mt-2 flex flex-col gap-2">
          {goals.length === 0 ? (
            <p className="text-sm text-[#6b635a]">No goals to show yet.</p>
          ) : (
            goals.map((goal) => (
              <GoalInsightsDashboard
                key={goal.id}
                goal={goal}
                expanded={expandedGoalId === goal.id}
                onToggle={() =>
                  setExpandedGoalId((id) => (id === goal.id ? null : goal.id))
                }
              />
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/60 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-[#9a8f82]">
          Export
        </h3>
        <p className="mt-1 text-sm text-[#6b635a]">
          Print or download for coaching, reviews, or accountability partners.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXPORT_LABELS.map(({ key, label }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#c9bfb0] bg-white px-2.5 py-1 text-xs font-semibold text-[#6b635a]"
            >
              <input
                type="checkbox"
                checked={includes[key]}
                onChange={() => toggleInclude(key)}
              />
              {label}
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => printOutcomeInsights(formatInsightsExportHtml(goals, includes))}
            className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white"
            data-testid="insights-export-print"
          >
            Print
          </button>
          <button
            type="button"
            onClick={exportHtml}
            className="rounded-lg border border-[#c9bfb0] px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
            data-testid="insights-export-html"
          >
            Download HTML
          </button>
          <button
            type="button"
            onClick={() => downloadOutcomeInsightsCsv(goals)}
            className="rounded-lg border border-[#c9bfb0] px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
            data-testid="insights-export-csv"
          >
            Download CSV
          </button>
        </div>
      </section>
    </div>
  );
}

/** @deprecated Use OutcomeGoalInsightsTab — re-exported from OutcomeGoalReportsTab.tsx */