"use client";

import { useEffect, useState } from "react";
import {
  activeOutcomeCount,
  createOutcomeGoal,
  deleteOutcomeGoal,
  formatOutcomeProgressLabel,
  getPrimaryOutcomeGoal,
  goalProgressPercent,
  listOutcomeGoals,
  logOutcomeGoalProgress,
  OUTCOME_GOALS_UPDATED,
  RECOMMENDED_ACTIVE_OUTCOMES,
  setPrimaryOutcomeGoal,
  suggestSupportingActivities,
  type OutcomeGoal,
} from "@/lib/goals/outcomeGoals";
import { queueGrowthSaveSuggestion } from "@/lib/growth/growthSaveSuggestions";

const INPUT =
  "mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base outline-none focus:border-[#1e4f4f]";

const LABEL = "block text-sm font-semibold text-[#1f1c19]";

function formatDeadline(deadline: string): string {
  try {
    return new Date(`${deadline}T12:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return deadline;
  }
}

function ProgressSnapshot({ goal }: { goal: OutcomeGoal }) {
  const pct = goalProgressPercent(goal);
  return (
    <div className="mt-3" data-testid="outcome-progress-snapshot">
      <p className="text-2xl font-bold tabular-nums text-[#1e4f4f]">
        {formatOutcomeProgressLabel(goal)}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e7dfd4]">
        <div
          className="h-full rounded-full bg-[#1e4f4f] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-[#9a8f82]">
        {pct}% toward your target
        {goal.metricKind === "revenue" ? " · self-reported" : ""}
      </p>
    </div>
  );
}

function GoalCard({
  goal,
  isPrimary,
  onRefresh,
}: {
  goal: OutcomeGoal;
  isPrimary: boolean;
  onRefresh: () => void;
}) {
  const [logAmount, setLogAmount] = useState("");

  function handleLog(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const updated = logOutcomeGoalProgress(goal.id, amount);
    if (!updated) return;
    setLogAmount("");
    queueGrowthSaveSuggestion({
      text: `Progress on "${goal.statement}" — ${formatOutcomeProgressLabel(updated)}`,
      destinations: ["wins", "evidence"],
    });
    onRefresh();
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        isPrimary
          ? "border-[#1e4f4f]/30 bg-[#f0f8f8]/60"
          : "border-[#e7dfd4] bg-[#faf7f2]/80"
      }`}
      data-testid={isPrimary ? "primary-outcome-goal" : "outcome-goal-card"}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {isPrimary ? (
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#1e4f4f]">
              Primary outcome
            </p>
          ) : null}
          <p className="font-semibold text-[#1f1c19]">{goal.statement}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!isPrimary ? (
            <button
              type="button"
              onClick={() => {
                setPrimaryOutcomeGoal(goal.id);
                onRefresh();
              }}
              className="text-xs font-semibold text-[#1e4f4f] hover:underline"
              title="Set as primary outcome"
            >
              Make primary
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              deleteOutcomeGoal(goal.id);
              onRefresh();
            }}
            className="text-xs text-[#9a8f82] hover:text-[#a85c4a]"
          >
            Remove
          </button>
        </div>
      </div>

      <ProgressSnapshot goal={goal} />

      <p className="mt-2 text-xs text-[#6b635a]">
        By {formatDeadline(goal.deadline)} · Done when: {goal.definitionOfDone}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {goal.metricKind === "count" ? (
          <button
            type="button"
            onClick={() => handleLog(1)}
            className="rounded-lg border border-[#1e4f4f]/30 px-3 py-1.5 text-xs font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
          >
            +1
          </button>
        ) : null}
        <input
          type="number"
          min={1}
          placeholder={goal.metricKind === "revenue" ? "Amount" : "Add"}
          value={logAmount}
          onChange={(e) => setLogAmount(e.target.value)}
          className="w-24 rounded-lg border border-[#c9bfb0] px-2 py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={() => handleLog(Number(logAmount))}
          className="rounded-lg border border-[#1e4f4f]/30 px-3 py-1.5 text-xs font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
        >
          Record progress
        </button>
      </div>
    </div>
  );
}

