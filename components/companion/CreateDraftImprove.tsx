"use client";

import { useState } from "react";
import { businessContextSummary } from "@/lib/companionStore";
import {
  DRAFT_EDIT_EXAMPLES,
  DRAFT_QUICK_EDITS,
} from "@/lib/createWorkspaceUx";

export function CreateDraftImprove({
  draft,
  onApply,
  disabled,
  onSave,
  onAddToProject,
  onPrint,
  onGoogleDoc,
}: {
  draft: string;
  onApply: (next: string) => void;
  disabled?: boolean;
  onSave?: () => void;
  onAddToProject?: () => void;
  onPrint?: () => void;
  onGoogleDoc?: () => void;
}) {
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function updateDraft(editInstruction: string) {
    const trimmed = editInstruction.trim();
    if (!trimmed || !draft.trim() || busy) return;
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: draft,
          action: "modify",
          instruction: trimmed,
          context: businessContextSummary(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.result) {
        onApply(data.result);
        setInstruction("");
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  const chip =
    "rounded-full border border-[#1e4f4f]/25 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/8 disabled:opacity-50";

  return (
    <div className="mt-5 rounded-2xl border border-[#d4cdc3] bg-white/70 p-4">
      <p className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
        What would you like to change?
      </p>
      <p className="mt-1 text-sm text-[#6b635a]">
        Pick a quick edit or describe a custom change — I&apos;ll update the draft.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {DRAFT_QUICK_EDITS.map((edit) => (
          <button
            key={edit.id}
            type="button"
            disabled={disabled || busy || !draft.trim()}
            onClick={() => updateDraft(edit.instruction)}
            className={chip}
          >
            {busy ? "…" : edit.label}
          </button>
        ))}
      </div>

      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="Custom change — tell me what you'd like different."
        disabled={disabled || busy}
        className="mt-3 min-h-[72px] w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f] disabled:opacity-60"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled || busy || !instruction.trim() || !draft.trim()}
          onClick={() => updateDraft(instruction)}
          className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
        >
          {busy ? "Updating…" : "Update draft"}
        </button>
        {onSave ? (
          <button
            type="button"
            disabled={disabled || busy}
            onClick={onSave}
            className="rounded-xl border border-[#1e4f4f]/40 bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f4f]"
          >
            Save
          </button>
        ) : null}
        {onAddToProject ? (
          <button
            type="button"
            disabled={disabled || busy}
            onClick={onAddToProject}
            className="rounded-xl border border-[#1e4f4f]/40 bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f4f]"
          >
            Add to project
          </button>
        ) : null}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-[#6b635a] hover:text-[#1e4f4f]">
          More actions ▼
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {onPrint ? (
            <button
              type="button"
              disabled={disabled || busy}
              onClick={onPrint}
              className={chip}
            >
              Print
            </button>
          ) : null}
          {onGoogleDoc ? (
            <button
              type="button"
              disabled={disabled || busy}
              onClick={onGoogleDoc}
              className={chip}
            >
              Google Docs
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-[#6b635a]">
          Examples: {DRAFT_EDIT_EXAMPLES.join(" · ")}
        </p>
      </details>

      {error ? (
        <p className="mt-2 text-sm text-[#a85c4a]">
          Couldn&apos;t update just now — try again.
        </p>
      ) : null}
    </div>
  );
}
