"use client";

import type { ReactNode } from "react";
import { HowThisFitsTogetherLink } from "@/components/companion/HowThisFitsTogetherLink";
import {
  CREATE_GUIDED_SUPPORT_LINE,
  CREATE_PROGRESS_PHASE_LABEL,
  type CreateProgressPhaseId,
} from "@/lib/createGuidedConversation189";

type Props = {
  typeLabel?: string | null;
  progressPhase: CreateProgressPhaseId;
  savedFlash?: boolean;
  showPreview?: boolean;
  onPreviewDraft?: () => void;
  moreOpen?: boolean;
  onToggleMore?: () => void;
  moreActions?: ReactNode;
};

/**
 * Package 189 — conversation-first Create surface.
 * No empty section cards, Audience/Tone, or How To Use chrome.
 */
export function CreateGuidedMinimalPanel({
  typeLabel,
  progressPhase,
  savedFlash = false,
  showPreview = false,
  onPreviewDraft,
  moreOpen = false,
  onToggleMore,
  moreActions,
}: Props) {
  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 px-4 py-5 sm:px-6"
      data-testid="create-guided-minimal"
      data-create-type={typeLabel ?? ""}
    >
      <header className="shrink-0">
        <h2 className="text-2xl font-semibold tracking-tight text-[#1f1c19]">
          Create
        </h2>
        <p
          className="mt-2 max-w-xl text-base leading-relaxed text-[#5a534a]"
          data-testid="create-guided-support-line"
        >
          {CREATE_GUIDED_SUPPORT_LINE}
        </p>
        <HowThisFitsTogetherLink
          areaOrPlaceId="content-generator"
          className="how-this-fits-link--inline mt-2"
        />
        {typeLabel ? (
          <p
            className="mt-3 text-sm font-medium text-[#1e4f4f]"
            data-testid="create-progress-phase"
          >
            {CREATE_PROGRESS_PHASE_LABEL[progressPhase]}
            {typeLabel ? (
              <span className="font-normal text-[#6b635a]">
                {" "}
                · {typeLabel}
              </span>
            ) : null}
          </p>
        ) : null}
        {savedFlash ? (
          <p
            className="mt-2 text-sm text-[#6b635a]"
            data-testid="create-saved-quiet"
          >
            Saved
          </p>
        ) : null}
      </header>

      {(showPreview || onToggleMore) && (
        <div
          className="mt-auto flex flex-wrap items-center gap-2 border-t border-[#e7dfd4] pt-4"
          data-testid="create-guided-progressive-controls"
        >
          {showPreview && onPreviewDraft ? (
            <button
              type="button"
              className="rounded-xl border border-[#1e4f4f]/35 bg-white px-3 py-2 text-sm font-semibold text-[#1e4f4f]"
              data-testid="create-preview-draft"
              onClick={onPreviewDraft}
            >
              Preview Draft
            </button>
          ) : null}
          {onToggleMore ? (
            <>
              <button
                type="button"
                className="rounded-xl border border-[#d4cdc3] bg-white px-3 py-2 text-sm font-semibold text-[#4b463f]"
                data-testid="create-more-menu"
                onClick={onToggleMore}
              >
                {moreOpen ? "Less" : "More…"}
              </button>
              {moreOpen ? moreActions : null}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
