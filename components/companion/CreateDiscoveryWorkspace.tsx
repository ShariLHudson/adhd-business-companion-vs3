"use client";

import { useState } from "react";
import type { CreateWorkspacePhase } from "@/lib/createBuild";
import { BUILD_DRAFT_LOADING_MESSAGES } from "@/lib/createTemplates";
import {
  buildDiscoveryWorkspaceView,
  type DiscoveryWorkspaceSection,
} from "@/lib/createDiscoveryWorkspace";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { userFacingCreateTypeLabel } from "@/lib/createTypePickers";
import { AudienceSelector } from "@/components/companion/AudienceSelector";
import { SparkLoadingState } from "@/components/companion/SparkThinkingFlame";
import { selectedAudienceLabel } from "@/lib/contentAudience";
import { CreateTemplateProgress } from "@/components/companion/CreateTemplateProgress";
import { hasGuidedTemplateFields } from "@/lib/createTemplateFields";
import { resolvedTypeLabel } from "@/lib/createWorkflow";

function SectionRow({
  section,
  active,
}: {
  section: DiscoveryWorkspaceSection;
  active?: boolean;
}) {
  const statusLabel =
    section.status === "filled"
      ? "Added"
      : section.status === "partial"
        ? "Taking shape"
        : "Open";

  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        active
          ? "border-[#1e4f4f] bg-[#f0f5f5] ring-1 ring-[#1e4f4f]/20"
          : "border-[#e7dfd4] bg-[#faf7f2]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[#1f1c19]">{section.label}</p>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-[#9a8f82]">
          {statusLabel}
        </span>
      </div>
      {section.content ? (
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-[#4a443c]">
          {section.content}
        </p>
      ) : (
        <p className="mt-1.5 text-sm italic text-[#9a8f82]">
          We'll shape this together in chat.
        </p>
      )}
    </div>
  );
}

export function CreateDiscoveryWorkspace({
  workflow,
  workspacePhase,
  loadingMessageIndex = 0,
  errorMessage,
  audienceStepActive = false,
  selectedAudienceNames = [],
  onAudienceChange,
  onAudienceConfirm,
  onBuildDraft,
  onTryAgain,
  onAddMoreDetail,
  onCopyAnswers,
  building = false,
}: {
  workflow: CreateWorkflowState;
  workspacePhase: CreateWorkspacePhase;
  loadingMessageIndex?: number;
  errorMessage?: string | null;
  audienceStepActive?: boolean;
  selectedAudienceNames?: string[];
  onAudienceChange?: (names: string[]) => void;
  onAudienceConfirm?: () => void;
  onBuildDraft?: () => void;
  onTryAgain?: () => void;
  onAddMoreDetail?: () => void;
  onCopyAnswers?: () => void;
  building?: boolean;
}) {
  const [templateOpen, setTemplateOpen] = useState(false);
  const view = buildDiscoveryWorkspaceView(workflow);
  if (!view) return null;

  const displayType = userFacingCreateTypeLabel(view.itemType);
  const title = displayType ? `Creating: ${displayType}` : "Creating";
  const loadingMessage = BUILD_DRAFT_LOADING_MESSAGES[loadingMessageIndex];
  const guidedProgress = hasGuidedTemplateFields(resolvedTypeLabel(workflow));
  const filledSections = view.templateSections.filter(
    (s) => s.status === "filled" || s.status === "partial",
  ).length;
  const totalSections = view.templateSections.length;

  if (workspacePhase === "generating") {
    return (
      <div className="flex flex-1 flex-col justify-center px-4 py-6">
        <div className="companion-fade-in mx-auto w-full max-w-lg rounded-2xl border border-[#d4cdc3] bg-white/85 p-5 shadow-sm">
          <SparkLoadingState
            message={`Creating your ${displayType}…`}
            size="lg"
          />
          <p className="mt-2 text-center text-sm text-[#6b635a]">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (workspacePhase === "error") {
    return (
      <div className="flex flex-1 flex-col justify-center px-4 py-6">
        <div className="companion-fade-in mx-auto w-full max-w-lg rounded-2xl border border-[#e8c4c4] bg-[#fdf5f5] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
            Create
          </p>
          <p className="mt-2 text-lg font-semibold text-[#6b3a3a]">
            Something went wrong
          </p>
          <p className="mt-2 text-sm text-[#6b3a3a]">
            {errorMessage ?? "Try again or keep talking in chat."}
          </p>
          <div className="mt-4 flex flex-col gap-2">
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
                Keep Working
              </button>
            ) : null}
            {onCopyAnswers ? (
              <button
                type="button"
                onClick={onCopyAnswers}
                className="text-xs font-semibold text-[#1e4f4f] underline decoration-[#1e4f4f]/40"
              >
                Copy notes to clipboard
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const progressLabel =
    workspacePhase === "ready"
      ? "Your plan looks ready — approve in chat when you want the first draft."
      : guidedProgress
        ? `${view.progress.current} of ${view.progress.total} required sections complete — keep shaping with Shari.`
        : totalSections > 0
          ? `${filledSections} of ${totalSections} sections taking shape — keep shaping with Shari.`
          : "Shape this with Shari here — your plan builds as you go.";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
      <div className="companion-fade-in mx-auto w-full max-w-lg">
        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          Living plan
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[#1f1c19]">{title}</h2>
        <p className="mt-2 text-sm text-[#6b635a]">{progressLabel}</p>

        {audienceStepActive && onAudienceChange ? (
          <div className="mt-4">
            <AudienceSelector
              compact
              showTone={false}
              onChange={() => onAudienceChange([selectedAudienceLabel()])}
            />
            {onAudienceConfirm ? (
              <button
                type="button"
                onClick={onAudienceConfirm}
                className="mt-3 w-full rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
              >
                Continue
              </button>
            ) : null}
          </div>
        ) : null}

        {guidedProgress ? (
          <div className="mt-4">
            <CreateTemplateProgress workflow={workflow} />
          </div>
        ) : null}

        {!guidedProgress && view.templateSections.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-[#d4cdc3] bg-white/85 shadow-sm">
            <button
              type="button"
              onClick={() => setTemplateOpen((open) => !open)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
              aria-expanded={templateOpen}
            >
              <span className="text-sm font-semibold text-[#1f1c19]">
                {view.templateName ?? "Template"}
              </span>
              <span className="text-xs font-semibold text-[#1e4f4f]">
                {templateOpen ? "Collapse" : "Expand"}
              </span>
            </button>
            {templateOpen ? (
              <div className="space-y-2 border-t border-[#e7dfd4] px-3 pb-3 pt-2">
                {view.templateSections.map((section) => (
                  <SectionRow
                    key={section.id}
                    section={section}
                    active={workflow.activeSectionId === section.id}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {workspacePhase === "ready" && onBuildDraft ? (
          <div className="mt-5 rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#1f1c19]">
              Ready for a first draft?
            </p>
            <p className="mt-1 text-sm text-[#6b635a]">
              You can also keep working in chat — no rush.
            </p>
            <button
              type="button"
              disabled={building}
              onClick={onBuildDraft}
              className="mt-3 w-full rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {building ? `Creating your ${displayType}…` : "Create Draft"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
