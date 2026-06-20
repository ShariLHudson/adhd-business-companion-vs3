"use client";

import { useState } from "react";
import { CreateDraftSectionEdit } from "@/components/companion/CreateDraftSectionEdit";
import { DraftActionBar } from "@/components/companion/DraftActionBar";
import type {
  DraftEditAction,
  DraftExportAction,
  DraftSaveAction,
  DraftSocialAction,
} from "@/lib/createDraftActions";
import type { TemplateSectionForEdit } from "@/lib/createTemplateSections";

export type DraftGuidedEditRequest = {
  sectionId: string;
  opener: string;
};

const btnPrimary =
  "rounded-lg px-3 py-2 text-sm font-semibold bg-[#1e4f4f] text-white hover:bg-[#163a3a] disabled:opacity-50";

export function DraftWorkspacePanel({
  itemType,
  templateName,
  draft,
  onDraftChange,
  editable = true,
  onEditAction,
  onSaveAction,
  onExportAction,
  onSocialAction,
  templateSections,
  onSectionEdit,
  googleExportError,
  onClearGoogleError,
  onRetryGoogle,
  busy = false,
}: {
  itemType: string;
  templateName?: string | null;
  draft: string;
  onDraftChange?: (value: string) => void;
  editable?: boolean;
  onEditAction: (action: DraftEditAction) => void;
  onSaveAction: (action: DraftSaveAction) => void;
  onExportAction: (action: DraftExportAction) => void;
  onSocialAction: (action: DraftSocialAction) => void;
  templateSections: TemplateSectionForEdit[];
  onSectionEdit?: (request: DraftGuidedEditRequest) => void;
  googleExportError?: string | null;
  onClearGoogleError?: () => void;
  onRetryGoogle?: () => void | Promise<void>;
  busy?: boolean;
}) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const displayType = itemType?.trim() || "Draft";
  const actionsDisabled = busy || !draft.trim();

  async function handleRetryGoogle() {
    if (!onRetryGoogle || googleLoading) return;
    onClearGoogleError?.();
    setGoogleLoading(true);
    try {
      await onRetryGoogle();
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
          Review your draft below. Use <strong>Edit</strong> to refine it with
          Shari, or <strong>Save</strong>, <strong>Export</strong>, and{" "}
          <strong>Social</strong> when you are ready to share.
        </p>

        {googleExportError ? (
          <div className="mt-4 rounded-xl border border-[#e8c4bc] bg-[#fdf6f4] p-4">
            <p className="text-sm font-semibold text-[#8a3d32]">
              Something went wrong sending this to Google.
            </p>
            <p className="mt-1 text-sm text-[#6b635a]">{googleExportError}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {onRetryGoogle ? (
                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={() => void handleRetryGoogle()}
                  className={btnPrimary}
                >
                  {googleLoading ? "Trying…" : "Try Again"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onExportAction("copy-text")}
                className="rounded-lg border border-[#1e4f4f]/40 bg-white px-3 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
              >
                Copy Draft
              </button>
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

        {onSectionEdit && templateSections.length > 0 ? (
          <CreateDraftSectionEdit
            sections={templateSections}
            onSelectSection={(sectionId, opener) =>
              onSectionEdit({ sectionId, opener })
            }
            disabled={actionsDisabled}
          />
        ) : null}

        <div className="mt-5 border-t border-[#e7dfd4] pt-4">
          <DraftActionBar
            onEditAction={onEditAction}
            onSaveAction={onSaveAction}
            onExportAction={onExportAction}
            onSocialAction={onSocialAction}
            disabled={actionsDisabled}
          />
        </div>
      </div>
    </div>
  );
}
