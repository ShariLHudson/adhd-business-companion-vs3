"use client";

import { useEffect, useState } from "react";
import {
  dismissGuide,
  getWorkspaceGuide,
  isGuideDismissed,
  type WorkspaceGuideContent,
} from "@/lib/workspaceGuides";

export function WorkspaceGuide({ section }: { section: string }) {
  const guide = getWorkspaceGuide(section);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!guide) return;
    setHidden(isGuideDismissed(guide.id));
    setOpen(!isGuideDismissed(guide.id));
  }, [guide]);

  if (!guide || hidden) return null;

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-[#1e4f4f]/15 bg-white/85 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-[#1e4f4f]">
          What is {guide.title}?
        </span>
        <span className="text-[#9a8f82]" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open && (
        <div className="border-t border-[#e7dfd4] px-4 py-4 text-sm text-[#4b463f]">
          <p>
            <strong className="text-[#1f1c19]">What it is:</strong> {guide.what}
          </p>
          <p className="mt-2">
            <strong className="text-[#1f1c19]">Why use it:</strong> {guide.why}
          </p>
          <p className="mt-2">
            <strong className="text-[#1f1c19]">How it works:</strong> {guide.how}
          </p>
          <p className="mt-2 italic text-[#6b635a]">
            <strong className="not-italic text-[#1f1c19]">Example:</strong>{" "}
            {guide.example}
          </p>
          <button
            type="button"
            onClick={() => {
              dismissGuide(guide.id);
              setHidden(true);
            }}
            className="mt-3 text-xs font-semibold text-[#9a8f82] underline decoration-[#9a8f82]/40 underline-offset-2 hover:text-[#6b635a]"
          >
            Collapse and don&apos;t show again
          </button>
        </div>
      )}
    </div>
  );
}

export function WorkspaceGuideInline({ guide }: { guide: WorkspaceGuideContent }) {
  const [open, setOpen] = useState(!isGuideDismissed(guide.id));
  if (!open) return null;
  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-[#1e4f4f]/15 bg-[#1e4f4f]/[0.04] px-4 py-4 text-sm text-[#4b463f]">
      <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
        {guide.title}
      </p>
      <p className="mt-2">{guide.what}</p>
      <p className="mt-2">
        <strong>Why:</strong> {guide.why}
      </p>
      <button
        type="button"
        onClick={() => {
          dismissGuide(guide.id);
          setOpen(false);
        }}
        className="mt-2 text-xs font-semibold text-[#1e4f4f]"
      >
        Got it
      </button>
    </div>
  );
}
