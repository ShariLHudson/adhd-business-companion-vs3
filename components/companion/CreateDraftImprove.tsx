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
}: {
  draft: string;
  onApply: (next: string) => void;
  disabled?: boolean;
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
        Improve this draft
      </p>
      <p className="mt-1 text-sm text-[#6b635a]">
        Tell me what to change — I&apos;ll update the draft, not start over.
      </p>

      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="Tell me what you'd like to change."
        disabled={disabled || busy}
        className="mt-3 min-h-[88px] w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f] disabled:opacity-60"
      />

      <button
        type="button"
        disabled={disabled || busy || !instruction.trim() || !draft.trim()}
        onClick={() => updateDraft(instruction)}
        className="mt-3 w-full rounded-xl bg-[#1e4f4f] px-6 py-2.5 text-base font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50 sm:w-auto"
      >
        {busy ? "Updating…" : "Update draft"}
      </button>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-[#6b635a] hover:text-[#1e4f4f]">
          More actions ▼
        </summary>
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
        <p className="mt-2 text-xs text-[#6b635a]">
          Examples: {DRAFT_EDIT_EXAMPLES.join(" · ")}
        </p>
      </details>

      {error && (
        <p className="mt-2 text-sm text-[#a85c4a]">
          Couldn&apos;t update just now — try again.
        </p>
      )}
    </div>
  );
}
