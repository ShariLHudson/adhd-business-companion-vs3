"use client";

import type { CreateWorkspacePhase } from "@/lib/createBuild";
import { BUILD_DRAFT_LOADING_MESSAGES } from "@/lib/createTemplates";
import {
  buildDiscoveryWorkspaceView,
  type DiscoveryWorkspaceSection,
} from "@/lib/createDiscoveryWorkspace";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { userFacingCreateTypeLabel } from "@/lib/createTypePickers";
import { CreateAudienceMultiPicker } from "@/components/companion/CreateAudienceMultiPicker";

function SectionRow({
  section,
  active,
}: {
  section: DiscoveryWorkspaceSection;
  active?: boolean;
}) {
  const statusLabel =
    section.status === "filled"
      ? "Ready for draft"
      : section.status === "partial"
        ? "In progress"
        : "Waiting";

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
          Shari will draft this from your answers.
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
  const view = buildDiscoveryWorkspaceView(workflow);
  if (!view) return null;

  const displayType = userFacingCreateTypeLabel(view.itemType);
  const title = displayType ? `Creating: ${displayType}` : "Creating";
  const loadingMessage = BUILD_DRAFT_LOADING_MESSAGES[loadingMessageIndex];

  if (workspacePhase === "generating") {
    return (
      <div className="flex flex-1 flex-col justify-center px-4 py-6">
        <div className="companion-fade-in mx-auto w-full max-w-lg rounded-2xl border border-[#d4cdc3] bg-white/85 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
            Create
          </p>
          <p className="mt-2 text-lg font-semibold text-[#1f1c19]">
            Creating your {displayType}…
          </p>
          <p className="mt-2 text-sm text-[#6b635a]">{loadingMessage}</p>
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
            {errorMessage ?? "Try again or add more detail in chat."}
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
        </div>
      </div>
    );
  }

  const progressLabel =
    workspacePhase === "ready"
      ? "All sections complete — approve in chat or below."
      : view.incompleteSectionLabels.length > 0
        ? `${view.incompleteSectionLabels.length} section${view.incompleteSectionLabels.length === 1 ? "" : "s"} still open — answer in chat.`
        : view.currentQuestion
          ? `Question ${view.progress.current} of ${view.progress.total} — answer in chat.`
          : `Gathering details — ${view.progress.current} of ${view.progress.total}.`;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
      <div className="companion-fade-in mx-auto w-full max-w-lg">
        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          Create
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[#1f1c19]">{title}</h2>
        {view.templateName ? (
          <p className="mt-0.5 text-sm text-[#6b635a]">{view.templateName}</p>
        ) : null}
        <p className="mt-2 text-sm text-[#6b635a]">{progressLabel}</p>

        {audienceStepActive && onAudienceChange ? (
          <div className="mt-4 rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#1f1c19]">Who is it for?</p>
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
          </div>
        ) : null}

        {view.collectedAnswers.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
              Your answers
            </p>
            <ul className="mt-2 space-y-2">
              {view.collectedAnswers.map((row) => (
                <li
                  key={row.label}
                  className="rounded-xl border border-[#e7dfd4] bg-white px-3 py-2"
                >
                  <p className="text-xs font-semibold text-[#6b635a]">{row.label}</p>
                  <p className="mt-0.5 text-sm text-[#1f1c19]">{row.value}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {view.templateSections.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
              Template outline
            </p>
            <div className="mt-2 space-y-2">
              {view.templateSections.map((section) => (
                <SectionRow
                  key={section.id}
                  section={section}
                  active={workflow.activeSectionId === section.id}
                />
              ))}
            </div>
          </div>
        ) : null}

        {workspacePhase === "ready" && onBuildDraft ? (
          <div className="mt-5 rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#1f1c19]">
              Ready to build your {displayType}?
            </p>
            <p className="mt-1 text-sm text-[#6b635a]">
              Shari has enough for a first draft. You can refine after.
            </p>
            <button
              type="button"
              disabled={building}
              onClick={onBuildDraft}
              className="mt-3 w-full rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {building ? `Building your ${displayType}…` : "Build Draft"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
