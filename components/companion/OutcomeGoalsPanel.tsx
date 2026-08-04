"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CollapsibleSection } from "@/components/companion/CollapsibleSection";
import {
  GoalIntelligencePanel,
  GoalNextBestAction,
} from "@/components/companion/GoalIntelligencePanel";
import { GoalMetricVisualization } from "@/components/companion/GoalMetricVisualization";
import { buildGoalCoachingIntelligence } from "@/lib/goals/goalCoachingIntelligence";
import { initialSectionOpen } from "@/lib/expandableUi";
import { miniProgressBar } from "@/lib/goals/outcomeGoalActivity";
import {
  archiveOutcomeGoal,
  autoCapitalizeGoalTitle,
  completeOutcomeGoal,
  createOutcomeGoal,
  editOutcomeGoal,
  getActiveGoalMetrics,
  getOutcomeGoal,
  getPrimaryGoalMetric,
  goalHealthStatus,
  goalProgressPercent,
  goalSatisfiesCompletionRule,
  lastProgressDate,
  listArchivedOutcomeGoals,
  listCompletedOutcomeGoals,
  listOutcomeGoals,
  OUTCOME_GOAL_HEALTH_LABELS,
  OUTCOME_GOALS_UPDATED,
  OUTCOME_TRACKING_TYPE_PRESETS,
  recordOutcomeGoalProgress,
  type OutcomeGoal,
  type OutcomeGoalSubMetric,
  type OutcomeGoalTrackingTypeId,
} from "@/lib/goals/outcomeGoals";
import { getWorkspaceHelpContent } from "@/lib/workspaceHelpContent";

const INPUT =
  "mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

const LABEL = "block text-sm font-semibold text-[#1f1c19]";

const GOLD_LABEL = "text-xs font-bold uppercase tracking-wide text-[#b45309]";

const CARD_ACTION =
  "rounded-lg border border-[#c9bfb0] px-3 py-1.5 text-sm font-semibold text-[#6b635a] hover:bg-[#f0f5f5]";

const TRACKER_QUICK_ADD: {
  id: OutcomeGoalTrackingTypeId;
  label: string;
}[] = [
  { id: "revenue", label: "Revenue" },
  { id: "leads", label: "Leads" },
  { id: "subscribers", label: "Subscribers" },
  { id: "sales_calls", label: "Sales" },
  { id: "videos", label: "Videos" },
  { id: "chapters", label: "Books" },
  { id: "content_pieces", label: "Content Pieces" },
  { id: "courses", label: "Courses" },
  { id: "weight", label: "Weight" },
  { id: "hours", label: "Hours Studied" },
  { id: "custom", label: "Custom" },
];

const TRACKER_TYPE_OPTIONS = OUTCOME_TRACKING_TYPE_PRESETS.map((p) => ({
  id: p.id,
  label: p.label,
}));

type GoalsListFilter = "active" | "completed" | "archived";

type TrackerDraft = {
  key: string;
  trackingTypeId: OutcomeGoalTrackingTypeId;
  customName: string;
  target: string;
};

function newTrackerDraft(
  trackingTypeId: OutcomeGoalTrackingTypeId = "members",
): TrackerDraft {
  return {
    key: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    trackingTypeId,
    customName: "",
    target: "",
  };
}

function trackerLabel(draft: TrackerDraft): string {
  if (draft.trackingTypeId === "custom") {
    return draft.customName.trim() || "Custom";
  }
  return (
    TRACKER_TYPE_OPTIONS.find((t) => t.id === draft.trackingTypeId)?.label ??
    "Tracker"
  );
}

function formatDeadline(deadline: string): string {
  try {
    return new Date(`${deadline}T12:00:00`).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
    });
  } catch {
    return deadline;
  }
}

function formatProgressDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function lastUpdatedLabel(goal: OutcomeGoal): string {
  const iso = lastProgressDate(goal) ?? goal.updatedAt;
  return formatProgressDate(iso);
}

function healthStatusLabel(goal: OutcomeGoal): string {
  const status = goalHealthStatus(goal);
  if (status === "archived") return "Archived";
  return OUTCOME_GOAL_HEALTH_LABELS[status];
}

