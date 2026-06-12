"use client";

import type { GoogleWorkspaceSession } from "@/lib/googleWorkspace";
import { googleWorkspaceTitle } from "@/lib/googleWorkspace";

const btn =
  "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors";
const btnSecondary = `${btn} border border-[#1e4f4f]/40 bg-white text-[#1e4f4f] hover:bg-[#f0f5f5]`;
const btnPrimary = `${btn} bg-[#1e4f4f] text-white hover:bg-[#163a3a]`;

export function GoogleWorkspacePanel({
  session,
  onOpenExternal,
  onBackToCreate,
  onCopy,
  onPrintPdf,
}: {
  session: GoogleWorkspaceSession;
  onOpenExternal?: () => void;
  onBackToCreate?: () => void;
  onCopy?: () => void;
  onPrintPdf?: () => void;
}) {
  const surface = googleWorkspaceTitle(session.kind);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="sticky top-0 z-20 shrink-0 border-b border-[#1e4f4f]/15 bg-[#faf7f2]/98 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
              {session.artifactType} · {surface}
            </p>
            <h2 className="truncate text-lg font-semibold text-[#1f1c19]">
              {session.title}
            </h2>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-[#1e4f4f]">
              In Google
            </p>
          </div>
        </div>
        <p className="mt-2 text-sm text-[#6b635a]">
          Chat on the left — tell me what to add, change, or move.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {onOpenExternal ? (
            <button type="button" onClick={onOpenExternal} className={btnPrimary}>
              Open in {surface}
            </button>
          ) : null}
          {onCopy ? (
            <button type="button" onClick={onCopy} className={btnSecondary}>
              Copy
            </button>
          ) : null}
          {onPrintPdf ? (
            <button type="button" onClick={onPrintPdf} className={btnSecondary}>
              Print / PDF
            </button>
          ) : null}
          {onBackToCreate ? (
            <button
              type="button"
              onClick={onBackToCreate}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#6b635a] hover:underline"
            >
              Edit in Create
            </button>
          ) : null}
        </div>
      </div>
      <div className="relative min-h-0 flex-1 bg-white">
        <iframe
          title={session.title}
          src={session.embedUrl}
          className="absolute inset-0 h-full w-full border-0"
          allow="clipboard-write"
        />
      </div>
    </div>
  );
}
