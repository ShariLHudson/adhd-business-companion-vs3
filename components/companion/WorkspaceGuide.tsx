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
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!guide) return;
    setDismissed(isGuideDismissed(guide.id));
    setOpen(false);
  }, [guide]);

  if (!guide || dismissed) return null;

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-[#1e4f4f]/15 bg-white/85 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-[#9a8f82]" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
        <span className="text-sm font-semibold text-[#1e4f4f]">
          What Is {guide.title}?
        </span>
      </button>
      {open ? (
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
              setDismissed(true);
            }}
            className="mt-3 text-xs font-semibold text-[#9a8f82] underline decoration-[#9a8f82]/40 underline-offset-2 hover:text-[#6b635a]"
          >
            Don&apos;t show this again
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function WorkspaceGuideInline({ guide }: { guide: WorkspaceGuideContent }) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(isGuideDismissed(guide.id));
    setOpen(false);
  }, [guide.id]);

  if (dismissed) return null;

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-[#1e4f4f]/15 bg-white/85 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-[#9a8f82]" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
        <span className="text-sm font-semibold text-[#1e4f4f]">
          What Is {guide.title}?
        </span>
      </button>
      {open ? (
        <div className="border-t border-[#e7dfd4] px-4 py-4 text-sm text-[#4b463f]">
          <p>{guide.what}</p>
          <p className="mt-2">
            <strong>Why:</strong> {guide.why}
          </p>
          <button
            type="button"
            onClick={() => {
              dismissGuide(guide.id);
              setDismissed(true);
            }}
            className="mt-3 text-xs font-semibold text-[#1e4f4f]"
          >
            Got it — hide this
          </button>
        </div>
      ) : null}
    </div>
  );
}
