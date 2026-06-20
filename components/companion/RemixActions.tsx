"use client";

import { useState } from "react";
import {
  createTemplate,
  getContentTypes,
} from "@/lib/companionStore";
import { buildGenerationContextWithBusiness } from "@/lib/contentAudience";

// Remix layer — convert any content into another format. Drop it under any
// block of content. Result previews first; nothing is lost.
export function RemixActions({
  content,
  onApply,
}: {
  content: string;
  onApply?: (next: string) => void;
}) {
  const [types] = useState<string[]>(() => getContentTypes());
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<{ target: string; text: string } | null>(
    null,
  );
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [target, setTarget] = useState("");
  const [other, setOther] = useState("");
  const [saveName, setSaveName] = useState("");

  async function run(target: string) {
    if (!content.trim() || busy) return;
    setBusy(target);
    setResult(null);
    setError(false);
    setSaved(false);
    try {
      const res = await fetch("/api/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          target,
          context: buildGenerationContextWithBusiness(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.result) setResult({ target, text: data.result });
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setBusy(null);
    }
  }

  function saveAsTemplate() {
    if (!result) return;
    createTemplate({
      title: (saveName.trim() || `Remixed → ${result.target}`).slice(0, 80),
      body: result.text,
      category: "content",
      subcategory: result.target,
      status: "saved",
    });
    setSaved(true);
  }

  return (
    <div className="mt-3">
      <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
        Remix into…
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          value={target}
          disabled={!content.trim() || busy !== null}
          onChange={(e) => setTarget(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f] disabled:opacity-50"
        >
          <option value="">Choose a format…</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
          <option value="__other__">Other…</option>
        </select>
        {target === "__other__" && (
          <input
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder="e.g. Newsletter, Blog post"
            className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
          />
        )}
        <button
          type="button"
          disabled={
            busy !== null ||
            !(target === "__other__" ? other.trim() : target)
          }
          onClick={() => run(target === "__other__" ? other.trim() : target)}
          className="shrink-0 rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
        >
          {busy ? "…" : "Remix"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-[#a85c4a]">
          Couldn&apos;t remix just now — try again.
        </p>
      )}

      {result && (
        <div className="companion-fade-in mt-3 rounded-xl border border-[#1e4f4f]/30 bg-[#1e4f4f]/[0.05] p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
            As {result.target}
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-base leading-relaxed text-[#1f1c19]">
            {result.text}
          </p>
          <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder={`Name it (for saving) — default: ${result.target}`}
            className="mt-3 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveAsTemplate}
              disabled={saved}
              className="rounded-lg bg-[#1e4f4f] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-60"
            >
              {saved ? "Saved ✓" : "💾 Save as Template"}
            </button>
            {onApply && (
              <button
                type="button"
                onClick={() => {
                  onApply(result.text);
                  setResult(null);
                }}
                className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-1.5 text-sm font-semibold text-[#1e4f4f]"
              >
                Apply
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                try {
                  void navigator.clipboard?.writeText(result.text);
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
