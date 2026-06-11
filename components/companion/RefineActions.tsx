"use client";

import { useState } from "react";
import { businessContextSummary } from "@/lib/companionStore";

// The editing / help layer. Drop it under any editable text: refine, rewrite,
// simplify, or break it down. The result previews first — nothing changes until
// the user taps Apply, so nothing is ever lost.
type Action = "refine" | "rewrite" | "simplify" | "break-down";

const ACTIONS: { id: Action; label: string; emoji: string }[] = [
  { id: "refine", label: "Refine", emoji: "✨" },
  { id: "rewrite", label: "Rewrite", emoji: "🔄" },
  { id: "simplify", label: "Simplify", emoji: "🪶" },
  { id: "break-down", label: "Break down", emoji: "🔨" },
];

export function RefineActions({
  text,
  onApply,
}: {
  text: string;
  onApply: (next: string) => void;
}) {
  const [busy, setBusy] = useState<Action | null>(null);
  const [result, setResult] = useState<{ action: Action; text: string } | null>(
    null,
  );
  const [error, setError] = useState(false);

  async function run(action: Action) {
    if (!text.trim() || busy) return;
    setBusy(action);
    setResult(null);
    setError(false);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          action,
          context: businessContextSummary(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.result) {
        setResult({ action, text: data.result });
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setBusy(null);
    }
  }

  const label = (a: Action) => ACTIONS.find((x) => x.id === a)?.label ?? a;

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={!text.trim() || busy !== null}
            onClick={() => run(a.id)}
            className="rounded-lg border border-[#1e4f4f]/30 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06] disabled:opacity-50"
          >
            {busy === a.id ? "…" : `${a.emoji} ${a.label}`}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-2 text-sm text-[#a85c4a]">
          Couldn&apos;t do that just now — try again.
        </p>
      )}

      {result && (
        <div className="companion-fade-in mt-3 rounded-xl border border-[#1e4f4f]/30 bg-[#1e4f4f]/[0.05] p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
            {label(result.action)} preview
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-base leading-relaxed text-[#1f1c19]">
            {result.text}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                onApply(result.text);
                setResult(null);
              }}
              className="rounded-lg bg-[#1e4f4f] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#6b635a] hover:bg-black/5"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
