"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppBackButton } from "@/components/companion/AppBackButton";
import { CreateEstateRoomShell } from "@/components/companion/CreateEstateRoomShell";
import { CreateWorkspaceV2Panel } from "@/components/companion/CreateWorkspaceV2Panel";
import { CreateWorkCommandToolbar } from "@/components/companion/CreateWorkCommandToolbar";
import { CurrentFocusInteraction } from "@/components/companion/CurrentFocusInteraction";
import { canonicalStatusFromWorkflow } from "@/lib/activeWorkspaceRegistry/canonicalStatus";
import {
  extractTitleFromDraftContent,
  resolveHumanReadableTitle,
} from "@/lib/activeWorkspaceRegistry/humanReadableIdentity";
import { CREATE_BACK_TO_FOCUS_DESTINATION } from "@/lib/createGuidedConversation189";
import type { CreateWorkspacePhase } from "@/lib/createBuild";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { isProjectWorthyCreateType } from "@/lib/createProjects/canonicalWorkRecord";
import { resolveFocusForCreationDestination } from "@/lib/currentFocus/resolveCanonicalFocus";
import type { CanonicalCurrentFocus } from "@/lib/currentFocus";
import { userFacingCreateTypeLabel } from "@/lib/createTypePickers";
import { resolvedTypeLabel } from "@/lib/createWorkflow";
import {
  markSectionCompleteForNow,
  reopenSectionForEditing,
} from "@/lib/createWorkspaceV2";
import { resolveFacilitatedSectionStatus } from "@/lib/facilitatedCreation";
import { openWorkshopMapSection } from "@/lib/workTypeSchema";
import { useDismissibleWindow } from "@/lib/windowDismiss";

type Props = {
  workflow: CreateWorkflowState;
  workspacePhase: CreateWorkspacePhase;
  loadingMessageIndex: number;
  building: boolean;
  highlightSectionId?: string | null;
  highlightKey?: number;
  projectHomeId?: string | null;
  onBack: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  onWorkflowChange: (workflow: CreateWorkflowState) => void;
  /** 073 — rename human title; preserve Workspace ID */
  onRenameTitle?: (nextTitle: string) => void;
  onNeedIdeasInFocus: () => void;
  onBuildDraftInFocus: () => void;
  onDeleteDraft?: () => void;
  onConnectProjectHome?: () => void;
  onOpenProjectHome?: () => void;
  onSubmitCurrentFocus: (input: {
    focus: CanonicalCurrentFocus;
    response: string;
    responseType: "multiline" | "ideas" | "unsure" | "skip";
  }) => void;
  onRetryCurrentFocus?: () => void;
  focusGuidance?: string | null;
  focusFailure?: string | null;
  focusSubmitting?: boolean;
  preservedResponse?: string | null;
};

/**
 * Create Estate Destination — workspace-only.
 * Current Focus is the sole interaction owner (066).
 */
