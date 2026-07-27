"use client";

import { useState } from "react";
import type { ResearchSourceCitation } from "@/lib/research/types";

/**
 * Real citations for a source-based finding. Collapsed by default; the member
 * expands to review. This component is only ever rendered by ResearchFindingCard
 * when findingMayShowCitation() is true, so it never displays for interpretation,
 * built-in guidance, or user-provided findings.
 */
export function ResearchSourceList({
  sources,
}: {
  sources: ResearchSourceCitation[];
}) {
  const [open, setOpen] = useState(false); // sources collapsed by default
  if (!sources.length) return null;

  return (
    <div className="mt-2" data-testid="research-source-list">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1 text-xs font-semibold text-[#1e4f4f] hover:underline"
        data-testid="research-sources-toggle"
      >
        <span aria-hidden>{open ? "▾" : "▸"}</span>
        {sources.length === 1 ? "1 source" : `${sources.length} sources`}
      </button>

      {open ? (
        <ul
          className="mt-1.5 flex flex-col gap-1.5"
          data-testid="research-sources-expanded"
        >
          {sources.map((s, i) => {
            const meta = [
              s.publisher ?? null,
              s.publicationDate ? `Published ${s.publicationDate}` : null,
              `Retrieved ${s.retrievalDate.slice(0, 10)}`,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <li
                key={s.url ?? s.sourceId ?? `${s.title}-${i}`}
                className="rounded-md border border-[#1e4f4f]/15 bg-white/70 px-2.5 py-1.5 text-xs text-[#2d2926]"
              >
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-semibold text-[#1e4f4f] hover:underline"
                  >
                    {s.title}
                  </a>
                ) : (
                  <span className="font-semibold">{s.title}</span>
                )}
                <div className="mt-0.5 text-[#6b635a]">{meta}</div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
