"use client";

import { useEffect, useMemo, useState } from "react";
import {
  deleteOutcomeGoalProgressEntry,
  getOutcomeGoal,
  listArchivedOutcomeGoals,
  listCompletedOutcomeGoals,
  listOutcomeGoals,
  OUTCOME_GOALS_UPDATED,
  updateOutcomeGoalProgressEntry,
  type OutcomeGoal,
  type OutcomeGoalSubMetric,
} from "@/lib/goals/outcomeGoals";
import {
  collectGoalActivityEntries,
  formatActivityAmount,
  formatActivityTime,
  goalActivitySummary,
  groupActivityByDay,
  miniProgressBar,
  type ActivityTimelineEntry,
} from "@/lib/goals/outcomeGoalActivity";

const CARD_ACTION =
  "rounded-lg border border-[#c9bfb0] px-2 py-1 text-xs font-semibold text-[#6b635a] hover:bg-[#f0f5f5]";

function metricForEntry(goal: OutcomeGoal, entry: ActivityTimelineEntry): OutcomeGoalSubMetric | null {
  return (
    goal.metrics?.find((m) => m.id === entry.metricId) ??
    null
  );
}

function ActivityEntryRow({
  goal,
  entry,
  metric,
  onChanged,
}: {
  goal: OutcomeGoal;
  entry: ActivityTimelineEntry;
  metric: OutcomeGoalSubMetric;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [noteEditing, setNoteEditing] = useState(false);
  const [amount, setAmount] = useState(String(entry.log.amount));
  const [note, setNote] = useState(entry.log.note ?? "");

  function saveAmount() {
    const next = Number(amount);
    if (!Number.isFinite(next) || next === 0) return;
    updateOutcomeGoalProgressEntry(goal.id, entry.metricId, entry.logId, {
      amount: next,
    });
    setEditing(false);
    onChanged();
  }

  function saveNote() {
    updateOutcomeGoalProgressEntry(goal.id, entry.metricId, entry.logId, {
      note: note.trim() || undefined,
    });
    setNoteEditing(false);
    onChanged();
  }

  function toggleMilestone() {
    updateOutcomeGoalProgressEntry(goal.id, entry.metricId, entry.logId, {
      isMilestone: !entry.log.isMilestone,
    });
    onChanged();
  }

  function handleDelete() {
    if (!window.confirm("Delete this activity entry?")) return;
    deleteOutcomeGoalProgressEntry(goal.id, entry.metricId, entry.logId);
    onChanged();
  }

  const amountLabel = formatActivityAmount(metric, entry.log.amount);

  return (
    <li className="rounded-lg border border-[#efe8de] bg-[#faf7f2]/50 px-3 py-2.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#1f1c19]">
            {entry.log.isMilestone ? "🏁 " : null}
            {editing ? (
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-24 rounded border border-[#c9bfb0] px-2 py-0.5 text-sm"
              />
            ) : (
              amountLabel
            )}
            {!editing ? (
              <span className="ml-1 text-xs font-normal text-[#9a8f82]">
                {entry.metricLabel}
              </span>
            ) : null}
          </p>
          {noteEditing ? (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-2 w-full rounded-lg border border-[#c9bfb0] px-2 py-1 text-sm"
              placeholder="What caused this progress?"
            />
          ) : entry.log.note ? (
            <p className="mt-1 text-sm text-[#6b635a]">{entry.log.note}</p>
          ) : null}
          <p className="mt-1 text-xs text-[#9a8f82]">
            {formatActivityTime(entry.log.loggedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {editing ? (
            <>
              <button type="button" onClick={saveAmount} className={CARD_ACTION}>
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className={CARD_ACTION}
              >
                Cancel
              </button>
            </>
          ) : noteEditing ? (
            <>
              <button type="button" onClick={saveNote} className={CARD_ACTION}>
                Save note
              </button>
              <button
                type="button"
                onClick={() => setNoteEditing(false)}
                className={CARD_ACTION}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className={CARD_ACTION}
              >
                Edit
              </button>
              <button type="button" onClick={handleDelete} className={CARD_ACTION}>
                Delete
              </button>
              <button
                type="button"
                onClick={() => setNoteEditing(true)}
                className={CARD_ACTION}
              >
                {entry.log.note ? "Edit note" : "Add note"}
              </button>
              <button
                type="button"
                onClick={toggleMilestone}
                className={CARD_ACTION}
              >
                {entry.log.isMilestone ? "Unmark milestone" : "Mark milestone"}
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

export function OutcomeGoalActivityTab() {
  const [tick, setTick] = useState(0);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(OUTCOME_GOALS_UPDATED, bump);
    return () => window.removeEventListener(OUTCOME_GOALS_UPDATED, bump);
  }, []);

  const goals = useMemo(() => {
    void tick;
    return [
      ...listOutcomeGoals(),
      ...listCompletedOutcomeGoals(),
      ...listArchivedOutcomeGoals(),
    ];
  }, [tick]);

  useEffect(() => {
    if (!selectedGoalId && goals[0]) {
      setSelectedGoalId(goals[0].id);
    }
  }, [goals, selectedGoalId]);

  const goal = selectedGoalId ? getOutcomeGoal(selectedGoalId) : null;
  const summary = goal ? goalActivitySummary(goal) : null;
  const groups = goal
    ? groupActivityByDay(collectGoalActivityEntries(goal))
    : [];

  return (
    <div className="flex flex-col gap-4" data-testid="outcome-goals-activity-tab">
      {goals.length === 0 ? (
        <p className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2] px-4 py-6 text-sm text-[#6b635a]">
          No goals yet. Create a goal on the Goals tab, then your activity will
          appear here.
        </p>
      ) : (
        <>
          <label className="block text-sm font-semibold text-[#1f1c19]">
            Goal
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm"
              data-testid="activity-goal-select"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.statement}
                </option>
              ))}
            </select>
          </label>

          {goal && summary ? (
            <div
              className="rounded-xl border border-[#e7dfd4] bg-white p-4"
              data-testid="activity-goal-header"
            >
              <p className="text-lg font-semibold text-[#1f1c19]">{summary.title}</p>
              <p className="mt-1 text-sm font-bold tabular-nums text-[#1e4f4f]">
                {summary.percent}%
              </p>
              <p
                className="mt-1 font-mono text-xs text-[#9a8f82]"
                aria-hidden
              >
                {miniProgressBar(summary.percent)}
              </p>
              {summary.primaryLabel ? (
                <p className="mt-2 text-sm text-[#6b635a]">{summary.primaryLabel}</p>
              ) : null}
            </div>
          ) : null}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#9a8f82]">
              Activity Timeline
            </h3>
            {groups.length === 0 ? (
              <p className="mt-3 text-sm text-[#6b635a]">
                No activity yet. Record progress from the Goals tab.
              </p>
            ) : (
              <div className="mt-3 space-y-4">
                {groups.map((group) => (
                  <section key={group.sortKey}>
                    <p className="text-sm font-semibold text-[#1f1c19]">
                      {group.label}
                    </p>
                    <ul className="mt-2 flex flex-col gap-2">
                      {group.entries.map((entry) => {
                        const metric = metricForEntry(goal!, entry);
                        if (!metric) return null;
                        return (
                          <ActivityEntryRow
                            key={entry.logId}
                            goal={goal!}
                            entry={entry}
                            metric={metric}
                            onChanged={() => setTick((n) => n + 1)}
                          />
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** @deprecated Use OutcomeGoalActivityTab — re-exported from OutcomeGoalProgressTab.tsx */