export function CreateEstateWorkingPanel({
  workflow,
  workspacePhase,
  loadingMessageIndex,
  building,
  highlightSectionId,
  highlightKey,
  projectHomeId,
  onBack,
  registerBack,
  onWorkflowChange,
  onRenameTitle,
  onNeedIdeasInFocus,
  onBuildDraftInFocus,
  onDeleteDraft,
  onConnectProjectHome,
  onOpenProjectHome,
  onSubmitCurrentFocus,
  onRetryCurrentFocus,
  focusGuidance = null,
  focusFailure = null,
  focusSubmitting = false,
  preservedResponse = null,
}: Props) {
  const typeLabel =
    userFacingCreateTypeLabel(resolvedTypeLabel(workflow) || "") ||
    resolvedTypeLabel(workflow) ||
    "Creation";
  const isEventWorkspace = workflow.creationWorkspaceKind === "event";
  // 073 — human-readable work title; never Default * Template / bare "Workshop"
  // Prefer confirmed selectedTemplateName — never re-mash from section text.
  const workspaceTitle = resolveHumanReadableTitle({
    memberTitle: workflow.selectedTemplateName,
    confirmedFocusTitle: workflow.selectedTemplateName,
    draftTitle: extractTitleFromDraftContent(workflow.draftContent, typeLabel),
    creationType: typeLabel,
    requestText: null,
  });
  const statusLabel = canonicalStatusFromWorkflow(workflow);
  const projectWorthy = isProjectWorthyCreateType(typeLabel);
  const [renaming, setRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState(workspaceTitle);
  /** 076_017 — brief durable ack only after verified save (never LS-only). */
  const [lastDurableOk, setLastDurableOk] = useState<boolean | null>(null);
  const wasSubmittingRef = useRef(false);

  useEffect(() => {
    if (focusSubmitting) {
      wasSubmittingRef.current = true;
      setLastDurableOk(null);
      return;
    }
    if (wasSubmittingRef.current) {
      wasSubmittingRef.current = false;
      if (focusFailure?.trim()) {
        setLastDurableOk(false);
      } else {
        setLastDurableOk(true);
        const clear = window.setTimeout(() => setLastDurableOk(null), 4000);
        return () => window.clearTimeout(clear);
      }
    }
  }, [focusSubmitting, focusFailure]);

  const canonicalFocus = useMemo(
    () => resolveFocusForCreationDestination(workflow),
    [
      workflow.eventRecordId,
      workflow.sessionId,
      workflow.sectionContent,
      workflow.skippedSectionIds,
      workflow.workspaceCurrentFocus?.title,
      workflow.workspaceKnownFacts?.join("|"),
      workflow.draftContent,
      workflow.selectedTypeLabel,
    ],
  );

  const [localGuidance, setLocalGuidance] = useState<string | null>(null);
  const guidance = focusGuidance ?? localGuidance;

  useDismissibleWindow({
    open: true,
    onClose: onBack,
    closeOnEscape: true,
  });

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => false);
    return () => registerBack(null);
  }, [registerBack]);

  return (
    <div
      className="create-estate-working flex h-full min-h-0 max-h-full flex-col overflow-hidden create-estate-working--scroll-host"
      data-testid="create-estate-working"
      data-create-estate-working="true"
      data-create-shell="estate-art-studio"
      data-creation-companion-panel="absent"
      data-creation-interaction-owner="current_focus"
    >
      <CreateEstateRoomShell onOutsideDismiss={onBack}>
        <div
          className="plan-day-morning-note flex flex-col gap-3"
          data-testid="create-estate-working-panel"
        >
          <AppBackButton
            destination={CREATE_BACK_TO_FOCUS_DESTINATION}
            onBack={onBack}
            size="compact"
          />

          <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {renaming ? (
                  <form
                    className="flex flex-wrap items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const next = renameDraft.trim();
                      if (next && onRenameTitle) {
                        onRenameTitle(next);
                      }
                      setRenaming(false);
                    }}
                  >
                    <input
                      value={renameDraft}
                      onChange={(e) => setRenameDraft(e.target.value)}
                      className="min-w-[12rem] rounded-lg border border-[#cfc6b8] bg-white px-3 py-2 text-lg font-semibold text-[#1f1c19]"
                      aria-label="Rename this work"
                      data-testid="create-estate-rename-input"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-[#3d3429] px-3 py-2 text-sm font-semibold text-[#f7f2ea]"
                      data-testid="create-estate-rename-save"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="rounded-lg px-3 py-2 text-sm text-[#6b635a]"
                      onClick={() => setRenaming(false)}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <h1
                      className="plan-day-morning-note__title"
                      data-testid="create-estate-working-title"
                      data-creation-workspace={
                        isEventWorkspace ? "event" : "create"
                      }
                    >
                      {workspaceTitle}
                    </h1>
                    {onRenameTitle ? (
                      <button
                        type="button"
                        className="rounded-lg border border-[#d4cdc3] bg-white/80 px-2.5 py-1 text-sm text-[#4b463f] hover:bg-[#f5f0e8]"
                        data-testid="create-estate-rename"
                        data-primary-action="save"
                        aria-label="Rename this work"
                        onClick={() => {
                          setRenameDraft(workspaceTitle);
                          setRenaming(true);
                        }}
                      >
                        Rename
                      </button>
                    ) : null}
                  </>
                )}
              </div>
              <p
                className="mt-1 text-sm font-semibold text-[#1e4f4f]"
                data-testid="workspace-phase-label"
              >
                {typeLabel} · {statusLabel}
              </p>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#4b463f]">
                {isEventWorkspace
                  ? "Your work is already underway. We focus on what matters now — everything stays connected to this same creation."
                  : "We'll shape this together in Current Focus. The map below shows what we've gathered."}
              </p>
            </div>
            {projectWorthy && !isEventWorkspace ? (
              <div
                className="flex flex-col items-stretch gap-2 sm:items-end"
                data-testid="create-estate-project-bridge"
              >
                {projectHomeId ? (
                  <button
                    type="button"
                    onClick={onOpenProjectHome}
                    className="rounded-xl border border-[#1e4f4f]/35 bg-[#f0f5f5] px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#e4eded]"
                    data-testid="create-open-project-home"
                  >
                    Open related work
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onConnectProjectHome}
                    className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
                    data-testid="create-connect-project-home"
                  >
                    Track execution quietly
                  </button>
                )}
              </div>
            ) : null}
          </div>

          <CreateWorkCommandToolbar
            workflow={workflow}
            onWorkflowChange={onWorkflowChange}
            onRename={
              onRenameTitle
                ? () => {
                    setRenameDraft(workspaceTitle);
                    setRenaming(true);
                  }
                : undefined
            }
            onSave={() => {
              // Durable save path is Current Focus Save — surface it.
              document
                .getElementById("workspace-current-focus")
                ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              (
                document.querySelector(
                  '[data-testid="current-focus-save"]',
                ) as HTMLButtonElement | null
              )?.focus();
            }}
          />

          {workflow.workspaceKnownFacts &&
          workflow.workspaceKnownFacts.length > 0 ? (
            <section
              className="mt-3 max-w-2xl rounded-2xl border border-[#e7dfd4] bg-[#faf7f2]/90 px-4 py-3"
              data-testid="workspace-what-we-know"
              aria-labelledby="workspace-what-we-know-heading"
            >
              <h2
                id="workspace-what-we-know-heading"
                className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]"
              >
                What We Already Know
              </h2>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-[#4b463f]">
                {workflow.workspaceKnownFacts.map((fact, index) => {
                  // 072 — stable keys: prefer sectionId prefix before colon; never raw label alone
                  const colon = fact.indexOf(":");
                  const keyBase =
                    colon > 0 ? fact.slice(0, colon).trim().toLowerCase() : fact;
                  return (
                    <li key={`fact-${keyBase}-${index}`}>{fact}</li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <section
            id="workspace-current-focus"
            className="mt-3 max-w-2xl rounded-2xl border border-[#c9bfb0] bg-white/90 px-4 py-3 shadow-sm"
            data-testid="workspace-current-focus"
            aria-labelledby="workspace-current-focus-heading"
          >
            <h2
              id="workspace-current-focus-heading"
              className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]"
            >
              Current Focus
            </h2>
            <p className="mt-1 text-lg font-semibold text-[#1f1c19]">
              {canonicalFocus.title}
            </p>
            {canonicalFocus.purpose &&
            canonicalFocus.purpose.trim() !==
              canonicalFocus.prompt.trim() ? (
              <p className="mt-1 text-sm leading-relaxed text-[#4b463f]">
                {canonicalFocus.purpose}
              </p>
            ) : null}

            <CurrentFocusInteraction
              key={canonicalFocus.focusId}
              focus={{
                ...canonicalFocus,
                // Never echo purpose as intro when they match.
                introductoryGuidance:
                  canonicalFocus.introductoryGuidance &&
                  canonicalFocus.introductoryGuidance.trim() !==
                    canonicalFocus.purpose.trim() &&
                  canonicalFocus.introductoryGuidance.trim() !==
                    canonicalFocus.prompt.trim()
                    ? canonicalFocus.introductoryGuidance
                    : null,
              }}
              guidance={
                guidance &&
                guidance.trim() !== canonicalFocus.purpose.trim() &&
                guidance.trim() !== canonicalFocus.prompt.trim()
                  ? guidance
                  : null
              }
              failureMessage={focusFailure}
              submitting={focusSubmitting}
              lastDurableOk={lastDurableOk}
              initialResponse={preservedResponse}
              failedFocusId={
                focusFailure && preservedResponse ? canonicalFocus.focusId : null
              }
              onSubmit={(response) => {
                setLocalGuidance(null);
                onSubmitCurrentFocus({
                  focus: canonicalFocus,
                  response,
                  responseType: "multiline",
                });
              }}
              onIdeas={onNeedIdeasInFocus}
              onUnsure={() =>
                onSubmitCurrentFocus({
                  focus: canonicalFocus,
                  response: "",
                  responseType: "unsure",
                })
              }
              onSkip={() =>
                onSubmitCurrentFocus({
                  focus: canonicalFocus,
                  response: "",
                  responseType: "skip",
                })
              }
              onRetry={onRetryCurrentFocus}
            />

            {canonicalFocus.sectionId ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {resolveFacilitatedSectionStatus(
                  {
                    id: canonicalFocus.sectionId,
                    content:
                      workflow.sectionContent?.[canonicalFocus.sectionId] ??
                      "",
                    skipped: Boolean(
                      workflow.skippedSectionIds?.includes(
                        canonicalFocus.sectionId,
                      ),
                    ),
                  },
                  workflow,
                ) === "complete_for_now" ? (
                  <button
                    type="button"
                    data-testid="section-reopen"
                    disabled={focusSubmitting}
                    onClick={() =>
                      onWorkflowChange(
                        reopenSectionForEditing(
                          workflow,
                          canonicalFocus.sectionId!,
                        ),
                      )
                    }
                    className="rounded-xl border border-[#1e4f4f]/30 bg-white px-3 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] disabled:opacity-40"
                  >
                    Reopen
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid="section-complete-for-now"
                    disabled={focusSubmitting}
                    onClick={() =>
                      onWorkflowChange(
                        markSectionCompleteForNow(
                          workflow,
                          canonicalFocus.sectionId!,
                        ),
                      )
                    }
                    className="rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-sm font-semibold text-[#4b463f] hover:bg-[#faf7f2] disabled:opacity-40"
                  >
                    Complete for Now
                  </button>
                )}
              </div>
            ) : null}

            <button
              type="button"
              onClick={onBuildDraftInFocus}
              disabled={building || focusSubmitting}
              className="mt-2 text-sm font-semibold text-[#1e4f4f] underline disabled:opacity-40"
              data-testid="current-focus-build-draft"
            >
              {building ? "Building your draft…" : "Build a draft here"}
            </button>

            {workflow.workspaceSecondaryRecommendations &&
            workflow.workspaceSecondaryRecommendations.length > 0 ? (
              <div
                className="mt-3 border-t border-[#e7dfd4] pt-3"
                data-testid="workspace-secondary-recommendations"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
                  Other good options
                </p>
                <ul className="mt-1.5 flex flex-col gap-1 text-sm text-[#4b463f]">
                  {workflow.workspaceSecondaryRecommendations
                    .slice(0, 3)
                    .map((rec) => (
                      <li key={rec.title}>
                        <span className="font-semibold text-[#1f1c19]">
                          {rec.title}
                        </span>
                        {rec.reason ? (
                          <span className="text-[#6b635a]">
                            {" "}
                            — {rec.reason}
                          </span>
                        ) : null}
                      </li>
                    ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section
            className="mt-4 max-w-2xl"
            data-testid="workspace-full-map-disclosure"
            aria-label="Full Workshop Map"
          >
            <h2 className="mb-2 text-sm font-semibold text-[#4b463f]">
              {`Full ${typeLabel.replace(/\s*plan$/i, "").trim() || "Work"} Workshop Map`}
            </h2>
            <p className="mb-3 text-xs leading-relaxed text-[#6b635a]">
              Every section is openable. Tap a row to work on it in Current Focus —
              nothing stays locked.
            </p>
            <CreateWorkspaceV2Panel
              workflow={workflow}
              workspacePhase={workspacePhase}
              loadingMessageIndex={loadingMessageIndex}
              building={building}
              highlightSectionId={
                highlightSectionId ?? workflow.activeSectionId ?? null
              }
              highlightKey={highlightKey}
              presentation="estate"
              onWorkflowChange={onWorkflowChange}
              onNeedIdeas={() => onNeedIdeasInFocus()}
              onBuildDraft={onBuildDraftInFocus}
              onDeleteDraft={onDeleteDraft}
              onOpenSection={(sectionId) => {
                onWorkflowChange(openWorkshopMapSection(workflow, sectionId));
                requestAnimationFrame(() => {
                  document
                    .getElementById("workspace-current-focus")
                    ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                });
              }}
            />
          </section>
        </div>
      </CreateEstateRoomShell>
    </div>
  );
}
