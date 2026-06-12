"use client";

import { FormEvent, useEffect, useId, useState } from "react";

import type { FounderWorkspaceItem } from "@/lib/founderWorkspace";
import {
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  type FounderIssueSource,
  type FounderTrackedIssue,
} from "@/lib/founderWorkspace/tracking";
import type { FounderIssueInput } from "@/lib/founderWorkspace/tracking/store";

type FounderIssueFormModalProps = {
  open: boolean;
  initial?: FounderTrackedIssue | null;
  projects: FounderWorkspaceItem[];
  onClose: () => void;
  onSave: (input: FounderIssueInput) => void;
};

export function FounderIssueFormModal({
  open,
  initial,
  projects,
  onClose,
  onSave,
}: FounderIssueFormModalProps) {
  const titleId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] =
    useState<FounderIssueInput["severity"]>("medium");
  const [status, setStatus] = useState<FounderIssueInput["status"]>("new");
  const [source, setSource] = useState<FounderIssueSource>("testing");
  const [relatedProjectId, setRelatedProjectId] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [currentBehavior, setCurrentBehavior] = useState("");
  const [likelyFiles, setLikelyFiles] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description);
      setSeverity(initial.severity);
      setStatus(initial.status);
      setSource(initial.source);
      setRelatedProjectId(initial.relatedProjectId ?? "");
      setExpectedBehavior(initial.expectedBehavior ?? "");
      setCurrentBehavior(initial.currentBehavior ?? "");
      setLikelyFiles(initial.likelyFiles ?? "");
      return;
    }
    setTitle("");
    setDescription("");
    setSeverity("medium");
    setStatus("new");
    setSource("testing");
    setRelatedProjectId("");
    setExpectedBehavior("");
    setCurrentBehavior("");
    setLikelyFiles("");
  }, [open, initial]);

  if (!open) return null;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const project = projects.find((p) => p.id === relatedProjectId);
    onSave({
      id: initial?.id,
      title,
      description,
      severity,
      status,
      source,
      relatedProjectId: relatedProjectId || undefined,
      relatedProjectTitle: project?.title,
      screenshots: initial?.screenshots ?? [],
      expectedBehavior,
      currentBehavior,
      likelyFiles,
    });
    onClose();
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
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#d4cdc3] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold text-[#1f1c19]">
          {initial ? "Edit issue" : "New issue"}
        </h2>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
          <label className="text-sm">
            <span className="font-medium">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
              required
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="font-medium">Severity</span>
              <select
                value={severity}
                onChange={(e) =>
                  setSeverity(e.target.value as FounderIssueInput["severity"])
                }
                className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
              >
                {ISSUE_SEVERITIES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="font-medium">Status</span>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as FounderIssueInput["status"])
                }
                className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
              >
                {ISSUE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="text-sm">
            <span className="font-medium">Related project</span>
            <select
              value={relatedProjectId}
              onChange={(e) => setRelatedProjectId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
            >
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium">Current behavior</span>
            <textarea
              value={currentBehavior}
              onChange={(e) => setCurrentBehavior(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Expected behavior</span>
            <textarea
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Files likely involved</span>
            <input
              value={likelyFiles}
              onChange={(e) => setLikelyFiles(e.target.value)}
              placeholder="e.g. app/companion/page.tsx, lib/workspaceExecution.ts"
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#d4cdc3] px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white"
            >
              Save issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
