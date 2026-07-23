"use client";

import { useMemo, useState } from "react";
import {
  buildDownloadArtifact,
  destinationCapabilitiesForArtifact,
  detectPrintSupport,
  triggerBrowserDownload,
  type ArtifactDestinationId,
} from "@/lib/artifactDestinations";
import { readDigitalWorkspacePreferences } from "@/lib/connections/digitalWorkspacePreferences";
import type { GoogleFileKind } from "@/lib/googleWorkspace";

const btn =
  "rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors";
const btnPrimary = `${btn} bg-[#1e4f4f] text-white hover:bg-[#163a3a]`;
const btnSecondary = `${btn} border border-[#1e4f4f]/40 bg-white text-[#1e4f4f] hover:bg-[#f0f5f5]`;
const btnDisabled = `${btnSecondary} opacity-55 cursor-not-allowed`;

export function ArtifactReadyPanel({
  artifactType,
  title,
  draft,
  onOpenGoogle,
  onCopy,
  onDownloadPdf,
  onEditInCreate,
  onAddToProject,
  onPrint,
  googleConnected = true,
}: {
  artifactType: string;
  title: string;
  draft: string;
  onOpenGoogle: (kind: GoogleFileKind) => void | Promise<void>;
  onCopy: () => void;
  onDownloadPdf: () => void;
  onEditInCreate?: () => void;
  onAddToProject?: () => void;
  onPrint?: () => void;
  googleConnected?: boolean;
}) {
  const [loading, setLoading] = useState<GoogleFileKind | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const prefs = useMemo(() => readDigitalWorkspacePreferences(), []);
  const printSupport = useMemo(() => detectPrintSupport(), []);
  const caps = useMemo(
    () => destinationCapabilitiesForArtifact(artifactType, draft),
    [artifactType, draft],
  );
  const allowed = useMemo(
    () => new Set<ArtifactDestinationId>(caps.destinations.map((d) => d.id)),
    [caps],
  );

  async function open(kind: GoogleFileKind) {
    setLoading(kind);
    try {
      await onOpenGoogle(kind);
    } finally {
      setLoading(null);
    }
  }

  async function downloadFormat(
    format: "txt" | "md" | "pdf" | "docx" | "csv",
  ) {
    try {
      const artifact = await buildDownloadArtifact({
        title: title || artifactType,
        body: draft,
        format,
      });
      triggerBrowserDownload(artifact);
      setStatus(`Downloaded ${artifact.filename}`);
    } catch {
      setStatus("Couldn't download.");
    }
  }

  function handlePrint() {
    if (!printSupport.supported) {
      setStatus(
        printSupport.reasonUnavailable ??
          "Printing isn’t available here. Download a PDF instead.",
      );
      return;
    }
    if (onPrint) {
      onPrint();
      return;
    }
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) {
      setStatus("Allow pop-ups to print.");
      return;
    }
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    w.document.write(
      `<html><head><title>${esc(title || artifactType)}</title></head>` +
        `<body><pre style="white-space:pre-wrap;font-family:system-ui,sans-serif;font-size:14px;line-height:1.65;padding:28px;">${esc(draft)}</pre></body></html>`,
    );
    w.document.close();
    window.setTimeout(() => w.print(), 300);
  }

  const label = title.trim() || artifactType;
  const show = (id: ArtifactDestinationId) => allowed.has(id);
  const showWord =
    show("microsoft-word") && prefs.documents === "microsoft-word";

  return (
    <div
      className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[#1e4f4f]/20 bg-gradient-to-b from-[#1e4f4f]/[0.06] to-[#faf7f2] p-6"
      data-testid="artifact-ready-panel"
      data-artifact-family={caps.family}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
        Ready to export
      </p>
      <h2 className="mt-1 text-2xl font-semibold text-[#1f1c19]">
        Your {artifactType} is ready
      </h2>
      <p className="mt-2 text-base text-[#6b635a]">
        <span className="font-semibold text-[#2d2926]">{label}</span> — choose
        a destination that fits this kind of work.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {show("google-docs") && googleConnected ? (
          <button
            type="button"
            disabled={Boolean(loading)}
            onClick={() => open("doc")}
            className={btnPrimary}
            data-testid="ready-google-docs"
          >
            {loading === "doc" ? "Opening…" : "📝 Google Docs"}
          </button>
        ) : null}

        {showWord ? (
          <button
            type="button"
            onClick={() => void downloadFormat("docx")}
            className={btnSecondary}
            data-testid="ready-microsoft-word"
          >
            📄 Microsoft Word
          </button>
        ) : null}

        {show("google-sheets") && googleConnected ? (
          <button
            type="button"
            disabled={Boolean(loading)}
            onClick={() => open("sheet")}
            className={btnSecondary}
            data-testid="ready-google-sheets"
          >
            {loading === "sheet" ? "Opening…" : "📊 Google Sheets"}
          </button>
        ) : null}

        {show("google-forms") && googleConnected ? (
          <button
            type="button"
            disabled={Boolean(loading)}
            onClick={() => open("form")}
            className={btnSecondary}
            data-testid="ready-google-forms"
          >
            {loading === "form" ? "Opening…" : "📋 Google Forms"}
          </button>
        ) : null}

        {show("google-calendar") ? (
          <button
            type="button"
            onClick={() => {
              const url =
                "https://calendar.google.com/calendar/render?action=TEMPLATE" +
                `&text=${encodeURIComponent(label)}` +
                `&details=${encodeURIComponent(draft.slice(0, 1500))}`;
              window.open(url, "_blank");
            }}
            className={btnSecondary}
            data-testid="ready-google-calendar"
          >
            📅 Google Calendar
          </button>
        ) : null}

        {show("pdf") ? (
          <button
            type="button"
            onClick={() => {
              void downloadFormat("pdf").then(() => onDownloadPdf());
            }}
            className={btnSecondary}
            data-testid="ready-pdf"
          >
            ⬇ PDF
          </button>
        ) : null}

        {show("print") ? (
          <button
            type="button"
            onClick={handlePrint}
            className={printSupport.supported ? btnSecondary : btnDisabled}
            aria-disabled={!printSupport.supported}
            title={
              printSupport.supported
                ? "Print"
                : (printSupport.reasonUnavailable ?? "Print unavailable")
            }
            data-testid="ready-print"
          >
            {printSupport.supported ? "🖨 Print" : "🖨 Print (unavailable)"}
          </button>
        ) : null}

        {show("download") ? (
          <button
            type="button"
            onClick={() =>
              void downloadFormat(
                caps.defaultDownloadFormat === "pdf"
                  ? "txt"
                  : caps.defaultDownloadFormat,
              )
            }
            className={btnSecondary}
            data-testid="ready-download"
          >
            ⬇ Download
          </button>
        ) : null}

        {show("copy") ? (
          <button type="button" onClick={onCopy} className={btnSecondary}>
            📋 Copy Text
          </button>
        ) : null}
      </div>

      {status ? (
        <p className="mt-3 text-sm font-semibold text-[#1e4f4f]" role="status">
          {status}
        </p>
      ) : null}

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
