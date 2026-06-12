"use client";

import { useState } from "react";

import {
  formatFounderGoogleDocContent,
  founderItemHasExportableContent,
} from "@/lib/founderWorkspace/exportContent";
import { downloadFounderItemPdf } from "@/lib/founderWorkspace/exportPdf";
import type { FounderWorkspaceItem } from "@/lib/founderWorkspace";

type FounderItemExportsProps = {
  item: FounderWorkspaceItem;
};

export function FounderItemExports({ item }: FounderItemExportsProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"doc" | "pdf" | null>(null);

  const canExport = founderItemHasExportableContent(item);

  function flash(msg: string) {
    setMessage(msg);
    setError(null);
    window.setTimeout(() => setMessage(null), 3500);
  }

  function fail(msg: string) {
    setError(msg);
    setMessage(null);
    console.error("[founder-export]", msg, item.id);
  }

  async function exportGoogleDoc() {
    if (!canExport) return;
    setBusy("doc");
    setError(null);
    try {
      const statusRes = await fetch("/api/google/status", { cache: "no-store" });
      const status = (await statusRes.json()) as {
        configured?: boolean;
        connected?: boolean;
      };

      if (!status.configured) {
        fail("Google is not configured on this server. Check GOOGLE_SETUP.md.");
        return;
      }

      if (!status.connected) {
        const returnTo = encodeURIComponent(
          `${window.location.pathname}${window.location.search}`,
        );
        window.location.href = `/api/google/auth?returnTo=${returnTo}`;
        return;
      }

      const res = await fetch("/api/google/create-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title.trim(),
          content: formatFounderGoogleDocContent(item),
          kind: "doc",
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (res.status === 401) {
        fail("Google session expired. Click Export → Google Docs again to reconnect.");
        const returnTo = encodeURIComponent(
          `${window.location.pathname}${window.location.search}`,
        );
        window.setTimeout(() => {
          window.location.href = `/api/google/auth?returnTo=${returnTo}`;
        }, 1200);
        return;
      }

      if (!res.ok || !data.url) {
        fail(data.error ?? "Couldn't create the Google Doc. Try again.");
        return;
      }

      window.open(data.url, "_blank", "noopener,noreferrer");
      flash("Google Docs export ready — opened in a new tab.");
    } catch (e) {
      console.error("founder Google Doc export failed", e);
      fail("Couldn't reach Google. Check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  function exportPdf() {
    if (!canExport) return;
    setBusy("pdf");
    setError(null);
    try {
      downloadFounderItemPdf(item);
      flash("PDF downloaded.");
    } catch (e) {
      console.error("founder PDF export failed", e);
      window.alert("PDF generation failed. Check the console and try again.");
      fail("PDF generation failed. Try again.");
    } finally {
      setBusy(null);
    }
  }

  const btn =
    "rounded-md border border-[#d4cdc3] px-2 py-1 text-[11px] font-medium disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void exportGoogleDoc()}
          disabled={!canExport || busy !== null}
          className={`${btn} text-[#1e4f4f] hover:bg-[#f5f0e8]`}
        >
          {busy === "doc" ? "Exporting…" : "Export → Google Docs"}
        </button>
        <button
          type="button"
          onClick={exportPdf}
          disabled={!canExport || busy !== null}
          className={`${btn} text-[#2d2926] hover:bg-[#f5f0e8]`}
        >
          {busy === "pdf" ? "Exporting…" : "Export → PDF"}
        </button>
      </div>
      {message ? (
        <p className="text-[11px] font-medium text-[#1e4f4f]">{message}</p>
      ) : null}
      {error ? (
        <p className="text-[11px] font-medium text-[#a85c4a]">
          {error}{" "}
          <button
            type="button"
            onClick={() => void exportGoogleDoc()}
            className="underline"
          >
            Retry
          </button>
        </p>
      ) : null}
    </div>
  );
}
