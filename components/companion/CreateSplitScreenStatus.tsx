"use client";

import type { CreateWorkspacePhase } from "@/lib/createBuild";
import { userFacingCreateTypeLabel } from "@/lib/createTypePickers";
import { CreateAudienceMultiPicker } from "@/components/companion/CreateAudienceMultiPicker";
import { WorkspaceStepCard } from "@/components/companion/WorkspaceStepCard";

const PHASE_DETAIL: Record<CreateWorkspacePhase, string> = {
  gathering: "Answer in chat — your draft appears here when ready.",
  ready: "Approve in chat when you're set.",
  generating: "This usually takes a few seconds.",
  "draft-ready": "Ask Shari in chat if you'd like changes.",
  error: "Try again or add more detail in chat.",
};

export function CreateSplitScreenStatus({
  itemType,
  workspacePhase = "gathering",
  loadingMessage,
  errorMessage,
  onTryAgain,
  onAddMoreDetail,
  onCopyAnswers,
  audienceStepActive = false,
  selectedAudienceNames = [],
  onAudienceChange,
  onAudienceConfirm,
}: {
  itemType: string | null;
  workspacePhase?: CreateWorkspacePhase;
  loadingMessage?: string;
  errorMessage?: string | null;
  onTryAgain?: () => void;
  onAddMoreDetail?: () => void;
  onCopyAnswers?: () => void;
  audienceStepActive?: boolean;
  selectedAudienceNames?: string[];
  onAudienceChange?: (names: string[]) => void;
  onAudienceConfirm?: () => void;
}) {
  const displayType = userFacingCreateTypeLabel(itemType);
  const title =
    workspacePhase === "generating" && displayType
      ? `Creating your ${displayType}…`
      : displayType
        ? `Creating: ${displayType}`
        : "What would you like to create?";

  const detail =
    workspacePhase === "error" && errorMessage
      ? errorMessage
      : workspacePhase === "generating" && loadingMessage
        ? loadingMessage
        : PHASE_DETAIL[workspacePhase];

  return (
    <div className="flex flex-1 flex-col justify-center px-4 py-6">
      <WorkspaceStepCard sectionLabel="Create" title={title} footer={detail}>
        {audienceStepActive && onAudienceChange ? (
          <>
            <CreateAudienceMultiPicker
              value={selectedAudienceNames}
              onChange={onAudienceChange}
            />
            {onAudienceConfirm ? (
              <button
                type="button"
                disabled={selectedAudienceNames.length === 0}
                onClick={onAudienceConfirm}
                className="mt-3 w-full rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            ) : null}
          </>
        ) : null}
        {workspacePhase === "error" ? (
          <div className="mt-3 flex flex-col gap-2">
            {onTryAgain ? (
              <button
                type="button"
                onClick={onTryAgain}
                className="w-full rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
              >
                Try Again
              </button>
            ) : null}
            {onAddMoreDetail ? (
              <button
                type="button"
                onClick={onAddMoreDetail}
                className="w-full rounded-xl border border-[#1e4f4f]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
              >
                Add More Detail
              </button>
            ) : null}
            {onCopyAnswers ? (
              <button
                type="button"
                onClick={onCopyAnswers}
                className="text-xs font-semibold text-[#1e4f4f] underline decoration-[#1e4f4f]/40"
              >
                Copy answers to clipboard
              </button>
            ) : null}
          </div>
        ) : null}
      </WorkspaceStepCard>
    </div>
  );
}
