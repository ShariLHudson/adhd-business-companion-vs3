"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppBackButton } from "@/components/companion/AppBackButton";
import { CreateEstateRoomShell } from "@/components/companion/CreateEstateRoomShell";
import { CreateWorkspaceV2Panel } from "@/components/companion/CreateWorkspaceV2Panel";
import { CreateWorkCommandToolbar } from "@/components/companion/CreateWorkCommandToolbar";
import { CurrentFocusInteraction } from "@/components/companion/CurrentFocusInteraction";
import { ConnectedWorkDisclosure } from "@/components/companion/ConnectedWorkDisclosure";
import { SparkBlueprintHome } from "@/components/companion/SparkBlueprintHome";
import {
  BlueprintDepthControls,
  SaveAsBlueprintReviewPanel,
} from "@/components/companion/universalBlueprint";
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
import { runCreateAssistance } from "@/lib/createContextualAssistance";
import { resolveFacilitatedSectionStatus } from "@/lib/facilitatedCreation";
import {
  completeItNow,
  getWorkBlueprintState,
  saveStructureAsBlueprint,
} from "@/lib/universalWorkEngine";
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
  /** Focus id at submit start — owns preserved failure text after async save. */
  const submittingFocusIdRef = useRef<string | null>(null);
  const failedFocusIdRef = useRef<string | null>(null);

  const activeSectionContent =
    workflow.activeSectionId && workflow.sectionContent
      ? workflow.sectionContent[workflow.activeSectionId] ?? ""
      : "";
  const canonicalFocus = useMemo(
    () => resolveFocusForCreationDestination(workflow),
    [
      workflow.eventRecordId,
      workflow.sessionId,
      workflow.activeSectionId,
      activeSectionContent,
      workflow.sectionContent,
      workflow.skippedSectionIds,
      workflow.completedSectionIds,
      workflow.workspaceCurrentFocus?.title,
      workflow.workspaceCurrentFocus?.sectionId,
      workflow.workspaceKnownFacts?.join("|"),
      workflow.draftContent,
      workflow.selectedTypeLabel,
    ],
  );

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

  // Lock failure ownership to the Focus that was submitting — not the map target.
  useEffect(() => {
    if (focusSubmitting && canonicalFocus?.focusId) {
      submittingFocusIdRef.current = canonicalFocus.focusId;
    }
  }, [focusSubmitting, canonicalFocus?.focusId]);

  useEffect(() => {
    if (focusFailure && preservedResponse) {
      if (!failedFocusIdRef.current) {
        failedFocusIdRef.current =
          submittingFocusIdRef.current ?? canonicalFocus?.focusId ?? null;
      }
    } else if (!focusFailure) {
      failedFocusIdRef.current = null;
    }
  }, [focusFailure, preservedResponse, canonicalFocus?.focusId]);

  const [localGuidance, setLocalGuidance] = useState<string | null>(null);
  const guidance = focusGuidance ?? localGuidance;
  const [saveBlueprintOpen, setSaveBlueprintOpen] = useState(false);
  const [blueprintNameDraft, setBlueprintNameDraft] = useState("");
  const [blueprintDescDraft, setBlueprintDescDraft] = useState("");
  const [openBlueprintHomeId, setOpenBlueprintHomeId] = useState<string | null>(
    null,
  );
  const [blueprintSavedAck, setBlueprintSavedAck] = useState<string | null>(
    null,
  );
  const [saveAsBlueprintOpen, setSaveAsBlueprintOpen] = useState(false);
  const uweWorkId =
    workflow.sessionId ||
    workflow.eventRecordId ||
    canonicalFocus?.creationId ||
    null;
  const uweBlueprintState = uweWorkId
    ? getWorkBlueprintState(uweWorkId)
    : null;

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
              key={`${canonicalFocus.creationId}:${canonicalFocus.sectionId ?? canonicalFocus.focusId}`}
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
                focusFailure && preservedResponse
                  ? failedFocusIdRef.current
                  : null
              }
              onSubmit={(response) => {
                setLocalGuidance(null);
                onSubmitCurrentFocus({
                  focus: canonicalFocus,
                  response,
                  responseType: "multiline",
                });
              }}
              onIdeas={() => {
                const sectionId = canonicalFocus.sectionId;
                if (sectionId) {
                  const result = runCreateAssistance({
                    workflow,
                    sectionId,
                    actionId: "give_me_ideas",
                  });
                  setLocalGuidance(result.guidance);
                }
                onNeedIdeasInFocus();
              }}
              onUnsure={() => {
                const sectionId = canonicalFocus.sectionId;
                if (sectionId) {
                  const result = runCreateAssistance({
                    workflow,
                    sectionId,
                    actionId: "im_not_sure",
                  });
                  setLocalGuidance(result.guidance);
                }
                onSubmitCurrentFocus({
                  focus: canonicalFocus,
                  response: "",
                  responseType: "unsure",
                });
              }}
              onHelpThink={() => {
                const sectionId = canonicalFocus.sectionId;
                if (!sectionId) return;
                const result = runCreateAssistance({
                  workflow,
                  sectionId,
                  actionId: "help_me_think",
                });
                setLocalGuidance(result.guidance);
              }}
              onShowExamples={() => {
                const sectionId = canonicalFocus.sectionId;
                if (!sectionId) return;
                const result = runCreateAssistance({
                  workflow,
                  sectionId,
                  actionId: "show_examples",
                });
                setLocalGuidance(result.guidance);
              }}
              onReviewThis={() => {
                const sectionId = canonicalFocus.sectionId;
                if (!sectionId) return;
                const result = runCreateAssistance({
                  workflow,
                  sectionId,
                  actionId: "review_this",
                });
                setLocalGuidance(result.guidance);
              }}
              onSkip={() =>
                onSubmitCurrentFocus({
                  focus: canonicalFocus,
                  response: "",
                  responseType: "skip",
                })
              }
              onRetry={onRetryCurrentFocus}
            />

            <div className="mt-3 max-w-2xl">
              <ConnectedWorkDisclosure
                workId={
                  canonicalFocus.creationId ||
                  workflow.sessionId ||
                  workflow.eventRecordId ||
                  ""
                }
                sectionId={canonicalFocus.sectionId}
                onOpenProject={onOpenProjectHome}
              />
            </div>

            {/* Work-level next steps — not competing with writing this section */}
            <details
              className="mt-3 max-w-2xl rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/60 px-3 py-2"
              data-testid="section-when-ready"
            >
              <summary className="cursor-pointer text-sm font-medium text-[#6b635a]">
                When you&apos;re ready
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-[#9a8f82]">
                Finish this section first if you can. These are for after — or
                when you want to pause.
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {canonicalFocus.sectionId ? (
                  resolveFacilitatedSectionStatus(
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
                      className="rounded-xl border border-[#1e4f4f]/30 bg-white px-3 py-2 text-left text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] disabled:opacity-40"
                    >
                      Reopen this section
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
                      className="rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-left text-sm font-semibold text-[#4b463f] hover:bg-[#faf7f2] disabled:opacity-40"
                    >
                      Done with this section
                    </button>
                  )
                ) : null}
                <button
                  type="button"
                  disabled={focusSubmitting}
                  data-testid="complete-it-now"
                  onClick={() => {
                    const result = completeItNow(workflow);
                    if (!result.ok) {
                      setLocalGuidance(
                        result.validation.message ||
                          "A few sections still need a little more before we assemble the full piece.",
                      );
                      return;
                    }
                    setLocalGuidance(null);
                    onWorkflowChange(result.workflow);
                  }}
                  className="rounded-xl border border-[#1e4f4f]/25 bg-white px-3 py-2 text-left text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] disabled:opacity-40"
                >
                  Assemble the full piece
                </button>
                <button
                  type="button"
                  onClick={onBuildDraftInFocus}
                  disabled={building || focusSubmitting}
                  className="px-1 py-1 text-left text-sm font-medium text-[#6b635a] underline disabled:opacity-40"
                  data-testid="current-focus-build-draft"
                >
                  {building ? "Building your draft…" : "Build a polished draft"}
                </button>
                {uweBlueprintState && uweWorkId ? (
                  <div
                    className="rounded-xl border border-[#e7dfd4] bg-white/90 p-3"
                    data-testid="create-uwe-blueprint-controls"
                  >
                    <BlueprintDepthControls workId={uweWorkId} />
                    <button
                      type="button"
                      className="mt-3 rounded-xl border border-[#1e4f4f]/30 bg-white px-3 py-2 text-left text-sm font-semibold text-[#1e4f4f]"
                      data-testid="create-save-as-blueprint-open"
                      onClick={() => setSaveAsBlueprintOpen((o) => !o)}
                    >
                      Save as Personal or Company Blueprint…
                    </button>
                    {saveAsBlueprintOpen ? (
                      <div className="mt-3">
                        <SaveAsBlueprintReviewPanel
                          workId={uweWorkId}
                          onCancel={() => setSaveAsBlueprintOpen(false)}
                          onSaved={(blueprintId, category) => {
                            setBlueprintSavedAck(
                              category === "company"
                                ? `Saved Company Blueprint ${blueprintId}.`
                                : `Saved Personal Blueprint ${blueprintId}.`,
                            );
                            setOpenBlueprintHomeId(blueprintId);
                            setSaveAsBlueprintOpen(false);
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <button
                  type="button"
                  disabled={focusSubmitting}
                  data-testid="save-structure-as-blueprint"
                  onClick={() => {
                    setBlueprintNameDraft(
                      `${typeLabel} structure`.trim() || "My blueprint",
                    );
                    setBlueprintDescDraft("");
                    setSaveBlueprintOpen((o) => !o);
                    setBlueprintSavedAck(null);
                  }}
                  className="rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-left text-sm font-semibold text-[#4b463f] hover:bg-[#faf7f2] disabled:opacity-40"
                >
                  Save structure as blueprint
                </button>
                {saveBlueprintOpen ? (
                  <div
                    className="flex flex-col gap-2 rounded-xl border border-[#e7dfd4] bg-white/90 p-3"
                    data-testid="save-structure-as-blueprint-form"
                  >
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
                      Blueprint name
                      <input
                        className="mt-1 w-full rounded-lg border border-[#cfc6b8] px-2 py-1.5 text-sm"
                        value={blueprintNameDraft}
                        onChange={(e) => setBlueprintNameDraft(e.target.value)}
                        data-testid="save-structure-blueprint-name"
                      />
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
                      Description (optional)
                      <input
                        className="mt-1 w-full rounded-lg border border-[#cfc6b8] px-2 py-1.5 text-sm"
                        value={blueprintDescDraft}
                        onChange={(e) => setBlueprintDescDraft(e.target.value)}
                        data-testid="save-structure-blueprint-description"
                      />
                    </label>
                    <button
                      type="button"
                      data-testid="save-structure-blueprint-confirm"
                      className="rounded-lg bg-[#1e4f4f] px-3 py-2 text-sm font-semibold text-white"
                      onClick={() => {
                        try {
                          const saved = saveStructureAsBlueprint({
                            workflow,
                            name: blueprintNameDraft,
                            description: blueprintDescDraft,
                            category: "personal",
                            workId:
                              workflow.sessionId ||
                              workflow.eventRecordId ||
                              canonicalFocus.creationId,
                          });
                          setBlueprintSavedAck(
                            `Saved “${saved.title}” (${saved.blueprintId} @ ${saved.version}).`,
                          );
                          setOpenBlueprintHomeId(saved.blueprintId);
                          setSaveBlueprintOpen(false);
                        } catch (err) {
                          setLocalGuidance(
                            err instanceof Error
                              ? err.message
                              : "I couldn't save that structure just now.",
                          );
                        }
                      }}
                    >
                      Save blueprint
                    </button>
                  </div>
                ) : null}
                {blueprintSavedAck ? (
                  <p
                    className="text-xs leading-relaxed text-[#1e4f4f]"
                    data-testid="save-structure-blueprint-ack"
                  >
                    {blueprintSavedAck}
                  </p>
                ) : null}
                {openBlueprintHomeId ? (
                  <div className="mt-3">
                    <SparkBlueprintHome
                      blueprintId={openBlueprintHomeId}
                      onClose={() => setOpenBlueprintHomeId(null)}
                    />
                  </div>
                ) : null}
              </div>
            </details>

            {workflow.assembledOutput?.body ? (
              <section
                className="mt-4 rounded-2xl border border-[#c9bfb0] bg-[#faf7f2] px-4 py-3"
                data-testid="assembled-complete-piece"
                data-work-id={workflow.assembledOutput.workId}
                data-stale={workflow.assembledOutput.stale ? "true" : "false"}
              >
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
                  Complete piece
                </h3>
                {workflow.assembledOutput.stale ? (
                  <p className="mt-1 text-sm text-[#5c4030]">
                    Sections changed since this was assembled. Open “When
                    you&apos;re ready” to assemble again.
                  </p>
                ) : null}
                <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#1f1c19]">
                  {workflow.assembledOutput.body}
                </pre>
              </section>
            ) : null}

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