export function OutcomeGoalsPanel({ hubMode = false }: { hubMode?: boolean }) {
  const [goals, setGoals] = useState<OutcomeGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAllGoals, setShowAllGoals] = useState(false);
  const [statement, setStatement] = useState("");
  const [metric, setMetric] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [deadline, setDeadline] = useState("");
  const [definitionOfDone, setDefinitionOfDone] = useState("");
  const [activeWarning, setActiveWarning] = useState(false);

  function refresh() {
    setGoals(listOutcomeGoals());
  }

  useEffect(() => {
    refresh();
    const sync = () => refresh();
    window.addEventListener(OUTCOME_GOALS_UPDATED, sync);
    return () => window.removeEventListener(OUTCOME_GOALS_UPDATED, sync);
  }, []);

  const primary = getPrimaryOutcomeGoal();
  const secondary = goals.filter((g) => g.id !== primary?.id);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const target = Number(targetValue);
    if (!statement.trim() || !metric.trim() || !deadline || !definitionOfDone.trim()) {
      return;
    }
    if (!Number.isFinite(target) || target <= 0) return;

    if (activeOutcomeCount() >= RECOMMENDED_ACTIVE_OUTCOMES) {
      setActiveWarning(true);
    }

    createOutcomeGoal({
      statement: statement.trim(),
      metric: metric.trim(),
      targetValue: target,
      deadline,
      definitionOfDone: definitionOfDone.trim(),
      supportingActivities: suggestSupportingActivities(statement),
    });
    setStatement("");
    setMetric("");
    setTargetValue("");
    setDeadline("");
    setDefinitionOfDone("");
    setShowForm(false);
    refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm leading-relaxed text-[#6b635a]">
        {hubMode
          ? "Where you are headed — define success here, then choose daily work that supports it."
          : "Outcomes, not tasks. Define what success looks like, then choose daily work that supports it."}
      </p>

      {activeWarning ? (
        <p className="rounded-lg border border-[#e7dfd4] bg-[#faf7f2] px-3 py-2 text-xs text-[#6b635a]">
          Most people make progress faster with {RECOMMENDED_ACTIVE_OUTCOMES}{" "}
          active outcomes in focus. You can pause or remove one anytime.
        </p>
      ) : null}

      {goals.length === 0 && !showForm ? (
        <p className="text-sm text-[#9a8f82]">
          No outcome goals yet — add one when you know what success looks like.
        </p>
      ) : null}

      {primary ? (
        <GoalCard goal={primary} isPrimary onRefresh={refresh} />
      ) : null}

      {hubMode && secondary.length > 0 && !showAllGoals ? (
        <button
          type="button"
          onClick={() => setShowAllGoals(true)}
          className="self-start text-sm font-semibold text-[#1e4f4f] hover:underline"
        >
          {secondary.length} more outcome{secondary.length === 1 ? "" : "s"} →
        </button>
      ) : null}

      {(!hubMode || showAllGoals ? secondary : []).map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          isPrimary={false}
          onRefresh={refresh}
        />
      ))}

      {showForm ? (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-[#d4cdc3] bg-white p-4"
        >
          <p className="text-sm font-semibold text-[#1f1c19]">New outcome goal</p>
          <label className={`mt-3 ${LABEL}`}>
            What does success look like?
            <input
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Sign 5 new clients"
              className={INPUT}
            />
          </label>
          <label className={`mt-3 ${LABEL}`}>
            How will you know it&apos;s done?
            <input
              value={definitionOfDone}
              onChange={(e) => setDefinitionOfDone(e.target.value)}
              placeholder="5 signed clients recorded"
              className={INPUT}
            />
          </label>
          <label className={`mt-3 ${LABEL}`}>
            What are you tracking?
            <input
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              placeholder="Clients"
              className={INPUT}
            />
          </label>
          <label className={`mt-3 ${LABEL}`}>
            Your target
            <input
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="5"
              type="number"
              min={1}
              className={INPUT}
            />
          </label>
          <label className={`mt-3 ${LABEL}`}>
            By when?
            <input
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              type="date"
              className={INPUT}
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163c3c]"
            >
              Save goal
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-[#c9bfb0] px-4 py-2 text-sm font-semibold text-[#6b635a]"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="self-start rounded-lg border border-[#1e4f4f]/30 px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
        >
          + Add outcome goal
        </button>
      )}
    </div>
  );
}
