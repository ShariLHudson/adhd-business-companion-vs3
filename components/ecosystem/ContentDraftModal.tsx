"use client";

import { useEffect, useState } from "react";

import type { ContentDraft } from "@/lib/ecosystem/postcraftDraftGenerator";
import { ECOSYSTEM_DASHBOARD_ACCESS_HEADER } from "@/lib/ghl/auth";

type ContentDraftModalProps = {
  draft: ContentDraft | null;
  accessToken: string;
  onClose: () => void;
  onUpdated: (draft: ContentDraft) => void;
  onSyncQueueChange?: () => void;
};

export function ContentDraftModal({
  draft,
  accessToken,
  onClose,
  onUpdated,
  onSyncQueueChange,
}: ContentDraftModalProps) {
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [postCraftCopied, setPostCraftCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!draft) return;
    setBody(draft.body);
    setTitle(draft.title);
    setError(null);
  }, [draft]);

  if (!draft) return null;

  async function patchDraft(
    patch: Record<string, unknown>,
  ): Promise<ContentDraft | null> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ecosystem/postcraft/drafts", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken,
        },
        body: JSON.stringify({ id: draft!.id, ...patch }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Update failed.");
      }
      const data = (await res.json()) as { draft: ContentDraft };
      onUpdated(data.draft);
      onSyncQueueChange?.();
      return data.draft;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    await patchDraft({ body, title });
  }

  async function handleApprove() {
    await patchDraft({ action: "approve", body, title });
  }

  async function handleSendToPostCraft() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ecosystem/postcraft/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken,
        },
        body: JSON.stringify({ action: "send_to_postcraft", id: draft!.id }),
      });
      if (!res.ok) throw new Error("Could not prepare PostCraft sync.");
      const data = (await res.json()) as {
        draft: ContentDraft;
        postCraftPayload: unknown;
      };
      onUpdated(data.draft);
      onSyncQueueChange?.();
      await navigator.clipboard.writeText(
        JSON.stringify(data.postCraftPayload, null, 2),
      );
      setPostCraftCopied(true);
      window.setTimeout(() => setPostCraftCopied(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PostCraft export failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Clipboard blocked — copy manually.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#d4cdc3] bg-white shadow-xl"
        role="dialog"
        aria-labelledby="draft-modal-title"
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-[#ebe4d9] bg-white p-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#1e4f4f]">
              Content Draft · {draft.assetLabel}
            </p>
            <h2 id="draft-modal-title" className="text-lg font-semibold text-[#1f1c19]">
              {title}
            </h2>
            <p className="mt-1 text-xs text-[#6b635a]">
              {draft.topic} · Score {draft.opportunityScore} · {draft.trend} ·{" "}
              <span className="font-medium capitalize">{draft.status}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#d4cdc3] px-2 py-1 text-sm text-[#6b635a]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 p-4">
          <p className="text-xs text-[#6b635a]">{draft.angle}</p>
          <p className="text-xs text-[#6b635a]">
            Signals: {draft.sourceSignalSummary}
          </p>

          <label className="block text-xs font-medium text-[#2d2926]">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-xs font-medium text-[#2d2926]">
            Draft body
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              className="mt-1 w-full rounded-lg border border-[#d4cdc3] px-3 py-2 font-mono text-sm leading-relaxed"
            />
          </label>

          {error ? <p className="text-sm text-[#a85c4a]">{error}</p> : null}

          <p className="text-[10px] text-[#6b635a]">
            Drafts require founder approval before publish. No auto-publish.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleCopy()}
              className="rounded-lg border border-[#d4cdc3] bg-white px-3 py-1.5 text-xs font-medium"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSave()}
              className="rounded-lg border border-[#1e4f4f] px-3 py-1.5 text-xs font-medium text-[#1e4f4f]"
            >
              Save edits
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleApprove()}
              className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-xs font-medium text-white"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSendToPostCraft()}
              className="rounded-lg border border-[#c9684d] bg-[#c9684d]/10 px-3 py-1.5 text-xs font-medium text-[#c9684d]"
            >
              {postCraftCopied ? "PostCraft JSON copied!" : "Send to PostCraft"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
