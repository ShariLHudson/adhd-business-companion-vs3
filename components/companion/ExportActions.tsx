"use client";

import { useEffect, useState, type RefObject } from "react";
import { getPrefs } from "@/lib/companionStore";
import { isProposalArtifact } from "@/lib/artifactType";

// Send a finished piece where it's going: copy, print, push to a new Google
// Doc, download, or copy-and-open the right social network to paste into.
// Uses the user's saved profile URLs (Settings → Connections) when present.
const SOCIAL_META = [
  { name: "Facebook", fallback: "https://www.facebook.com/", color: "#1877f2" },
  { name: "Instagram", fallback: "https://www.instagram.com/", color: "#c13584" },
  {
    name: "LinkedIn",
    fallback: "https://www.linkedin.com/feed/?shareActive=true",
    color: "#0a66c2",
  },
];

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function ExportActions({
  text,
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
  text: string;
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
  const [flash, setFlash] = useState<string | null>(null);
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);
  const workspaceMode = variant === "workspace" || variant === "proposal";
  const proposalMode =
    workspaceMode || isProposalArtifact(artifactType ?? title);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/google/status")
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setGoogleConnected(Boolean(j.connected));
      })
      .catch(() => {
        if (!cancelled) setGoogleConnected(false);
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
  };
  const social_list = SOCIAL_META.map((s) => ({
    name: s.name,
    color: s.color,
    url: savedUrl[s.name]?.trim() || s.fallback,
  }));

  async function clip(): Promise<boolean> {
    try {
      await navigator.clipboard?.writeText(text);
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
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) {
      note("Allow pop-ups to print.");
      return;
    }
    w.document.write(
      `<html><head><title>${esc(title || "Content")}</title></head>` +
        `<body><pre style="white-space:pre-wrap;font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.65;padding:28px;color:#1f1c19;">${esc(text)}</pre></body></html>`,
    );
    w.document.close();
    w.focus();
    window.setTimeout(() => w.print(), 300);
    onPrint?.();
    if (workspaceMode) note("Opening print…");
  }

  async function googleFile(kind: "doc" | "sheet" | "form") {
    const block = onBeforeAction?.();
    if (block) {
      note(block);
      return;
    }
    const labels =
      kind === "sheet"
        ? { name: "Sheet", blank: "https://sheets.new" }
        : { name: "Doc", blank: "https://docs.google.com/document/create" };
    if (!text.trim()) {
      note("Add some content before exporting to Google Docs.");
      return;
    }
    if (workspaceMode && googleConnected === false) {
      note(
        "Google Docs isn't connected yet — connect in Settings, or keep working here.",
      );
      return;
    }
    try {
      const r = await fetch("/api/google/create-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || "Content", content: text, kind }),
      });
      if (r.ok) {
        const j = await r.json();
        if (j.url) {
          if (!embedInPanel) {
            window.open(j.url, "_blank");
          }
          onGoogleDocCreated?.(j.url, j.id as string | undefined, kind);
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
                documentId: (j.id as string | undefined) ?? "",
                artifactType: artifactType ?? title ?? kind,
              },
            });
          });
          note(
            embedInPanel
              ? `Opening in Google ${labels.name}s…`
              : workspaceMode
                ? "Created Google Doc ✓"
                : `Created in Google ${labels.name}s ✓`,
          );
          return;
        }
      }
      if (workspaceMode && r.status === 401) {
        note(
          "Google Docs isn't connected yet — connect in Settings, or keep working here.",
        );
        return;
      }
      if (workspaceMode) {
        let errMsg = "Something went wrong sending this to Google Docs.";
        try {
          const errBody = (await r.json()) as { error?: string };
          if (errBody.error) errMsg = errBody.error;
        } catch {
          /* noop */
        }
        note(errMsg);
        return;
      }
    } catch {
      /* fall through to copy-and-open */
    }
    if (workspaceMode) {
      note(
        "Something went wrong sending this to Google Docs. Try again, or copy your draft.",
      );
      return;
    }
    const ok = await clip();
    window.open(labels.blank, "_blank");
    note(
      ok
        ? `Copied — paste into the new ${labels.name} (Ctrl/Cmd+V)`
        : `Opened a new ${labels.name} — copy your text in.`,
    );
  }

  function calendar() {
    // Pre-fill a Google Calendar event — you pick the time and save. No extra
    // permission needed.
    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(title || "Post / content")}` +
      `&details=${encodeURIComponent(text.slice(0, 1500))}`;
    window.open(url, "_blank");
    note("Opened Google Calendar — pick a time and save.");
  }

  function download() {
    try {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(title || "content").replace(/[^\w.-]+/g, "-").slice(0, 40)}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      note("Couldn't download.");
    }
  }

  async function toSocial(name: string, url: string) {
    const ok = await clip();
    window.open(url, "_blank");
    note(ok ? `Copied — paste into ${name}` : `Opened ${name} — copy your text in.`);
  }

  const btn =
    "rounded-lg border border-[#1e4f4f]/40 bg-white px-3 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]";

  return (
    <div className={compact ? "mt-2" : "mt-2"}>
      {flash && !compact && (
        <p className="mb-2 text-sm font-semibold text-[#1e4f4f]">{flash}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {!compact && (
          <button type="button" onClick={copy} className={btn}>
            📋 Copy
          </button>
        )}
        <button
          ref={printButtonRef}
          type="button"
          onClick={print}
          className={btn}
        >
          {workspaceMode ? "🖨 Print" : "🖨 Print"}
        </button>
        <button
          ref={docButtonRef}
          type="button"
          onClick={() => googleFile("doc")}
          className={btn}
        >
          {workspaceMode ? "📝 Create Google Doc" : "📝 Google Docs"}
        </button>
        {!compact && (
          <>
            <button
              type="button"
              onClick={() => googleFile("sheet")}
              className={btn}
            >
              📊 Google Sheets
            </button>
            <button type="button" onClick={calendar} className={btn}>
              📅 Calendar
            </button>
            <button type="button" onClick={download} className={btn}>
              ⬇ Download
            </button>
          </>
        )}
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
