"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import { getPrefs } from "@/lib/companionStore";
import { isProposalArtifact } from "@/lib/artifactType";
import {
  buildDownloadArtifact,
  detectPrintSupport,
  destinationCapabilitiesForArtifact,
  triggerBrowserDownload,
  type ArtifactDestinationFormat,
  type ArtifactDestinationId,
} from "@/lib/artifactDestinations";
import { readDigitalWorkspacePreferences } from "@/lib/connections/digitalWorkspacePreferences";
import {
  formConversionOffer,
  googleFailureReceipt,
  googleReceiptForKind,
  isGoogleCreateSuccess,
  saveReceipt,
  shouldShowGoogleExportButtons,
} from "@/lib/saveExportTrust";

// Send a finished piece where it's going: copy, print, push to a new Google
// Doc, download, or copy-and-open the right social network to paste into.
// Uses the user's saved profile URLs (Settings → Profile → Online Presence) when present.
const SOCIAL_META = [
  { name: "Facebook", fallback: "https://www.facebook.com/", color: "#1877f2" },
  { name: "Instagram", fallback: "https://www.instagram.com/", color: "#c13584" },
  {
    name: "LinkedIn",
    fallback: "https://www.linkedin.com/feed/?shareActive=true",
    color: "#0a66c2",
  },
  { name: "TikTok", fallback: "https://www.tiktok.com/", color: "#010101" },
  { name: "Pinterest", fallback: "https://www.pinterest.com/", color: "#e60023" },
];

