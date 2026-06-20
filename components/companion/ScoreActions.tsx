"use client";

import { useEffect, useState } from "react";
import { buildGenerationContextWithBusiness } from "@/lib/contentAudience";

type Dimension = { name: string; rating: string; reason: string };
type Assessment = { dimensions: Dimension[]; overall: string };

const RATING: Record<string, { label: string; color: string }> = {
  strong: { label: "Strong", color: "#2e8b57" },
  okay: { label: "Okay", color: "#c08a3e" },
  weak: { label: "Weak", color: "#a85c4a" },
};

// Score & strengthen — a gentle, named-dimension read with reasons and an
// optional one-tap stronger rewrite. Never auto-judges; you ask for it.
export function ScoreActions({
  content,
  kind,
  onApply,
}: {
  content: string;
  kind?: string;
  onApply?: (next: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [a, setA] = useState<Assessment | null>(null);
  const [rewrite, setRewrite] = useState<string | null>(null);
  const [rwBusy, setRwBusy] = useState(false);

  // Whenever the content changes (regenerate, refine, remix, edit, apply), the
  // old score no longer describes it — clear it so it's never stale.
  useEffect(() => {
    setA(null);
    setRewrite(null);
    setError(false);
  }, [content]);

  async function run() {
    if (!content.trim() || busy) return;
    setBusy(true);
    setError(false);
    setA(null);
    setRewrite(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          kind,
          context: buildGenerationContextWithBusiness(),
        }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.dimensions)) setA(data);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  // Separate, on-demand call — reliably returns a full stronger version.
  async function doRewrite() {
    if (!content.trim() || rwBusy) return;
    setRwBusy(true);
    setRewrite(null);
    const focus = a
      ? a.dimensions
          .filter((d) => d.rating !== "strong")
          .map((d) => d.name)
          .join(", ")
      : "";
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          kind,
          mode: "rewrite",
          focus,
          context: buildGenerationContextWithBusiness(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.rewrite) setRewrite(data.rewrite);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setRwBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={!content.trim() || busy}
        onClick={run}
        className="rounded-lg border border-[#1e4f4f]/30 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06] disabled:opacity-50"
      >
        {busy ? "Reading…" : "📊 Score & strengthen"}
      </button>

      {error && (
        <p className="mt-2 text-sm text-[#a85c4a]">
          Couldn&apos;t score it just now — try again.
        </p>
      )}

      {a && (
        <div className="companion-fade-in mt-3 rounded-xl border border-[#1e4f4f]/30 bg-[#1e4f4f]/[0.05] p-3">
          {a.overall && (
            <p className="text-base font-semibold text-[#1f1c19]">{a.overall}</p>
          )}
          <div className="mt-3 flex flex-col gap-2">
            {a.dimensions.map((d, i) => {
              const r = RATING[d.rating] ?? RATING.okay;
              return (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-bold text-white"
                    style={{ background: r.color }}
                  >
                    {r.label}
                  </span>
                  <span className="text-sm leading-relaxed text-[#2d2926]">
                    <span className="font-semibold">{d.name}:</span> {d.reason}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3">
            {!rewrite ? (
              <button
                type="button"
                onClick={doRewrite}
                disabled={rwBusy}
                className="rounded-lg bg-[#1e4f4f] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-60"
              >
                {rwBusy ? "Rewriting…" : "✨ Rewrite stronger"}
              </button>
            ) : (
              <div className="companion-fade-in rounded-lg border border-[#1e4f4f]/30 bg-white p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
                  Stronger version
                </p>
                <p className="mt-1.5 whitespace-pre-wrap text-base leading-relaxed text-[#1f1c19]">
                  {rewrite}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {onApply && (
                    <button
                      type="button"
                      onClick={() => {
                        onApply(rewrite);
                        setA(null);
                        setRewrite(null);
                      }}
                      className="rounded-lg bg-[#1e4f4f] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
                    >
                      Apply
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        void navigator.clipboard?.writeText(rewrite);
                      } catch {
                        /* noop */
                      }
                    }}
                    className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-1.5 text-sm font-semibold text-[#1e4f4f]"
                  >
                    📋 Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => setRewrite(null)}
                    className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#6b635a] hover:bg-black/5"
                  >
                    Hide
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
