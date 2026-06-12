"use client";

import { useState } from "react";

import type { FounderWorkspaceItem } from "@/lib/founderWorkspace";
import type { CursorPromptInput } from "@/lib/founderWorkspace/cursorPromptGenerator";
import {
  experimentFromIssue,
  getRetestQueue,
  issueNextStep,
  issueSeverityLabel,
  issueStatusLabel,
  experimentStatusLabel,
  type FounderTrackedExperiment,
  type FounderTrackedIssue,
  type FounderTrackingSection,
} from "@/lib/founderWorkspace/tracking";
import type { FounderIssueStatus } from "@/lib/founderWorkspace/tracking/types";
import type { FounderExperimentInput, FounderIssueInput } from "@/lib/founderWorkspace/tracking/store";
import type { ExperimentMetricRow } from "@/lib/founderWorkspace/experimentMetrics";

import { FounderExperimentFormModal } from "./FounderExperimentFormModal";
import { FounderIssueFormModal } from "./FounderIssueFormModal";

export type IssueStatusFilter = FounderIssueStatus | "all" | "open";

export type FounderTrackingApi = {
  data: {
    issues: FounderTrackedIssue[];
    experiments: FounderTrackedExperiment[];
  };
  upsertIssue: (input: FounderIssueInput) => void;
  upsertExperiment: (input: FounderExperimentInput) => void;
  removeIssue: (id: string) => void;
  removeExperiment: (id: string) => void;
  markReadyForRetest: (id: string) => void;
  retestPass: (id: string) => void;
  retestFail: (id: string) => void;
  createExperimentFromIssue: (issueId: string) => FounderExperimentInput | null;
};

function severityClass(s: FounderTrackedIssue["severity"]): string {
  if (s === "critical") return "bg-[#a85c4a]/20 text-[#a85c4a]";
  if (s === "high") return "bg-[#e0795a]/20 text-[#c9684d]";
  if (s === "medium") return "bg-[#e8c547]/25 text-[#7a5c00]";
  return "bg-[#ebe4d9] text-[#6b635a]";
}

function IssueCard({
  issue,
  linkedExperiment,
  onEdit,
  onToExperiment,
  onMarkRetest,
  onCursorPrompt,
  onDelete,
  showRetestActions,
  onRetestPass,
  onRetestFail,
}: {
  issue: FounderTrackedIssue;
  linkedExperiment?: FounderTrackedExperiment;
  onEdit: () => void;
  onToExperiment: () => void;
  onMarkRetest: () => void;
  onCursorPrompt: () => void;
  onDelete: () => void;
  showRetestActions?: boolean;
  onRetestPass?: () => void;
  onRetestFail?: () => void;
}) {
  const next = issueNextStep(issue, linkedExperiment);
  const btn =
    "rounded-md border border-[#d4cdc3] px-2 py-1 text-[11px] font-medium hover:bg-[#f5f0e8]";

  return (
    <article className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-[#1f1c19]">{issue.title}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${severityClass(issue.severity)}`}
        >
          {issueSeverityLabel(issue.severity)}
        </span>
        <span className="rounded-full bg-[#ebe4d9] px-2 py-0.5 text-[11px] font-medium">
          {issueStatusLabel(issue.status)}
        </span>
      </div>
      {issue.relatedProjectTitle ? (
        <p className="mt-1 text-[11px] text-[#6b635a]">
          Project: {issue.relatedProjectTitle}
        </p>
      ) : null}
      {issue.description ? (
        <p className="mt-2 text-sm text-[#2d2926]">{issue.description}</p>
      ) : null}
      <p className="mt-2 text-xs font-medium text-[#1e4f4f]">Next: {next}</p>
      <p className="mt-1 text-[11px] text-[#6b635a]">
        Updated {new Date(issue.updatedAt).toLocaleString()}
      </p>
      <div className="mt-3 flex flex-wrap gap-2 border-t border-[#ebe4d9] pt-3">
        <button type="button" onClick={onEdit} className={btn}>
          Edit
        </button>
        {!linkedExperiment ? (
          <button type="button" onClick={onToExperiment} className={btn}>
            → Experiment
          </button>
        ) : null}
        {issue.status === "active" ? (
          <button type="button" onClick={onMarkRetest} className={btn}>
            Mark fix ready
          </button>
        ) : null}
        <button type="button" onClick={onCursorPrompt} className={btn}>
          Generate Cursor Prompt
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="ml-auto text-[11px] font-medium text-[#a85c4a] hover:underline"
        >
          Delete
        </button>
      </div>
      {showRetestActions ? (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onRetestPass}
            className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-xs font-semibold text-white"
          >
            Retest pass
          </button>
          <button
            type="button"
            onClick={onRetestFail}
            className="rounded-lg border border-[#d4cdc3] px-3 py-1.5 text-xs font-medium"
          >
            Retest fail
          </button>
        </div>
      ) : null}
    </article>
  );
}