function esc(s: string | null | undefined) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function ExportActions({
  text,
  content,
  title,
  social,
  artifactType,
  variant = "default",
  docButtonRef,
  printButtonRef,
  onGoogleDocCreated,
  onPrint,
  onBeforeAction,
  embedInPanel = false,
  compact = false,
}: {
  text?: string;
  /** Alias for `text` — some callers historically passed `content`. */
  content?: string;
  title?: string;
  social?: boolean;
  artifactType?: string;
  variant?: "default" | "proposal" | "workspace";
  docButtonRef?: RefObject<HTMLButtonElement | null>;
  printButtonRef?: RefObject<HTMLButtonElement | null>;
  onGoogleDocCreated?: (
    url: string,
    docId?: string,
    kind?: "doc" | "sheet" | "form",
  ) => void;
  onPrint?: () => void;
  onBeforeAction?: () => string | null;
  /** When true, do not open a new browser tab — parent embeds in workspace panel. */
  embedInPanel?: boolean;
  compact?: boolean;
}) {
  const bodyText = String(text ?? content ?? "");
  const [flash, setFlash] = useState<string | null>(null);
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);
  const [googleConfigured, setGoogleConfigured] = useState<boolean | null>(null);
  const workspaceMode = variant === "workspace" || variant === "proposal";
  const proposalMode =
    workspaceMode || isProposalArtifact(artifactType ?? title);
  const printSupport = useMemo(() => detectPrintSupport(), []);
  const workspacePrefs = useMemo(() => readDigitalWorkspacePreferences(), []);
  const caps = useMemo(
    () =>
      destinationCapabilitiesForArtifact(
        artifactType ?? title ?? "Document",
        bodyText,
      ),
    [artifactType, title, bodyText],
  );
  const allowed = useMemo(() => {
    const set = new Set<ArtifactDestinationId>(
      caps.destinations.map((d) => d.id),
    );
    return set;
  }, [caps]);
  const showDest = (id: ArtifactDestinationId) => allowed.has(id);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/google/status")
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) {
          setGoogleConnected(Boolean(j.connected));
          setGoogleConfigured(j.configured !== false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGoogleConnected(false);
          setGoogleConfigured(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function note(m: string) {
    setFlash(m);
    window.setTimeout(() => setFlash(null), 2600);
  }

  // Resolve each network to the user's saved URL (or a sensible fallback).
  const prefs = getPrefs();
  const savedUrl: Record<string, string> = {
    Facebook: prefs.facebookUrl,
    Instagram: prefs.instagramUrl,
    LinkedIn: prefs.linkedinUrl,
    TikTok: prefs.tiktokUrl,
    Pinterest: prefs.pinterestUrl,
  };
  const social_list = SOCIAL_META.map((s) => ({
    name: s.name,
    color: s.color,
    url: savedUrl[s.name]?.trim() || s.fallback,
  }));

  async function clip(): Promise<boolean> {
    try {
      await navigator.clipboard?.writeText(bodyText);
      return true;
    } catch {
      return false;
    }
  }

  async function copy() {
    const ok = await clip();
    if (ok) {
      void import("@/lib/ecosystem/eventTrackingEngine").then(({ trackEcosystemEvent }) => {
        trackEcosystemEvent({
          eventType: "document.copy_used",
          feature: "documents",
          metadata: { artifactType: artifactType ?? title ?? "content" },
        });
      });
    }
    note(ok ? "Copied ✓" : "Select and copy manually.");
  }

  function print() {
    const block = onBeforeAction?.();
    if (block) {
      note(block);
      return;
    }
    if (!printSupport.supported) {
      note(
        printSupport.reasonUnavailable ??
          "Printing isn’t available here. Download a PDF instead.",
      );
      return;
    }
    if (!bodyText.trim()) {
      note("Add some content before printing.");
      return;
    }
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) {
      note("Allow pop-ups to print.");
      return;
    }
    w.document.write(
      `<html><head><title>${esc(title || "Content")}</title></head>` +
        `<body><pre style="white-space:pre-wrap;font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.65;padding:28px;color:#1f1c19;">${esc(bodyText)}</pre></body></html>`,
    );
    w.document.close();
    w.focus();
    window.setTimeout(() => w.print(), 300);
    onPrint?.();
    if (workspaceMode) note("Opening print…");
  }

  async function downloadAs(format: ArtifactDestinationFormat) {
    const block = onBeforeAction?.();
    if (block) {
      note(block);
      return;
    }
    if (!bodyText.trim()) {
      note("Add some content before downloading.");
      return;
    }
    try {
      const artifact = await buildDownloadArtifact({
        title: title || "Content",
        body: bodyText,
        format,
      });
      triggerBrowserDownload(artifact);
      note(
        format === "pdf"
          ? "Downloaded PDF — open it in a PDF reader."
          : format === "docx"
            ? "Downloaded Word document."
            : `Downloaded ${artifact.filename}`,
      );
    } catch {
      note("Couldn't download.");
    }
  }

  async function googleFile(kind: "doc" | "sheet" | "form", forceExport = false) {
    const block = onBeforeAction?.();
    if (block) {
      note(block);
      return;
    }
    if (!bodyText.trim()) {
      note("Add some content before exporting.");
      return;
    }
    if (!shouldShowGoogleExportButtons(googleConfigured, googleConnected)) {
      note(
        "Google isn't connected yet — connect in Settings. Your work stays saved here.",
      );
      return;
    }
    try {
      const r = await fetch("/api/google/create-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Content",
          content: bodyText,
          kind,
          forceExport,
        }),
      });
      const j = (await r.json()) as {
        url?: string;
        id?: string;
        error?: string;
        message?: string;
      };

      if (r.status === 422 && j.error === "not-form-friendly") {
        note(formConversionOffer());
        return;
      }

      if (isGoogleCreateSuccess(r.status, j)) {
        if (!embedInPanel) {
          window.open(j.url, "_blank");
        }
        onGoogleDocCreated?.(j.url, j.id, kind);
        void import("@/lib/ecosystem/eventTrackingEngine").then(({ trackEcosystemEvent }) => {
          trackEcosystemEvent({
            eventType:
              kind === "sheet"
                ? "document.google_sheet_created"
                : kind === "form"
                  ? "document.google_form_created"
                  : "document.google_doc_created",
            feature: "documents",
            metadata: {
              documentId: j.id,
              artifactType: artifactType ?? title ?? kind,
            },
          });
        });
        note(googleReceiptForKind(kind));
        return;
      }

      if (r.status === 401) {
        note(
          "Google isn't connected yet — connect in Settings. Your work stays saved here.",
        );
        return;
      }

      note(googleFailureReceipt(kind));
    } catch {
      note(saveReceipt("export-fail"));
    }
  }

  function calendar() {
    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(title || "Post / content")}` +
      `&details=${encodeURIComponent(bodyText.slice(0, 1500))}`;
    window.open(url, "_blank");
    note("Opened Google Calendar — pick a time and save.");
  }

  async function toSocial(name: string, url: string) {
    const ok = await clip();
    window.open(url, "_blank");
    note(ok ? `Copied — paste into ${name}` : `Opened ${name} — copy your text in.`);
  }

  const btn =
    "rounded-lg border border-[#1e4f4f]/40 bg-white px-3 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]";
  const btnDisabled = `${btn} opacity-55 cursor-not-allowed`;

  const showGoogle = shouldShowGoogleExportButtons(googleConfigured, googleConnected);
  const showWord =
    showDest("microsoft-word") &&
    workspacePrefs.documents === "microsoft-word";
  const googleModeLabel =
    googleConfigured === false
      ? "Connect Google in Settings to save directly when a Google destination applies."
      : googleConnected
        ? null
        : "Google not connected — connect in Settings to save directly, or use Download / Print.";

  return (
    <div
      className={compact ? "mt-2" : "mt-2"}
      data-testid="export-actions"
      data-artifact-family={caps.family}
    >
      {flash && !compact && (
        <p className="mb-2 text-sm font-semibold text-[#1e4f4f]" role="status">
          {flash}
        </p>
      )}
      {googleModeLabel && !compact ? (
        <p className="mb-2 text-xs font-medium text-[#9a8f82]">{googleModeLabel}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {!compact && showDest("copy") ? (
          <button type="button" onClick={copy} className={btn}>
            📋 Copy
          </button>
        ) : null}

        {showDest("print") ? (
          <button
            ref={printButtonRef}
            type="button"
            onClick={print}
            className={printSupport.supported ? btn : btnDisabled}
            aria-disabled={!printSupport.supported}
            title={
              printSupport.supported
                ? "Print"
                : (printSupport.reasonUnavailable ?? "Print unavailable")
            }
            data-testid="export-print"
          >
            {printSupport.supported ? "🖨 Print" : "🖨 Print (unavailable)"}
          </button>
        ) : null}

        {showDest("google-docs") && showGoogle ? (
          <button
            ref={docButtonRef}
            type="button"
            onClick={() => void googleFile("doc")}
            className={btn}
            data-testid="export-google-docs"
          >
            📝 Google Docs
          </button>
        ) : null}

        {showDest("google-sheets") && showGoogle && !compact ? (
          <button
            type="button"
            onClick={() => void googleFile("sheet")}
            className={btn}
            data-testid="export-google-sheets"
          >
            📊 Google Sheets
          </button>
        ) : null}

        {showDest("google-forms") && showGoogle && !compact ? (
          <button
            type="button"
            onClick={() => void googleFile("form")}
            className={btn}
            data-testid="export-google-forms"
          >
            📋 Google Forms
          </button>
        ) : null}

        {showWord ? (
          <button
            type="button"
            onClick={() => void downloadAs("docx")}
            className={btn}
            data-testid="export-microsoft-word"
          >
            📄 Microsoft Word
          </button>
        ) : null}

        {showDest("google-calendar") && !compact ? (
          <button
            type="button"
            onClick={calendar}
            className={btn}
            data-testid="export-google-calendar"
          >
            📅 Google Calendar
          </button>
        ) : null}

        {showDest("pdf") ? (
          <button
            type="button"
            onClick={() => void downloadAs("pdf")}
            className={btn}
            data-testid="export-pdf"
          >
            ⬇ PDF
          </button>
        ) : null}

        {showDest("download") || showDest("csv") || showDest("markdown") ? (
          <button
            type="button"
            onClick={() =>
              void downloadAs(
                caps.defaultDownloadFormat === "pdf"
                  ? "txt"
                  : caps.defaultDownloadFormat,
              )
            }
            className={btn}
            data-testid="export-download"
          >
            ⬇ Download
          </button>
        ) : null}

        {showDest("download") &&
        caps.downloadFormats.includes("docx") &&
        !showWord ? (
          <button
            type="button"
            onClick={() => void downloadAs("docx")}
            className={btn}
            data-testid="export-docx"
          >
            📄 Word (.docx)
          </button>
        ) : null}
      </div>
      {social && (
        <div className="mt-2">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
            Copy &amp; open to paste
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {social_list.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => toSocial(s.name, s.url)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-white"
                style={{ background: s.color }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
