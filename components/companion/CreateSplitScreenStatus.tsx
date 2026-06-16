"use client";

import type { CreateWorkspacePhase } from "@/lib/createBuild";
import { effectiveSubtypeLabel } from "@/lib/createTypePickers";

const PHASE_COPY: Record<
  CreateWorkspacePhase,
  { body: string; detail: string }
> = {
  gathering: {
    body: "Shari is gathering details in chat.",
    detail: "Your draft will appear here when it is ready.",
  },
  ready: {
    body: "Approve in chat when you're set — click Build Draft.",
    detail: "Your draft will appear here as soon as generation starts.",
  },
  generating: {
    body: "Creating your draft…",
    detail: "This usually takes a few seconds.",
  },
  "draft-ready": {
    body: "Your draft is ready in this workspace.",
    detail: "Ask Shari in chat if you'd like changes.",
  },
  error: {
    body: "Something went wrong creating your draft.",
    detail: "Try again or add more detail in chat.",
  },
};

export function CreateSplitScreenStatus({
  itemType,
  selectedSubtype,
  customSubtype,
  workspacePhase = "gathering",
  loadingMessage,
  errorMessage,
  onTryAgain,
  onAddMoreDetail,
}: {
  itemType: string | null;
  selectedSubtype?: string | null;
  customSubtype?: string | null;
  workspacePhase?: CreateWorkspacePhase;
  loadingMessage?: string;
  errorMessage?: string | null;
  onTryAgain?: () => void;
  onAddMoreDetail?: () => void;
}) {
  const subtype = effectiveSubtypeLabel(selectedSubtype ?? null, customSubtype ?? null);
  const displayType = itemType?.trim() || null;
  const copy = PHASE_COPY[workspacePhase];

  const headline =
    workspacePhase === "gathering" && displayType
      ? `Creating: ${displayType}`
      : workspacePhase === "ready" && displayType
        ? `Ready to create your ${displayType}`
        : workspacePhase === "generating" && displayType
          ? `Creating your ${displayType}…`
          : displayType
            ? displayType
            : "Create with Shari";

  const phaseLabel =
    workspacePhase === "gathering"
      ? "Waiting for details"
      : workspacePhase === "ready"
        ? "Ready to build"
        : workspacePhase === "generating"
          ? "Generating draft"
          : workspacePhase === "error"
            ? "Generation failed"
            : "Draft ready";

  return (
    <div className="companion-fade-in mx-auto flex max-w-lg flex-1 flex-col justify-center px-4 py-8">
      <div className="rounded-2xl border border-[#e7dfd4] bg-white p-6 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          {phaseLabel}
        </p>
        <p className="mt-2 text-lg font-semibold text-[#1f1c19]">{headline}</p>
        {subtype ? (
          <p className="mt-1 text-sm text-[#6b635a]">
            Type: <span className="font-semibold text-[#1f1c19]">{subtype}</span>
          </p>
        ) : null}
        <p className="mt-4 text-base text-[#4b463f]">
          {workspacePhase === "generating" && loadingMessage
            ? loadingMessage
            : copy.body}
        </p>
        <p className="mt-2 text-sm text-[#6b635a]">
          {workspacePhase === "error" && errorMessage
            ? errorMessage
            : copy.detail}
        </p>
        {workspacePhase === "error" && (onTryAgain || onAddMoreDetail) ? (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {onTryAgain ? (
              <button
                type="button"
                className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163d3d]"
                onClick={onTryAgain}
              >
                Try Again
              </button>
            ) : null}
            {onAddMoreDetail ? (
              <button
                type="button"
                className="rounded-lg border border-[#c9bfb0] bg-white px-4 py-2 text-sm font-semibold text-[#1f1c19] hover:bg-[#faf8f5]"
                onClick={onAddMoreDetail}
              >
                Add More Detail
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
