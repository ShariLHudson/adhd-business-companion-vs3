"use client";

import { useState, type ReactNode } from "react";

export function FounderIntelligencePanels({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
            Intelligence Panels
          </h2>
          <p className="mt-0.5 text-xs text-[#6b635a]">
            Skimmable founder view — expand when you want detail.
          </p>
        </div>
        <span className="text-sm text-[#1e4f4f]">{open ? "−" : "+"}</span>
      </button>
      {open ? <div className="flex flex-col gap-4 border-t border-[#ebe4d9] p-4">{children}</div> : null}
    </section>
  );
}
