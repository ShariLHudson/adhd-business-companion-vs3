"use client";

import { useState } from "react";
import {
  recommendGoogleExport,
  type GoogleFileKind,
} from "@/lib/googleWorkspace";

const btn =
  "rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors";
const btnPrimary = `${btn} bg-[#1e4f4f] text-white hover:bg-[#163a3a]`;
const btnSecondary = `${btn} border border-[#1e4f4f]/40 bg-white text-[#1e4f4f] hover:bg-[#f0f5f5]`;

export function ArtifactReadyPanel({
  artifactType,
  title,
  draft,
  onOpenGoogle,
  onCopy,
  onDownloadPdf,
  onEditInCreate,
  onAddToProject,
}: {
  artifactType: string;
  title: string;
  draft: string;
  onOpenGoogle: (kind: GoogleFileKind) => void;
  onCopy: () => void;
  onDownloadPdf: () => void;
  onEditInCreate?: () => void;
  onAddToProject?: () => void;
}) {
  const [loading, setLoading] = useState<GoogleFileKind | null>(null);
  const recommended = recommendGoogleExport(artifactType, draft);

  async function open(kind: GoogleFileKind) {
    setLoading(kind);
    try {
      await onOpenGoogle(kind);
    } finally {
      setLoading(null);
    }
  }

  const label = title.trim() || artifactType;

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[#1e4f4f]/20 bg-gradient-to-b from-[#1e4f4f]/[0.06] to-[#faf7f2] p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
        Ready to export
      </p>
      <h2 className="mt-1 text-2xl font-semibold text-[#1f1c19]">
        Your {artifactType} is ready
      </h2>
      <p className="mt-2 text-base text-[#6b635a]">
        <span className="font-semibold text-[#2d2926]">{label}</span> — choose
        where you&apos;d like to work with it. Google stores and organizes; I
        stay beside you to coach and improve.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => open("doc")}
          className={`${btnPrimary} ${recommended === "doc" ? "ring-2 ring-[#1e4f4f]/40" : ""}`}
        >
          {loading === "doc" ? "Opening…" : "📝 Open in Google Docs"}
        </button>
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => open("sheet")}
          className={`${btnSecondary} ${recommended === "sheet" ? "ring-2 ring-[#1e4f4f]/30" : ""}`}
        >
          {loading === "sheet" ? "Opening…" : "📊 Open in Google Sheets"}
        </button>
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => open("form")}
          className={`${btnSecondary} ${recommended === "form" ? "ring-2 ring-[#1e4f4f]/30" : ""}`}
        >
          {loading === "form" ? "Opening…" : "📋 Open in Google Forms"}
        </button>
        <button type="button" onClick={onDownloadPdf} className={btnSecondary}>
          ⬇ Download PDF
        </button>
        <button type="button" onClick={onCopy} className={btnSecondary}>
          📋 Copy Text
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-[#e7dfd4] pt-4 text-sm">
        {onEditInCreate ? (
          <button
            type="button"
            onClick={onEditInCreate}
            className="font-semibold text-[#1e4f4f] hover:underline"
          >
            ← Edit in Create
          </button>
        ) : null}
        {onAddToProject ? (
          <button
            type="button"
            onClick={onAddToProject}
            className="font-semibold text-[#6b635a] hover:underline"
          >
            Link to a project
          </button>
        ) : null}
      </div>
    </div>
  );
}
