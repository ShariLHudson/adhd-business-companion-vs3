"use client";

import { useEffect, useMemo, useState } from "react";
import { searchHowDoI, type HowDoIEntry } from "@/lib/howDoIContent";
import type { AppSection } from "@/lib/companionUi";
import { WorkspaceGuide } from "@/components/companion/WorkspaceGuide";

export function HowDoIPanel({
  onOpen,
  onAsk,
  registerBack,
}: {
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
  registerBack?: (fn: (() => boolean) | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<HowDoIEntry | null>(null);

  const results = useMemo(() => searchHowDoI(query), [query]);

  useEffect(() => {
    registerBack?.(() => {
      if (selected) {
        setSelected(null);
        return true;
      }
      return false;
    });
    return () => registerBack?.(null);
  }, [registerBack, selected]);

  if (selected) {
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ How Do I
        </button>
        <p className="mt-3 text-xl font-semibold text-[#1f1c19]">
          {selected.question}
        </p>
        <p className="mt-3 text-base leading-relaxed text-[#4b463f]">
          {selected.answer}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {selected.openSection ? (
            <button
              type="button"
              onClick={() => onOpen?.(selected.openSection!)}
              className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
            >
              Open {selected.openSection === "energy" ? "Adjust My Day" : "it"}
            </button>
          ) : null}
          {selected.askPrompt && onAsk ? (
            <button
              type="button"
              onClick={() => onAsk(selected.askPrompt!)}
              className="rounded-xl border border-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
            >
              Ask Shari
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
      <WorkspaceGuide section="how-do-i" />
      <p className="text-2xl font-semibold text-[#1f1c19]">How Do I…</p>
      <p className="mt-1 text-base text-[#6b635a]">
        Search for how something works — we&apos;ll show matching answers only.
      </p>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search — plan my day, focus, projects…"
        className="mt-4 w-full rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base outline-none focus:border-[#1e4f4f]"
      />
      <ul className="mt-4 flex flex-col gap-2">
        {results.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => setSelected(entry)}
              className="w-full rounded-xl border border-[#d4cdc3] bg-white/90 px-4 py-3 text-left text-base font-medium text-[#1f1c19] hover:border-[#1e4f4f]/40"
            >
              {entry.question}
            </button>
          </li>
        ))}
        {results.length === 0 ? (
          <li className="text-sm text-[#6b635a]">
            {!query.trim()
              ? "Type a search to see matching topics."
              : "No match — try chat: “How do I…”"}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
