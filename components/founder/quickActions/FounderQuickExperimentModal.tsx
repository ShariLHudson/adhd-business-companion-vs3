"use client";

import { FormEvent, useEffect, useId, useState } from "react";

import type { FounderWorkspaceItem } from "@/lib/founderWorkspace";
import type { FounderExperimentInput } from "@/lib/founderWorkspace/tracking/store";

const QUICK_STATUSES: {
  value: FounderExperimentInput["status"];
  label: string;
}[] = [
  { value: "idea", label: "Planned" },
  { value: "testing", label: "Running" },
  { value: "successful", label: "Completed" },
];

type FounderQuickExperimentModalProps = {
  open: boolean;
  projects: FounderWorkspaceItem[];
  onClose: () => void;
  onSave: (input: FounderExperimentInput) => void;
};

export function FounderQuickExperimentModal({
  open,
  projects,
  onClose,
  onSave,
}: FounderQuickExperimentModalProps) {
  const titleId = useId();
  const [title, setTitle] = useState("");
  const [relatedProjectId, setRelatedProjectId] = useState("");
  const [status, setStatus] = useState<FounderExperimentInput["status"]>("idea");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setRelatedProjectId("");
    setStatus("idea");
    setNotes("");
  }, [open]);

  if (!open) return null;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const project = projects.find((p) => p.id === relatedProjectId);
    onSave({
      title,
      hypothesis: notes.trim() || `Test: ${title}`,
      relatedProjectId: relatedProjectId || undefined,
      relatedProjectTitle: project?.title,
      testPlan: notes.trim() ? `Steps: ${notes}` : "",
      expectedOutcome: "",
      result: "",
      status,
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
        className="w-full max-w-md rounded-2xl border border-[#d4cdc3] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold text-[#1f1c19]">
          Add new experiment
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
            <span className="font-medium">Related project (optional)</span>
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
            <span className="font-medium">Status</span>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as FounderExperimentInput["status"])
              }
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
            >
              {QUICK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
              placeholder="Hypothesis, test plan, or what you want to try"
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
              Save experiment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
