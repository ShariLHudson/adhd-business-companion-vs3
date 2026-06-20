"use client";

import { useState } from "react";
import { initialSectionOpen } from "@/lib/expandableUi";

/** Section-level feature explanation — e.g. What Is Kanban? */
export function WorkspaceSectionHelp({
  title,
  bullets,
}: {
  title: string;
  bullets: string[];
}) {
  const [open, setOpen] = useState(initialSectionOpen);

  if (!bullets.length) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/90">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-[#f5f0e8]/80"
        aria-expanded={open}
      >
        <span className="text-sm text-[#6b635a]" aria-hidden>
          {open ? "▼" : "▶"}
        </span>
        <span className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          What Is {title}?
        </span>
      </button>
      {open ? (
        <ul className="list-inside list-disc space-y-1 border-t border-[#e7dfd4]/80 px-4 pb-3 pt-2 text-sm leading-relaxed text-[#4b463f]">
          {bullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
