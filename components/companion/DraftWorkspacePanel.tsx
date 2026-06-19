"use client";

import { useState } from "react";
import { CreateDraftImprove } from "@/components/companion/CreateDraftImprove";
import { CreateDraftReviewChat } from "@/components/companion/CreateDraftReviewChat";
import { CreateExecutionActionBar } from "@/components/companion/CreateExecutionActionBar";
import { CreateOptionsMenu, type CreateOptionsAction } from "@/components/companion/CreateOptionsMenu";
import type { ExecutionActionId } from "@/lib/createExecution";
import type { DraftReviewContext } from "@/lib/createDraftReview";

const btn =
  "rounded-lg px-3 py-2 text-sm font-semibold transition-colors";
const btnPrimary = `${btn} bg-[#1e4f4f] text-white hover:bg-[#163a3a] disabled:opacity-50`;
const btnSecondary = `${btn} border border-[#1e4f4f]/40 bg-white text-[#1e4f4f] hover:bg-[#f0f5f5] disabled:opacity-50`;

export function DraftWorkspacePanel({
  itemType,
  templateName,
  draft,
  onDraftChange,
  editable = true,
  onApplyDraft,
  onGoogleDoc,
  onCopy,
  onPrint,
  onDownload,
  onAddToProject,
  onRegenerate,
  onMoreAction,
  changeTypeDisabled,
  googleExportError,
  onClearGoogleError,
  busy = false,
  reviewContext,
  onReviewReceipt,
  executionActions,
  onExecutionAction,
}: {
  itemType: string;
  templateName?: string | null;
  draft: string;
  onDraftChange?: (value: string) => void;
  editable?: boolean;
  onApplyDraft: (next: string) => void;
  onGoogleDoc: () => void | Promise<void>;
  onCopy: () => void;
  onPrint: () => void;
  onDownload?: () => void;
  onAddToProject?: () => void;
  onRegenerate?: () => void;
  onMoreAction?: (action: CreateOptionsAction) => void;
  changeTypeDisabled?: boolean;
  googleExportError?: string | null;
  onClearGoogleError?: () => void;
  busy?: boolean;
  reviewContext?: DraftReviewContext | null;
  onReviewReceipt?: (message: string) => void;
  executionActions?: ExecutionActionId[];
  onExecutionAction?: (action: ExecutionActionId) => void;
}) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const displayType = itemType?.trim() || "Draft";

  async function handleGoogleDoc() {
    if (!draft.trim() || googleLoading) return;
    onClearGoogleError?.();
    setGoogleLoading(true);
    try {
      await onGoogleDoc();
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="companion-fade-in mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-4 py-4">
      <div className="rounded-2xl border border-[#e7dfd4] bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          {displayType} Draft
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[#1f1c19]">
          {displayType} Draft
        </h2>
        {templateName?.trim() ? (
          <p className="mt-1 text-sm text-[#6b635a]">
            Template:{" "}
            <span className="font-semibold text-[#1f1c19]">{templateName}</span>
          </p>
        ) : null}
        <p className="mt-2 text-sm text-[#6b635a]">
          Review your draft below. You can edit it, copy it, send it to Google
          Docs, print it, or add it to a project.
        </p>

        {googleExportError ? (
          <div className="mt-4 rounded-xl border border-[#e8c4bc] bg-[#fdf6f4] p-4">
            <p className="text-sm font-semibold text-[#8a3d32]">
              Something went wrong sending this to Google Docs.
            </p>
            <p className="mt-1 text-sm text-[#6b635a]">{googleExportError}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleGoogleDoc()}
                className={btnPrimary}
              >
                Try Again
              </button>
              <button type="button" onClick={onCopy} className={btnSecondary}>
                Copy Draft
              </button>
              {onDownload ? (
                <button type="button" onClick={onDownload} className={btnSecondary}>
                  Download
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-4">
          {editable && onDraftChange ? (
            <textarea
              data-draft-workspace-editor
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              className="min-h-[280px] w-full resize-y rounded-xl border border-[#c9bfb0] bg-[#faf8f5] px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            />
          ) : (
            <div className="min-h-[200px] whitespace-pre-wrap rounded-xl border border-[#d4cdc3] bg-[#faf8f5] px-4 py-3 text-base leading-relaxed text-[#2d2926]">
              {draft}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#e7dfd4] pt-4">
          {editable ? (
            <button
              type="button"
              onClick={() => {
                const el = document.querySelector<HTMLTextAreaElement>(
                  "[data-draft-workspace-editor]",
                );
                el?.focus();
              }}
              className={btnSecondary}
            >
              Edit
            </button>
          ) : null}
          <button type="button" onClick={onCopy} className={btnSecondary}>
            Copy
          </button>
          <button
            type="button"
            disabled={!draft.trim() || googleLoading || busy}
            onClick={() => void handleGoogleDoc()}
            className={btnPrimary}
          >
            {googleLoading ? "Opening…" : "Google Docs"}
          </button>
          <button type="button" onClick={onPrint} className={btnSecondary}>
            Print
          </button>
          {onAddToProject ? (
            <button type="button" onClick={onAddToProject} className={btnSecondary}>
              Add To Project
            </button>
          ) : null}
          {onRegenerate ? (
            <button
              type="button"
              disabled={busy}
              onClick={onRegenerate}
              className={btnSecondary}
            >
              Regenerate
            </button>
          ) : null}
          {onMoreAction ? (
            <CreateOptionsMenu
              onAction={onMoreAction}
              changeTypeDisabled={changeTypeDisabled}
              triggerLabel="More Actions"
            />
          ) : null}
        </div>
      </div>

      {executionActions?.length && onExecutionAction ? (
        <CreateExecutionActionBar
          actions={executionActions}
          onAction={onExecutionAction}
          disabled={busy || !draft.trim()}
        />
      ) : null}

      {editable ? (
        <CreateDraftImprove
          draft={draft}
          onApply={onApplyDraft}
          disabled={busy}
          hideMoreActions
        />
      ) : null}

      {reviewContext ? (
        <CreateDraftReviewChat
          context={reviewContext}
          draft={draft}
          onApplyDraft={onApplyDraft}
          onReceipt={onReviewReceipt}
          disabled={busy}
        />
      ) : null}
    </div>
  );
}
