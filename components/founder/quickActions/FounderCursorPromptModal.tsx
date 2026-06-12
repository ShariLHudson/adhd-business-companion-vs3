"use client";

import { FormEvent, useEffect, useId, useMemo, useState } from "react";

import type { FounderWorkspaceItem } from "@/lib/founderWorkspace";
import {
  generateCursorPrompt,
  promptTitleForInput,
  type CursorPromptInput,
  type CursorPromptKind,
} from "@/lib/founderWorkspace/cursorPromptGenerator";
import { saveCursorPrompt } from "@/lib/founderWorkspace/cursorPromptStore";
import {
  type FounderTrackedExperiment,
  type FounderTrackedIssue,
} from "@/lib/founderWorkspace/tracking";

type PickerKind = CursorPromptKind;

type FounderCursorPromptModalProps = {
  open: boolean;
  initialContext?: CursorPromptInput | null;
  projects: FounderWorkspaceItem[];
  issues: FounderTrackedIssue[];
  experiments: FounderTrackedExperiment[];
  onClose: () => void;
  onSaveToNotes?: (title: string, body: string) => void;
};

export function FounderCursorPromptModal({
  open,
  initialContext = null,
  projects,
  issues,
  experiments,
  onClose,
  onSaveToNotes,
}: FounderCursorPromptModalProps) {
  const titleId = useId();
  const [kind, setKind] = useState<PickerKind>("bug_fix");
  const [itemId, setItemId] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSavedMsg(null);
    setExtraNotes("");
    if (initialContext) {
      setKind(initialContext.kind);
      if (initialContext.kind === "bug_fix" || initialContext.kind === "retest") {
        setItemId(initialContext.issue.id);
      } else if (initialContext.kind === "feature") {
        setItemId(initialContext.project.id);
      } else {
        setItemId(initialContext.experiment.id);
      }
      return;
    }
    setKind("bug_fix");
    setItemId(issues[0]?.id ?? projects[0]?.id ?? experiments[0]?.id ?? "");
  }, [open, initialContext, issues, projects, experiments]);

  const context: CursorPromptInput | null = useMemo(() => {
    if (initialContext) return initialContext;
    if (!itemId) return null;
    if (kind === "bug_fix") {
      const issue = issues.find((i) => i.id === itemId);
      return issue ? { kind: "bug_fix", issue } : null;
    }
    if (kind === "retest") {
      const issue = issues.find((i) => i.id === itemId);
      if (!issue) return null;
      const linkedExperiment = experiments.find(
        (e) => e.relatedIssueId === issue.id,
      );
      return { kind: "retest", issue, linkedExperiment };
    }
    if (kind === "feature") {
      const project = projects.find((p) => p.id === itemId);
      return project ? { kind: "feature", project } : null;
    }
    const experiment = experiments.find((e) => e.id === itemId);
    if (!experiment) return null;
    const relatedIssue = experiment.relatedIssueId
      ? issues.find((i) => i.id === experiment.relatedIssueId)
      : undefined;
    return { kind: "experiment", experiment, relatedIssue };
  }, [initialContext, open, kind, itemId, issues, projects, experiments]);

  const preview = useMemo(() => {
    if (!context) return "";
    return generateCursorPrompt(context, extraNotes);
  }, [context, extraNotes]);

  const promptTitle = context ? promptTitleForInput(context) : "Cursor prompt";

  if (!open) return null;

  const options =
    kind === "bug_fix" || kind === "retest"
      ? issues.map((i) => ({ id: i.id, label: i.title }))
      : kind === "feature"
        ? projects.map((p) => ({ id: p.id, label: p.title }))
        : experiments.map((e) => ({ id: e.id, label: e.title }));

  const pickerMode = !initialContext;

  async function copyPrompt() {
    if (!preview) return;
    try {
      await navigator.clipboard.writeText(preview);
      setSavedMsg("Copied to clipboard.");
    } catch {
      window.alert("Could not copy — select text manually.");
    }
  }

  function handleSave() {
    if (!preview || !context) return;
    saveCursorPrompt({
      title: promptTitle,
      kind: context.kind,
      body: preview,
    });
    setSavedMsg("Saved to founder prompt library.");
  }

  function handleSendToNotes() {
    if (!preview || !onSaveToNotes) return;
    onSaveToNotes(promptTitle, preview);
    setSavedMsg("Sent to Notes.");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void copyPrompt();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#d4cdc3] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold text-[#1f1c19]">
          Generate Cursor prompt
        </h2>
        <p className="mt-1 text-xs text-[#6b635a]">Founder-only — not visible to users</p>

        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
          {pickerMode ? (
            <>
              <label className="text-sm">
                <span className="font-medium">Prompt type</span>
                <select
                  value={kind}
                  onChange={(e) => {
                    const next = e.target.value as PickerKind;
                    setKind(next);
                    const list =
                      next === "bug_fix" || next === "retest"
                        ? issues
                        : next === "feature"
                          ? projects
                          : experiments;
                    setItemId(list[0]?.id ?? "");
                  }}
                  className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
                >
                  <option value="bug_fix">Bug fix (issue)</option>
                  <option value="feature">Feature (project)</option>
                  <option value="experiment">Experiment</option>
                  <option value="retest">Retest item</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="font-medium">Select item</span>
                <select
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
                >
                  {options.length === 0 ? (
                    <option value="">No items available</option>
                  ) : (
                    options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))
                  )}
                </select>
              </label>
            </>
          ) : (
            <p className="text-sm font-medium text-[#1e4f4f]">{promptTitle}</p>
          )}

          <label className="text-sm">
            <span className="font-medium">Additional notes (optional)</span>
            <textarea
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
              placeholder="Extra context for Cursor"
            />
          </label>

          {preview ? (
            <label className="text-sm">
              <span className="font-medium">Generated prompt</span>
              <textarea
                readOnly
                value={preview}
                rows={12}
                className="mt-1 w-full rounded-lg border border-[#d4cdc3] bg-[#faf8f5] px-3 py-2 font-mono text-xs"
              />
            </label>
          ) : null}

          {savedMsg ? (
            <p className="text-sm text-[#1e4f4f]">{savedMsg}</p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#d4cdc3] px-4 py-2 text-sm"
            >
              Close
            </button>
            <button
              type="button"
              disabled={!preview}
              onClick={handleSave}
              className="rounded-lg border border-[#1e4f4f] px-4 py-2 text-sm font-medium text-[#1e4f4f] disabled:opacity-50"
            >
              Save
            </button>
            {onSaveToNotes ? (
              <button
                type="button"
                disabled={!preview}
                onClick={handleSendToNotes}
                className="rounded-lg border border-[#1e4f4f] px-4 py-2 text-sm font-medium text-[#1e4f4f] disabled:opacity-50"
              >
                Send to Notes
              </button>
            ) : null}
            <button
              type="submit"
              disabled={!preview}
              className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Copy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