function ExperimentCard({
  experiment,
  relatedIssue,
  metrics,
  onEdit,
  onCursorPrompt,
  onDelete,
}: {
  experiment: FounderTrackedExperiment;
  relatedIssue?: FounderTrackedIssue;
  metrics?: ExperimentMetricRow;
  onEdit: () => void;
  onCursorPrompt: () => void;
  onDelete: () => void;
}) {
  const btn =
    "rounded-md border border-[#d4cdc3] px-2 py-1 text-[11px] font-medium hover:bg-[#f5f0e8]";

  return (
    <article className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-[#1f1c19]">{experiment.title}</h3>
        <span className="rounded-full bg-[#1e4f4f]/12 px-2 py-0.5 text-[11px] font-medium text-[#1e4f4f]">
          {experimentStatusLabel(experiment.status)}
        </span>
      </div>
      {relatedIssue ? (
        <p className="mt-1 text-[11px] text-[#6b635a]">
          Issue: {relatedIssue.title}
        </p>
      ) : null}
      <p className="mt-2 text-sm">
        <span className="font-medium">Hypothesis:</span> {experiment.hypothesis}
      </p>
      {experiment.testPlan ? (
        <p className="mt-1 text-sm text-[#2d2926]">
          <span className="font-medium">Test:</span> {experiment.testPlan}
        </p>
      ) : null}
      {experiment.result ? (
        <p className="mt-1 text-sm text-[#6b635a]">
          <span className="font-medium">Result:</span> {experiment.result}
        </p>
      ) : null}
      {metrics ? (
        <div className="mt-3 grid grid-cols-4 gap-2 rounded-lg bg-[#faf8f5] p-2 text-center text-[11px]">
          <div>
            <p className="text-[#6b635a]">Complete</p>
            <p className="font-semibold text-[#1f1c19]">
              {metrics.completionRate}%
            </p>
          </div>
          <div>
            <p className="text-[#6b635a]">Tasks</p>
            <p className="font-semibold">
              {metrics.tasksCompleted}/{metrics.taskCount}
            </p>
          </div>
          <div>
            <p className="text-[#6b635a]">Time</p>
            <p className="font-semibold">{metrics.timeInvestedMinutes}m</p>
          </div>
          <div>
            <p className="text-[#6b635a]">Tokens</p>
            <p className="font-semibold">{metrics.apiTokens}</p>
          </div>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2 border-t border-[#ebe4d9] pt-3">
        <button type="button" onClick={onEdit} className={btn}>
          Edit
        </button>
        <button type="button" onClick={onCursorPrompt} className={btn}>
          Generate Cursor Prompt
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="ml-auto text-[11px] font-medium text-[#a85c4a] hover:underline"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

function filterIssues(
  issues: FounderTrackedIssue[],
  statusFilter: IssueStatusFilter,
): FounderTrackedIssue[] {
  if (statusFilter === "all") return issues;
  if (statusFilter === "open") {
    return issues.filter((i) => i.status !== "fixed" && i.status !== "parked");
  }
  return issues.filter((i) => i.status === statusFilter);
}

export function FounderTrackingView({
  section,
  projects,
  tracking,
  issueStatusFilter = "open",
  onIssueStatusFilterChange,
  onOpenCursorPrompt,
  experimentMetricsById,
}: {
  section: "issue" | "dev_experiment";
  projects: FounderWorkspaceItem[];
  tracking: FounderTrackingApi;
  issueStatusFilter?: IssueStatusFilter;
  onIssueStatusFilterChange?: (filter: IssueStatusFilter) => void;
  onOpenCursorPrompt: (context: CursorPromptInput) => void;
  experimentMetricsById?: Map<string, ExperimentMetricRow>;
}) {
  const { data } = tracking;

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [experimentModalOpen, setExperimentModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<FounderTrackedIssue | null>(
    null,
  );
  const [editingExperiment, setEditingExperiment] =
    useState<FounderTrackedExperiment | null>(null);
  const [experimentPrefill, setExperimentPrefill] =
    useState<Partial<FounderExperimentInput> | null>(null);

  function experimentForIssue(issueId: string) {
    return data.experiments.find((e) => e.relatedIssueId === issueId);
  }

  function issueForExperiment(exp: FounderTrackedExperiment) {
    return exp.relatedIssueId
      ? data.issues.find((i) => i.id === exp.relatedIssueId)
      : undefined;
  }

  const displayIssues =
    section === "issue" ? filterIssues(data.issues, issueStatusFilter) : [];

  const experiments = section === "dev_experiment" ? data.experiments : [];
  const retestCount = getRetestQueue(data).length;

  return (
    <div className="flex flex-col gap-4">
      {section === "issue" ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setEditingIssue(null);
              setIssueModalOpen(true);
            }}
            className="rounded-lg bg-[#e0795a] px-4 py-2 text-sm font-semibold text-white"
          >
            Add Issue
          </button>
          <label className="flex items-center gap-2 text-xs text-[#6b635a]">
            Status
            <select
              value={issueStatusFilter}
              onChange={(e) =>
                onIssueStatusFilterChange?.(
                  e.target.value as IssueStatusFilter,
                )
              }
              className="rounded-lg border border-[#d4cdc3] px-2 py-1 text-sm text-[#2d2926]"
            >
              <option value="open">Open</option>
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="active">Active</option>
              <option value="retest">Retest</option>
              <option value="fixed">Done</option>
              <option value="parked">Parked</option>
            </select>
          </label>
          {retestCount > 0 && issueStatusFilter !== "retest" ? (
            <button
              type="button"
              onClick={() => onIssueStatusFilterChange?.("retest")}
              className="text-xs font-medium text-[#1e4f4f] hover:underline"
            >
              {retestCount} awaiting retest
            </button>
          ) : null}
        </div>
      ) : null}
      {section === "dev_experiment" ? (
        <button
          type="button"
          onClick={() => {
            setEditingExperiment(null);
            setExperimentPrefill(null);
            setExperimentModalOpen(true);
          }}
          className="w-fit rounded-lg bg-[#e0795a] px-4 py-2 text-sm font-semibold text-white"
        >
          Add Experiment
        </button>
      ) : null}

      {section === "issue" ? (
        displayIssues.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d4cdc3] bg-white/60 p-8 text-center text-sm text-[#6b635a]">
            {issueStatusFilter === "retest"
              ? "No issues in retest status."
              : "No issues match this filter."}
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {displayIssues.map((issue) => (
              <li key={issue.id}>
                <IssueCard
                  issue={issue}
                  linkedExperiment={experimentForIssue(issue.id)}
                  showRetestActions={issue.status === "retest"}
                  onRetestPass={() => tracking.retestPass(issue.id)}
                  onRetestFail={() => tracking.retestFail(issue.id)}
                  onEdit={() => {
                    setEditingIssue(issue);
                    setIssueModalOpen(true);
                  }}
                  onToExperiment={() => {
                    const issueRow = data.issues.find((i) => i.id === issue.id);
                    if (!issueRow) return;
                    if (
                      window.confirm("Turn this issue into an experiment?")
                    ) {
                      tracking.createExperimentFromIssue(issue.id);
                      window.alert(
                        "Experiment created — open Experiments tab to edit.",
                      );
                    }
                  }}
                  onMarkRetest={() => {
                    if (
                      window.confirm(
                        "Mark fix ready and move to Retest queue?",
                      )
                    ) {
                      tracking.markReadyForRetest(issue.id);
                    }
                  }}
                  onCursorPrompt={() =>
                    onOpenCursorPrompt(
                      issue.status === "retest"
                        ? {
                            kind: "retest",
                            issue,
                            linkedExperiment: experimentForIssue(issue.id),
                          }
                        : { kind: "bug_fix", issue },
                    )
                  }
                  onDelete={() => {
                    if (window.confirm("Delete issue?")) {
                      tracking.removeIssue(issue.id);
                    }
                  }}
                />
              </li>
            ))}
          </ul>
        )
      ) : null}

      {section === "dev_experiment" ? (
        experiments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d4cdc3] bg-white/60 p-8 text-center text-sm text-[#6b635a]">
            No experiments yet. Create from an issue or add manually.
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {experiments.map((exp) => (
              <li key={exp.id}>
                <ExperimentCard
                  experiment={exp}
                  relatedIssue={issueForExperiment(exp)}
                  metrics={experimentMetricsById?.get(exp.id)}
                  onEdit={() => {
                    setEditingExperiment(exp);
                    setExperimentPrefill(null);
                    setExperimentModalOpen(true);
                  }}
                  onCursorPrompt={() =>
                    onOpenCursorPrompt({
                      kind: "experiment",
                      experiment: exp,
                      relatedIssue: issueForExperiment(exp),
                    })
                  }
                  onDelete={() => {
                    if (window.confirm("Delete experiment?")) {
                      tracking.removeExperiment(exp.id);
                    }
                  }}
                />
              </li>
            ))}
          </ul>
        )
      ) : null}

      <FounderIssueFormModal
        open={issueModalOpen}
        initial={editingIssue}
        projects={projects}
        onClose={() => setIssueModalOpen(false)}
        onSave={(input) => tracking.upsertIssue(input)}
      />

      <FounderExperimentFormModal
        open={experimentModalOpen}
        initial={editingExperiment}
        prefill={experimentPrefill}
        issueOptions={data.issues.map((i) => ({ id: i.id, title: i.title }))}
        onClose={() => {
          setExperimentModalOpen(false);
          setExperimentPrefill(null);
        }}
        onSave={(input) => tracking.upsertExperiment(input)}
      />
    </div>
  );
}

export function openExperimentPrefillFromIssue(
  issue: FounderTrackedIssue,
): Partial<FounderExperimentInput> {
  return experimentFromIssue(issue);
}
