"use client";

import { useEffect, useState } from "react";
import {
  addContentType,
  deleteContentType,
  getCustomContentTypes,
  DEFAULT_CONTENT_TYPES,
} from "@/lib/companionStore";

// Manage the content types the system can generate and remix into. Built-ins
// are fixed; users add their own (e.g. "Podcast outreach email").
export function ContentTypesPanel({
  onGenerate,
}: {
  onGenerate?: (seed: { type?: string; brief?: string }) => void;
}) {
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setCustom(getCustomContentTypes());
  }, []);

  function add() {
    const name = draft.trim();
    if (!name) return;
    setCustom(addContentType(name));
    setDraft("");
  }

  function generate(type: string) {
    onGenerate?.({ type });
  }

  const typeRow = (t: string, removable: boolean) => (
    <div
      key={t}
      className="flex items-center justify-between gap-2 rounded-xl border border-[#d4cdc3] bg-white/85 px-4 py-2.5"
    >
      <span className="text-base font-semibold text-[#1f1c19]">{t}</span>
      <span className="flex items-center gap-1">
        {onGenerate && (
          <button
            type="button"
            onClick={() => generate(t)}
            className="rounded-md px-2.5 py-1 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
          >
            ✨ Generate
          </button>
        )}
        {removable && (
          <button
            type="button"
            onClick={() => setCustom(deleteContentType(t))}
            className="rounded-md px-2.5 py-1 text-sm font-semibold text-[#a85c4a] hover:bg-[#a85c4a]/10"
          >
            Remove
          </button>
        )}
      </span>
    </div>
  );

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      <p className="text-2xl font-semibold text-[#1f1c19]">Content types</p>
      <p className="mt-1 text-base text-[#6b635a]">
        What you can generate and remix into. Add your own — they show up
        everywhere a type is picked.
      </p>

      {/* Add custom */}
      <div className="mt-5 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          placeholder="e.g. Podcast outreach email"
          className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          className="shrink-0 rounded-lg bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
        >
          + Add
        </button>
      </div>

      {custom.length > 0 && (
        <>
          <p className="mt-6 text-sm font-bold uppercase tracking-wide text-[#6b635a]">
            Your types
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {custom.map((t) => typeRow(t, true))}
          </div>
        </>
      )}

      <p className="mt-6 text-sm font-bold uppercase tracking-wide text-[#6b635a]">
        Built-in
      </p>
      <div className="mt-2 flex flex-col gap-2">
        {DEFAULT_CONTENT_TYPES.map((t) => typeRow(t, false))}
      </div>
    </div>
  );
}
