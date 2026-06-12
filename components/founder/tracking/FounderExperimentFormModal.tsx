"use client";

import { FormEvent, useEffect, useId, useState } from "react";

import {
  EXPERIMENT_STATUSES,
  type FounderTrackedExperiment,
} from "@/lib/founderWorkspace/tracking";
import type { FounderExperimentInput } from "@/lib/founderWorkspace/tracking/store";

type FounderExperimentFormModalProps = {
  open: boolean;
  initial?: FounderTrackedExperiment | null;
  prefill?: Partial<FounderExperimentInput> | null;
  issueOptions: { id: string; title: string }[];
  onClose: () => void;
  onSave: (input: FounderExperimentInput) => void;
};

export function FounderExperimentFormModal({
  open,
  initial,
  prefill,
  issueOptions,
  onClose,
  onSave,
}: FounderExperimentFormModalProps) {
  const titleId = useId();
  const [title, setTitle] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [relatedIssueId, setRelatedIssueId] = useState("");
  const [testPlan, setTestPlan] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [result, setResult] = useState("");
  const [status, setStatus] =
    useState<FounderExperimentInput["status"]>("idea");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title);
      setHypothesis(initial.hypothesis);
      setRelatedIssueId(initial.relatedIssueId ?? "");
      setTestPlan(initial.testPlan);
      setExpectedOutcome(initial.expectedOutcome);
      setResult(initial.result);
      setStatus(initial.status);
      return;
    }
    setTitle(prefill?.title ?? "");
    setHypothesis(prefill?.hypothesis ?? "");
    setRelatedIssueId(prefill?.relatedIssueId ?? "");
    setTestPlan(prefill?.testPlan ?? "");
    setExpectedOutcome(prefill?.expectedOutcome ?? "");
    setResult(prefill?.result ?? "");
    setStatus(prefill?.status ?? "idea");
  }, [open, initial, prefill]);

  if (!open) return null;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    onSave({
      id: initial?.id,
      title,
      hypothesis,
      relatedIssueId: relatedIssueId || undefined,
      testPlan,
      expectedOutcome,
      result,
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
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#d4cdc3] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold text-[#1f1c19]">
          {initial ? "Edit experiment" : "New experiment"}
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
            <span className="font-medium">Hypothesis</span>
            <textarea
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
              required
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Related issue</span>
            <select
              value={relatedIssueId}
              onChange={(e) => setRelatedIssueId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
            >
              <option value="">None</option>
              {issueOptions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium">Test plan</span>
            <textarea
              value={testPlan}
              onChange={(e) => setTestPlan(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Expected outcome</span>
            <textarea
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Result</span>
            <textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2"
            />
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
              {EXPERIMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white">
              Save experiment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