function readProgressPrefillOnce(goalId: string): { note?: string } {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem("companion-goal-progress-prefill-v1");
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { note?: string; goalId?: string };
    if (parsed.goalId && parsed.goalId !== goalId) return {};
    sessionStorage.removeItem("companion-goal-progress-prefill-v1");
    return { note: parsed.note };
  } catch {
    return {};
  }
}

function OutcomeGoalsHelp() {
  const [helpOpen, setHelpOpen] = useState(initialSectionOpen);
  const help = getWorkspaceHelpContent("outcome-goals");

  return (
    <CollapsibleSection
      id="outcome-goals-help"
      title="How To Use Outcome Goals"
      open={helpOpen}
      onToggle={(id) => {
        if (id === "outcome-goals-help") setHelpOpen((open) => !open);
      }}
    >
      {help ? (
        <div className="space-y-3 text-sm leading-relaxed text-[#2d2926]">
          <section>
            <p className={GOLD_LABEL}>What this area is</p>
            <p className="mt-1">{help.whatItIs}</p>
          </section>
          <section>
            <p className={GOLD_LABEL}>When to use it</p>
            <p className="mt-1">{help.whenToUse}</p>
          </section>
          <section>
            <p className={GOLD_LABEL}>How it works</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5">
              {help.workflow.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        </div>
      ) : (
        <p className="text-sm text-[#6b635a]">
          Set a clear outcome, record progress as you go, and check Insights when
          you want the full picture.
        </p>
      )}
    </CollapsibleSection>
  );
}

function RecordProgressForm({
  goalId,
  onClose,
  onSaved,
}: {
  goalId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const prefillRef = useRef(readProgressPrefillOnce(goalId));
  const goal = getOutcomeGoal(goalId);
  const metrics = goal ? getActiveGoalMetrics(goal) : [];
  const [metricId, setMetricId] = useState(
    () => goal ? getPrimaryGoalMetric(goal).id : "",
  );
  const [value, setValue] = useState("");
  const [note, setNote] = useState(prefillRef.current.note ?? "");
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!goal) return;
    setMetricId(getPrimaryGoalMetric(goal).id);
  }, [goal]);

  if (!goal) return null;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    const trimmed = value.trim();
    if (!trimmed) {
      setSaveError("Enter a value to record.");
      return;
    }
    const amount = Number(trimmed);
    if (!Number.isFinite(amount)) {
      setSaveError("Enter a valid number.");
      return;
    }
    if (amount === 0) {
      setSaveError("Value cannot be zero.");
      return;
    }
    const updated = recordOutcomeGoalProgress(goalId, {
      metricId,
      delta: amount,
      note: note.trim() || undefined,
      loggedAt: new Date().toISOString(),
    });
    if (!updated) {
      setSaveError("Could not save progress. Try again.");
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <form
      onSubmit={handleSave}
      className="mt-3 rounded-lg border border-[#1e4f4f]/25 bg-[#f0f8f8]/50 p-3"
      data-testid="record-progress-modal"
    >
      {metrics.length > 1 ? (
        <label className={LABEL}>
          Tracker
          <select
            value={metricId}
            onChange={(e) => setMetricId(e.target.value)}
            className={INPUT}
            data-testid="record-progress-metric"
          >
            {metrics.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className={`mt-3 ${LABEL}`}>
        Value
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 500"
          className={INPUT}
          data-testid="record-progress-delta"
        />
      </label>
      <label className={`mt-3 ${LABEL}`}>
        Note <span className="font-normal text-[#9a8f82]">(optional)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className={INPUT}
          data-testid="record-progress-note"
        />
      </label>
      {saveError ? (
        <p className="mt-2 text-sm text-[#a85c4a]" data-testid="record-progress-error">
          {saveError}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#163c3c]"
          data-testid="record-progress-save"
        >
          Save
        </button>
        <button type="button" onClick={onClose} className={CARD_ACTION}>
          Cancel
        </button>
      </div>
    </form>
  );
}

type EditMetricDraft = {
  id: string;
  trackingTypeId: OutcomeGoalTrackingTypeId;
  customName: string;
  target: string;
  isNew?: boolean;
};

function metricToDraft(metric: OutcomeGoalSubMetric): EditMetricDraft {
  return {
    id: metric.id,
    trackingTypeId: metric.trackingTypeId,
    customName: metric.trackingTypeId === "custom" ? metric.label : "",
    target: String(metric.targetValue),
  };
}

function EditGoalForm({
  goalId,
  onClose,
  onSaved,
}: {
  goalId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const goal = getOutcomeGoal(goalId);
  const [title, setTitle] = useState(goal?.statement ?? "");
  const [deadline, setDeadline] = useState(goal?.deadline ?? "");
  const [metrics, setMetrics] = useState<EditMetricDraft[]>(() =>
    goal ? getActiveGoalMetrics(goal).map(metricToDraft) : [],
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!goal) return null;

  function updateMetric(id: string, patch: Partial<EditMetricDraft>) {
    setMetrics((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function removeMetric(id: string) {
    setMetrics((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)));
  }

  function addMetric(trackingTypeId: OutcomeGoalTrackingTypeId) {
    setMetrics((rows) => [
      ...rows,
      {
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        trackingTypeId,
        customName: "",
        target: "",
        isNew: true,
      },
    ]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    if (!title.trim() || !deadline) {
      setSaveError("Title and target date are required.");
      return;
    }

    const existing = getActiveGoalMetrics(goal);
    const nextMetrics: OutcomeGoalSubMetric[] = [];

    for (let i = 0; i < metrics.length; i++) {
      const draft = metrics[i]!;
      const target = Number(draft.target);
      if (!Number.isFinite(target) || target <= 0) {
        setSaveError("Each tracker needs a target greater than zero.");
        return;
      }
      const label = draft.trackingTypeId === "custom"
        ? draft.customName.trim() || "Custom"
        : TRACKER_TYPE_OPTIONS.find((t) => t.id === draft.trackingTypeId)?.label ?? "Tracker";
      const preset = OUTCOME_TRACKING_TYPE_PRESETS.find(
        (p) => p.id === draft.trackingTypeId,
      );
      const prior = existing.find((m) => m.id === draft.id);
      nextMetrics.push({
        id: draft.isNew
          ? `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
          : draft.id,
        label,
        trackingTypeId: draft.trackingTypeId,
        metricKind: preset?.metricKind ?? "count",
        targetValue: target,
        currentValue: prior?.currentValue ?? 0,
        isPrimary: i === 0,
        progressLogs: prior?.progressLogs ?? [],
        archived: false,
      });
    }

    const updated = editOutcomeGoal(goalId, {
      statement: title.trim(),
      deadline,
      metrics: nextMetrics,
      completionRule: nextMetrics.length > 1 ? "all_metrics" : "primary_metric",
    });
    if (!updated) {
      setSaveError("Could not save changes.");
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 rounded-lg border border-[#1e4f4f]/25 bg-[#f0f8f8]/50 p-3"
      data-testid="edit-goal-form"
    >
      <label className={LABEL}>
        Goal title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={INPUT}
          data-testid="edit-goal-title"
        />
      </label>
      <label className={`mt-3 ${LABEL}`}>
        Target date
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className={INPUT}
          data-testid="edit-goal-deadline"
        />
      </label>

      <p className="mt-4 text-sm font-semibold text-[#1f1c19]">Trackers</p>
      <div className="mt-2 space-y-3">
        {metrics.map((row) => (
          <div
            key={row.id}
            className="rounded-lg border border-[#e7dfd4] bg-white p-3"
          >
            <label className={LABEL}>
              Tracker name
              <select
                value={row.trackingTypeId}
                onChange={(e) =>
                  updateMetric(row.id, {
                    trackingTypeId: e.target.value as OutcomeGoalTrackingTypeId,
                  })
                }
                className={INPUT}
              >
                {TRACKER_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            {row.trackingTypeId === "custom" ? (
              <label className={`mt-2 ${LABEL}`}>
                Custom name
                <input
                  value={row.customName}
                  onChange={(e) =>
                    updateMetric(row.id, { customName: e.target.value })
                  }
                  className={INPUT}
                />
              </label>
            ) : null}
            <label className={`mt-2 ${LABEL}`}>
              Target
              <input
                type="number"
                min={1}
                value={row.target}
                onChange={(e) => updateMetric(row.id, { target: e.target.value })}
                className={INPUT}
                data-testid="edit-goal-target"
              />
            </label>
            {metrics.length > 1 ? (
              <button
                type="button"
                onClick={() => removeMetric(row.id)}
                className="mt-2 text-xs font-semibold text-[#a85c4a]"
              >
                Remove tracker
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {TRACKER_QUICK_ADD.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => addMetric(chip.id)}
            className="rounded-full border border-[#c9bfb0] px-2.5 py-1 text-xs font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
          >
            + {chip.label}
          </button>
        ))}
      </div>

      {saveError ? (
        <p className="mt-3 text-sm text-[#a85c4a]">{saveError}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#163c3c]"
          data-testid="edit-goal-save"
        >
          Save
        </button>
        <button type="button" onClick={onClose} className={CARD_ACTION}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function GoalAccordionRow({
  goal,
  readOnly,
  expanded,
  onToggle,
  onRefresh,
  openRecordOnMount,
  onRecordProgressOpened,
}: {
  goal: OutcomeGoal;
  readOnly?: boolean;
  expanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
  openRecordOnMount?: boolean;
  onRecordProgressOpened?: () => void;
}) {
  const [recordOpen, setRecordOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const liveGoal = getOutcomeGoal(goal.id) ?? goal;
  const metrics = getActiveGoalMetrics(liveGoal);
  const coaching = useMemo(
    () => buildGoalCoachingIntelligence(liveGoal),
    [liveGoal],
  );

  useEffect(() => {
    if (openRecordOnMount) {
      setRecordOpen(true);
      onRecordProgressOpened?.();
    }
  }, [openRecordOnMount, onRecordProgressOpened]);

  useEffect(() => {
    if (!expanded) {
      setRecordOpen(false);
      setEditOpen(false);
    }
  }, [expanded]);

  const status = healthStatusLabel(liveGoal);
  const looksComplete =
    (!liveGoal.status || liveGoal.status === "active") &&
    goalSatisfiesCompletionRule(liveGoal);

  return (
    <article
      className="overflow-hidden rounded-xl border border-[#e7dfd4] bg-white"
      data-testid="outcome-goal-card"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-[#faf7f2]/80"
        aria-expanded={expanded}
      >
        <span className="shrink-0 text-sm text-[#9a8f82]" aria-hidden>
          {expanded ? "▼" : "▶"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#1f1c19]">{liveGoal.statement}</p>
          {!expanded ? (
            <>
              <p className="mt-0.5 text-xs text-[#9a8f82]">
                Due {formatDeadline(liveGoal.deadline)} · {status}
              </p>
              <p
                className="mt-1 font-mono text-[10px] leading-none text-[#1e4f4f]/70"
                aria-hidden
              >
                {miniProgressBar(goalProgressPercent(liveGoal))}
              </p>
            </>
          ) : null}
        </div>
      </button>

      {expanded ? (
        <div
          className="border-t border-[#efe8de] px-4 pb-4 pt-3"
          data-testid="outcome-goal-expanded"
        >
          <div className="space-y-1 text-sm text-[#4b463f]">
            <p>
              <span className="font-semibold text-[#1f1c19]">Status: </span>
              {status}
            </p>
            <p>
              <span className="font-semibold text-[#1f1c19]">Due date: </span>
              {formatProgressDate(`${liveGoal.deadline}T12:00:00`)}
            </p>
            <p>
              <span className="font-semibold text-[#1f1c19]">Last updated: </span>
              {lastUpdatedLabel(liveGoal)}
            </p>
          </div>

          <div className="mt-4 space-y-3" data-testid="outcome-progress-snapshot">
            <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
              Trackers
            </p>
            {metrics.map((metric) => (
              <GoalMetricVisualization
                key={metric.id}
                metric={metric}
                changeLabel={coaching.metricChanges[metric.id]?.label}
              />
            ))}
          </div>

          {looksComplete && !readOnly && !recordOpen && !editOpen ? (
            <div
              className="mt-4 rounded-lg border border-[#c5e0e0]/60 bg-[#f0f8f8]/50 px-3 py-2.5"
              data-testid="goal-complete-prompt"
            >
              <p className="text-sm text-[#2a2520]">This goal looks complete.</p>
              <button
                type="button"
                onClick={() => {
                  completeOutcomeGoal(liveGoal.id);
                  onRefresh();
                }}
                className="mt-2 rounded-lg border border-[#1e4f4f]/30 px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
                data-testid="mark-goal-complete-button"
              >
                Mark complete
              </button>
            </div>
          ) : null}

          <GoalNextBestAction action={coaching.nextBestAction} />
          <GoalIntelligencePanel intelligence={coaching} />

          {!readOnly && !recordOpen && !editOpen ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRecordOpen(true)}
                className="rounded-lg border border-[#1e4f4f]/30 px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
                data-testid="record-progress-button"
              >
                Record progress
              </button>
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className={CARD_ACTION}
                data-testid="edit-goal-button"
              >
                Edit goal
              </button>
              <button
                type="button"
                onClick={() => {
                  archiveOutcomeGoal(liveGoal.id);
                  onRefresh();
                }}
                className={CARD_ACTION}
                data-testid="archive-goal-button"
              >
                Archive goal
              </button>
            </div>
          ) : null}

          {!readOnly && editOpen ? (
            <EditGoalForm
              goalId={liveGoal.id}
              onClose={() => setEditOpen(false)}
              onSaved={onRefresh}
            />
          ) : null}

          {!readOnly && recordOpen ? (
            <RecordProgressForm
              goalId={liveGoal.id}
              onClose={() => setRecordOpen(false)}
              onSaved={onRefresh}
            />
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function CreateGoalCard({
  expanded,
  onToggle,
  onCreated,
}: {
  expanded: boolean;
  onToggle: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [trackers, setTrackers] = useState<TrackerDraft[]>([newTrackerDraft()]);
  const [saveError, setSaveError] = useState<string | null>(null);

  function updateTracker(key: string, patch: Partial<TrackerDraft>) {
    setTrackers((rows) =>
      rows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function addTracker(trackingTypeId: OutcomeGoalTrackingTypeId) {
    setTrackers((rows) => [...rows, newTrackerDraft(trackingTypeId)]);
  }

  function removeTracker(key: string) {
    setTrackers((rows) =>
      rows.length <= 1 ? rows : rows.filter((row) => row.key !== key),
    );
  }

  function resetForm() {
    setTitle("");
    setDeadline("");
    setTrackers([newTrackerDraft()]);
    setSaveError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    if (!title.trim() || !deadline) {
      setSaveError("Goal title and target date are required.");
      return;
    }

    const built = trackers.map((draft, i) => {
      const target = Number(draft.target);
      if (!Number.isFinite(target) || target <= 0) return null;
      const label = trackerLabel(draft);
      const preset = OUTCOME_TRACKING_TYPE_PRESETS.find(
        (p) => p.id === draft.trackingTypeId,
      );
      return {
        label,
        trackingTypeId: draft.trackingTypeId,
        metricKind: preset?.metricKind ?? ("count" as const),
        targetValue: target,
        isPrimary: i === 0,
      };
    });

    const metrics = built.filter(Boolean) as NonNullable<(typeof built)[number]>[];
    if (metrics.length === 0) {
      setSaveError("Add at least one tracker with a target.");
      return;
    }

    createOutcomeGoal({
      statement: title.trim(),
      metric: metrics[0]!.label,
      trackingTypeId: metrics[0]!.trackingTypeId,
      metricKind: metrics[0]!.metricKind,
      targetValue: metrics[0]!.targetValue,
      deadline,
      definitionOfDone: `Reach targets for ${title.trim()}`,
      metrics,
      completionRule: metrics.length > 1 ? "all_metrics" : "primary_metric",
    });

    resetForm();
    onCreated();
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="w-full rounded-xl border border-dashed border-[#1e4f4f]/35 bg-[#f0f8f8]/40 px-4 py-4 text-left hover:border-[#1e4f4f]/55 hover:bg-[#f0f8f8]/70"
        data-testid="create-goal-collapsed"
      >
        <p className="text-sm font-semibold text-[#1e4f4f]">➕ New Goal</p>
        <p className="mt-1 text-sm text-[#6b635a]">
          Create a measurable outcome you&apos;d like to achieve.
        </p>
        <span className="mt-3 inline-block rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white">
          Create Goal
        </span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#1e4f4f]/25 bg-[#f0f8f8]/40 p-4"
      data-testid="create-goal-form"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold uppercase tracking-wide text-[#1e4f4f]">
          New Goal
        </p>
        <button
          type="button"
          onClick={onToggle}
          className="text-xs font-semibold text-[#6b635a] hover:text-[#1e4f4f]"
        >
          Collapse
        </button>
      </div>

      <label className={`mt-3 ${LABEL}`}>
        Goal title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Launch Membership"
          className={INPUT}
          data-testid="create-goal-title"
        />
      </label>

      <label className={`mt-3 ${LABEL}`}>
        Target date
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className={INPUT}
          data-testid="create-goal-deadline"
        />
      </label>

      <h3 className="mt-5 text-sm font-semibold text-[#1f1c19]">
        What do you want to measure?
      </h3>

      <div className="mt-2 space-y-3">
        {trackers.map((draft, index) => (
          <div
            key={draft.key}
            className="rounded-lg border border-[#e7dfd4] bg-white p-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
              {index === 0 ? "First tracker" : `Tracker ${index + 1}`}
            </p>
            <label className={`mt-2 ${LABEL}`}>
              Tracker name
              <select
                value={draft.trackingTypeId}
                onChange={(e) =>
                  updateTracker(draft.key, {
                    trackingTypeId: e.target.value as OutcomeGoalTrackingTypeId,
                  })
                }
                className={INPUT}
                data-testid={index === 0 ? "create-goal-type" : undefined}
              >
                {TRACKER_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            {draft.trackingTypeId === "custom" ? (
              <label className={`mt-2 ${LABEL}`}>
                Custom name
                <input
                  value={draft.customName}
                  onChange={(e) =>
                    updateTracker(draft.key, { customName: e.target.value })
                  }
                  placeholder="Anything custom"
                  className={INPUT}
                />
              </label>
            ) : null}
            <label className={`mt-2 ${LABEL}`}>
              Target
              <input
                type="number"
                min={1}
                value={draft.target}
                onChange={(e) =>
                  updateTracker(draft.key, { target: e.target.value })
                }
                placeholder={draft.trackingTypeId === "revenue" ? "10000" : "100"}
                className={INPUT}
                data-testid={index === 0 ? "create-goal-target" : undefined}
              />
            </label>
            {trackers.length > 1 ? (
              <button
                type="button"
                onClick={() => removeTracker(draft.key)}
                className="mt-2 text-xs font-semibold text-[#a85c4a]"
              >
                Remove
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => addTracker("members")}
        className="mt-3 text-sm font-semibold text-[#1e4f4f] hover:underline"
      >
        + Add another tracker
      </button>

      <div className="mt-2 flex flex-wrap gap-2">
        {TRACKER_QUICK_ADD.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => addTracker(chip.id)}
            className="rounded-full border border-[#c9bfb0] px-2.5 py-1 text-xs font-semibold text-[#6b635a] hover:border-[#1e4f4f]/40 hover:text-[#1e4f4f]"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {saveError ? (
        <p className="mt-3 text-sm text-[#a85c4a]">{saveError}</p>
      ) : null}

      <button
        type="submit"
        className="mt-4 rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163c3c]"
        data-testid="create-goal-save"
      >
        Save Goal
      </button>
    </form>
  );
}

function GoalsDashboard({
  activeGoals,
  completedGoals,
  archivedGoals,
  expandedGoalId,
  onToggleGoal,
  onRefresh,
  readOnly,
  autoRecordGoalId,
  onRecordProgressOpened,
}: {
  activeGoals: OutcomeGoal[];
  completedGoals: OutcomeGoal[];
  archivedGoals: OutcomeGoal[];
  expandedGoalId: string | null;
  onToggleGoal: (id: string) => void;
  onRefresh: () => void;
  readOnly?: boolean;
  autoRecordGoalId: string | null;
  onRecordProgressOpened: () => void;
}) {
  const [myGoalsOpen, setMyGoalsOpen] = useState(true);
  const [openSection, setOpenSection] = useState<GoalsListFilter>("active");

  const sections: {
    id: GoalsListFilter;
    title: string;
    goals: OutcomeGoal[];
    readOnly: boolean;
  }[] = [
    { id: "active", title: "Active Goals", goals: activeGoals, readOnly: false },
    {
      id: "completed",
      title: "Completed",
      goals: completedGoals,
      readOnly: true,
    },
    { id: "archived", title: "Archived", goals: archivedGoals, readOnly: true },
  ];

  function toggleSection(id: string) {
    const next = id as GoalsListFilter;
    setOpenSection((current) => (current === next ? current : next));
  }

  return (
    <section className="mt-2">
      <button
        type="button"
        onClick={() => setMyGoalsOpen((open) => !open)}
        className="flex w-full items-center gap-2 rounded-lg py-2 text-left text-sm font-semibold text-[#1f1c19] hover:bg-black/[0.03]"
      >
        <span aria-hidden>{myGoalsOpen ? "▼" : "▶"}</span>
        My Goals
      </button>

      {myGoalsOpen ? (
        <div className="mt-1 space-y-1 pl-1">
          {sections.map((section) => (
            <CollapsibleSection
              key={section.id}
              id={`goals-${section.id}`}
              title={`${section.title} (${section.goals.length})`}
              open={openSection === section.id}
              onToggle={() => toggleSection(section.id)}
            >
              {section.goals.length === 0 ? (
                <p
                  className="py-2 text-sm text-[#9a8f82]"
                  data-testid="growth-section-empty"
                >
                  {section.id === "active"
                    ? "No active goals yet."
                    : section.id === "completed"
                      ? "No completed goals yet."
                      : "No archived goals."}
                </p>
              ) : (
                <div className="flex flex-col gap-2 py-1">
                  {section.goals.map((goal) => (
                    <GoalAccordionRow
                      key={goal.id}
                      goal={goal}
                      readOnly={section.readOnly || readOnly}
                      expanded={expandedGoalId === goal.id}
                      onToggle={() => onToggleGoal(goal.id)}
                      onRefresh={onRefresh}
                      openRecordOnMount={autoRecordGoalId === goal.id}
                      onRecordProgressOpened={onRecordProgressOpened}
                    />
                  ))}
                </div>
              )}
            </CollapsibleSection>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function OutcomeGoalsPanel({ hubMode = false }: { hubMode?: boolean }) {
  const [tick, setTick] = useState(0);
  const [createExpanded, setCreateExpanded] = useState(false);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [autoRecordGoalId, setAutoRecordGoalId] = useState<string | null>(
    () => {
      if (typeof window === "undefined") return null;
      try {
        const raw = sessionStorage.getItem("companion-goal-progress-prefill-v1");
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { goalId?: string };
        return parsed.goalId ?? null;
      } catch {
        return null;
      }
    },
  );

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const sync = () => refresh();
    window.addEventListener(OUTCOME_GOALS_UPDATED, sync);
    return () => window.removeEventListener(OUTCOME_GOALS_UPDATED, sync);
  }, [refresh]);

  useEffect(() => {
    if (autoRecordGoalId) {
      setExpandedGoalId(autoRecordGoalId);
    }
  }, [autoRecordGoalId]);

  const activeGoals = useMemo(() => {
    void tick;
    return listOutcomeGoals();
  }, [tick]);
  const completedGoals = useMemo(() => {
    void tick;
    return listCompletedOutcomeGoals();
  }, [tick]);
  const archivedGoals = useMemo(() => {
    void tick;
    return listArchivedOutcomeGoals();
  }, [tick]);

  function handleGoalCreated() {
    setCreateExpanded(false);
    refresh();
  }

  function toggleGoal(id: string) {
    setExpandedGoalId((current) => (current === id ? null : id));
  }

  return (
    <div className="flex flex-col gap-4" data-testid="outcome-goals-panel">
      {!hubMode ? <OutcomeGoalsHelp /> : null}

      <CreateGoalCard
        expanded={createExpanded}
        onToggle={() => setCreateExpanded((open) => !open)}
        onCreated={handleGoalCreated}
      />

      <GoalsDashboard
        activeGoals={activeGoals}
        completedGoals={completedGoals}
        archivedGoals={archivedGoals}
        expandedGoalId={expandedGoalId}
        onToggleGoal={toggleGoal}
        onRefresh={refresh}
        autoRecordGoalId={autoRecordGoalId}
        onRecordProgressOpened={() => setAutoRecordGoalId(null)}
      />
    </div>
  );
}
