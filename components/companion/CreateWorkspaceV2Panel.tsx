"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { ConfirmDialog } from "@/components/companion/ConfirmDialog";
import { SparkLoadingState } from "@/components/companion/SparkThinkingFlame";
import { MicButton } from "@/components/companion/MicButton";
import { appendVoiceText } from "@/components/companion/VoiceAnswerField";
import { BUILD_DRAFT_LOADING_MESSAGES } from "@/lib/createTemplates";
import type { CreateWorkspacePhase } from "@/lib/createBuild";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { userFacingCreateTypeLabel } from "@/lib/createTypePickers";
import { resolvedTypeLabel } from "@/lib/createWorkflow";
import {
  addWorkspaceV2Section,
  deleteWorkspaceV2Section,
  loadWorkspaceV2Blueprint,
  moveWorkspaceV2Section,
  reorderWorkspaceV2Sections,
  renameWorkspaceV2Section,
  saveWorkspaceV2Blueprint,
  savedBlueprintsForWorkflow,
  toggleWorkspaceV2SectionSkipped,
  updateWorkspaceV2DisplayTitle,
  updateWorkspaceV2SectionContent,
  workspaceV2DisplayTitle,
  workspaceV2HasBuildableContent,
  workspaceV2Sections,
} from "@/lib/createWorkspaceV2";
import {
  FACILITATED_SECTION_STATUS_LABELS,
  resolveFacilitatedSectionStatus,
} from "@/lib/facilitatedCreation";

const SECTION_FIELD_CLS =
  "min-h-[7rem] w-full flex-1 resize-y rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] whitespace-pre-wrap outline-none focus:border-[#1e4f4f] focus:ring-2 focus:ring-[#1e4f4f]/10";

/** Multiline field — grows with content; paste-friendly spacing from chat. */
function SectionContentField({
  value,
  onChange,
  placeholder,
  micTitle,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  micTitle?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(112, el.scrollHeight)}px`;
  }, [value]);

  return (
    <div className="flex items-start gap-2">
      <textarea
        ref={ref}
        data-no-drag
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        spellCheck
        className={SECTION_FIELD_CLS}
      />
      <MicButton
        onText={(t) => onChange(appendVoiceText(value, t))}
        title={micTitle ?? "Voice input"}
      />
    </div>
  );
}

function SectionCard({
  section,
  index,
  total,
  isDragging,
  isDragTarget,
  isHighlighted,
  highlightStamp,
  onContentChange,
  onNeedIdeas,
  ideasLabel = "Need Ideas",
  onToggleSkipped,
  onRename,
  onDelete,
  onMoveUp,
  onMoveDown,
  onBeginDrag,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  sectionStatus,
  onOpenSection,
  isActiveFocus,
}: {
  section: ReturnType<typeof workspaceV2Sections>[number];
  index: number;
  total: number;
  isDragging: boolean;
  isDragTarget: boolean;
  isHighlighted: boolean;
  highlightStamp: number;
  sectionStatus: string;
  onContentChange: (content: string) => void;
  onNeedIdeas: () => void;
  ideasLabel?: string;
  onToggleSkipped: () => void;
  onRename: (label: string) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onBeginDrag: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent) => void;
  onDragEnd: () => void;
  /** 077 — whole-row open into Current Focus */
  onOpenSection?: () => void;
  isActiveFocus?: boolean;
}) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(section.label);
  const canMoveUp = index > 0;
  const canMoveDown = index < total - 1;
  const cardRef = useRef<HTMLDivElement>(null);
  const [pulseHighlight, setPulseHighlight] = useState(false);

  useEffect(() => {
    if (!isHighlighted || !highlightStamp) return;
    setPulseHighlight(true);
    const el = cardRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
    const timer = window.setTimeout(() => setPulseHighlight(false), 2400);
    return () => window.clearTimeout(timer);
  }, [isHighlighted, highlightStamp]);

  return (
    <div
      ref={cardRef}
      draggable={!onOpenSection}
      onDragStart={onBeginDrag}
      onDragEnd={onDragEnd}
      role={onOpenSection ? "button" : undefined}
      tabIndex={onOpenSection ? 0 : undefined}
      onClick={
        onOpenSection
          ? (e) => {
              const target = e.target as HTMLElement;
              if (target.closest("[data-no-drag]")) return;
              onOpenSection();
            }
          : undefined
      }
      onKeyDown={
        onOpenSection
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenSection();
              }
            }
          : undefined
      }
      aria-label={`${section.label} — ${onOpenSection ? "open section" : "drag to reorder"}`}
      data-testid={`workshop-map-row-${section.id}`}
      data-active-focus={isActiveFocus ? "true" : undefined}
      className={`rounded-xl border px-3 py-3 transition-colors ${
        isDragging
          ? "cursor-grabbing border-[#1e4f4f]/40 bg-[#f0f5f5] opacity-60 shadow-md"
          : section.skipped
            ? "border-[#e7dfd4] bg-[#f5f2ed] opacity-80"
            : isActiveFocus || pulseHighlight
              ? "border-[#1e4f4f] bg-[#f0f5f5] ring-2 ring-[#1e4f4f]/35"
              : isDragTarget
                ? "border-[#1e4f4f] bg-[#f0f5f5] ring-2 ring-[#1e4f4f]/20"
                : "border-[#d4cdc3] bg-white"
      } ${onOpenSection ? "cursor-pointer hover:border-[#1e4f4f]/40" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex items-stretch gap-2">
        {!onOpenSection ? (
          <div
            className="flex w-7 shrink-0 cursor-grab flex-col items-center justify-center rounded-lg text-[#9a8f82] hover:bg-[#f5f2ed] active:cursor-grabbing"
            title="Drag to reorder"
            aria-hidden
          >
            <span className="text-sm leading-none tracking-tighter">⋮⋮</span>
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            {editingLabel ? (
              <input
                type="text"
                data-no-drag
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                onBlur={() => {
                  onRename(labelDraft);
                  setEditingLabel(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onRename(labelDraft);
                    setEditingLabel(false);
                  }
                }}
                className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] px-2 py-1 text-sm font-semibold text-[#1f1c19]"
                autoFocus
              />
            ) : onOpenSection ? (
              <span className="text-sm font-semibold text-[#1f1c19]">
                {section.label}
              </span>
            ) : (
              <button
                type="button"
                data-no-drag
                onClick={() => {
                  setLabelDraft(section.label);
                  setEditingLabel(true);
                }}
                className="text-left text-sm font-semibold text-[#1f1c19] hover:text-[#1e4f4f]"
                title="Rename section"
              >
                {section.label}
              </button>
            )}
            <div className="flex flex-wrap items-center gap-1">
              <span className="rounded-full border border-[#e7dfd4] bg-[#faf7f2] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[#6b635a]">
                {sectionStatus}
              </span>
              {onOpenSection ? (
                <button
                  type="button"
                  data-no-drag
                  data-testid={`workshop-map-open-${section.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSection();
                  }}
                  className="rounded-lg border border-[#1e4f4f]/30 bg-[#1e4f4f] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#163b3b]"
                >
                  {isActiveFocus
                    ? "Working here"
                    : !section.content.trim() && !section.skipped
                      ? "Start"
                      : "Open"}
                </button>
              ) : null}
              <button
                type="button"
                data-no-drag
                disabled={!canMoveUp}
                onClick={onMoveUp}
                className="rounded-lg border border-[#e7dfd4] px-2 py-1 text-xs font-semibold text-[#6b635a] hover:bg-[#faf7f2] disabled:cursor-not-allowed disabled:opacity-30"
                title="Move up"
                aria-label={`Move ${section.label} up`}
              >
                ↑
              </button>
              <button
                type="button"
                data-no-drag
                disabled={!canMoveDown}
                onClick={onMoveDown}
                className="rounded-lg border border-[#e7dfd4] px-2 py-1 text-xs font-semibold text-[#6b635a] hover:bg-[#faf7f2] disabled:cursor-not-allowed disabled:opacity-30"
                title="Move down"
                aria-label={`Move ${section.label} down`}
              >
                ↓
              </button>
              <button
                type="button"
                data-no-drag
                onClick={onNeedIdeas}
                className="rounded-lg border border-[#1e4f4f]/25 bg-[#f0f5f5] px-2 py-1 text-xs font-semibold text-[#1e4f4f] hover:bg-[#e4eded]"
              >
                {ideasLabel}
              </button>
              <button
                type="button"
                data-no-drag
                onClick={onToggleSkipped}
                className="rounded-lg border border-[#e7dfd4] px-2 py-1 text-xs font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
              >
                {section.skipped ? "Undo skip" : "Skip for now"}
              </button>
              <button
                type="button"
                data-no-drag
                onClick={onDelete}
                className="rounded-lg border border-[#e8c4c4] px-2 py-1 text-xs font-semibold text-[#8b4545] hover:bg-[#fdf5f5]"
                title="Remove section"
              >
                Delete
              </button>
            </div>
          </div>

          {section.skipped ? (
            <p className="mt-2 text-sm italic text-[#9a8f82]">
              Marked N/A — skipped in your draft.
            </p>
          ) : (
            <div className="mt-3" data-no-drag>
              <SectionContentField
                value={section.content}
                onChange={onContentChange}
                placeholder={`Notes for ${section.label}…`}
                micTitle={`Speak notes for ${section.label}`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CreateWorkspaceV2Panel({
  workflow,
  workspacePhase,
  loadingMessageIndex = 0,
  errorMessage,
  building = false,
  highlightSectionId = null,
  highlightKey = 0,
  presentation = "split",
  onWorkflowChange,
  onNeedIdeas,
  onBuildDraft,
  onDeleteDraft,
  onTryAgain,
  onOpenSection,
}: {
  workflow: CreateWorkflowState;
  workspacePhase: CreateWorkspacePhase;
  loadingMessageIndex?: number;
  errorMessage?: string | null;
  building?: boolean;
  /** Scroll to and briefly highlight after chat acceptance. */
  highlightSectionId?: string | null;
  highlightKey?: number;
  /**
   * Estate (066) — presentation only. Answers live in Current Focus.
   * Split — legacy ContentGeneratorPanel (quarantined from Estate Creation).
   */
  presentation?: "split" | "estate";
  onWorkflowChange: (next: CreateWorkflowState) => void;
  onNeedIdeas: (sectionId: string, sectionLabel: string) => void;
  onBuildDraft: () => void;
  onDeleteDraft?: () => void;
  onTryAgain?: () => void;
  /** 077 — open map row into Current Focus (sets activeSectionId). */
  onOpenSection?: (sectionId: string) => void;
}) {
  const estatePresentation = presentation === "estate";
  const typeLabel = resolvedTypeLabel(workflow);
  const displayType = userFacingCreateTypeLabel(typeLabel) ?? typeLabel ?? "Create";
  const workspaceTitle = workspaceV2DisplayTitle(workflow);
  const allSections = workspaceV2Sections(workflow);
  const isEventWorkspace = workflow.creationWorkspaceKind === "event";
  const focusSet = new Set(workflow.focusSectionIds ?? []);
  /** 077 — Full Workshop Map for every Work Type; focus subset is optional collapse. */
  const showAll =
    Boolean(workflow.showAllWorkspaceSections) || focusSet.size === 0;
  const sections = showAll
    ? allSections
    : allSections.filter((s) => focusSet.has(s.id) || s.content.trim());
  const hiddenCount = showAll ? 0 : allSections.length - sections.length;
  const canBuild = workspaceV2HasBuildableContent(workflow);
  const filledCount = allSections.filter(
    (s) => s.skipped || s.content.trim(),
  ).length;
  const savedBlueprints = savedBlueprintsForWorkflow(workflow);
  const [dragSectionId, setDragSectionId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const dragSectionIdRef = useRef<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(workspaceTitle);
  const [blueprintName, setBlueprintName] = useState(
    workflow.selectedTemplateName?.trim() || workspaceTitle,
  );
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const [confirmDeleteDraft, setConfirmDeleteDraft] = useState(false);

  function handleReorder(fromId: string, toId: string) {
    if (fromId === toId) return;
    const fromIndex = sections.findIndex((s) => s.id === fromId);
    const toIndex = sections.findIndex((s) => s.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    onWorkflowChange(reorderWorkspaceV2Sections(workflow, fromIndex, toIndex));
  }

  // 066 / 077 — Estate: Full Workshop Map (clickable). Answers stay in Current Focus.
  if (estatePresentation) {
    const draft = workflow.draftContent?.trim() || "";
    const mapSections = showAll
      ? allSections
      : allSections.filter((s) => focusSet.has(s.id) || s.content.trim());
    const mapHidden = allSections.length - mapSections.length;

    return (
      <div
        className="flex flex-col gap-4"
        data-testid="create-workspace-v2-presentation"
        data-answer-capture="disabled"
        data-creation-interaction-owner="current_focus"
        data-workshop-map="estate"
      >
        <p className="text-sm leading-relaxed text-[#4b463f]">
          Every section opens in Current Focus above. Tap a row to work on it —
          nothing stays locked.
        </p>

        {!showAll && mapHidden > 0 ? (
          <button
            type="button"
            className="w-full rounded-xl border border-[#c9bfb0] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
            data-testid="workshop-map-show-full"
            onClick={() =>
              onWorkflowChange({
                ...workflow,
                showAllWorkspaceSections: true,
              })
            }
          >
            Show full workshop map ({mapHidden} more sections)
          </button>
        ) : null}
        {showAll && focusSet.size > 0 ? (
          <button
            type="button"
            className="w-full rounded-xl border border-transparent px-4 py-2 text-sm font-semibold text-[#6b635a] hover:text-[#1e4f4f]"
            data-testid="workshop-map-show-focus"
            onClick={() =>
              onWorkflowChange({
                ...workflow,
                showAllWorkspaceSections: false,
              })
            }
          >
            Show what matters now
          </button>
        ) : null}

        <ul className="flex flex-col gap-2" role="list" aria-label="Full Workshop Map">
          {mapSections.map((section) => {
            const status = resolveFacilitatedSectionStatus(section, workflow);
            const label = FACILITATED_SECTION_STATUS_LABELS[status];
            const isActive = workflow.activeSectionId === section.id;
            const openLabel = isActive
              ? "Working here"
              : !section.content.trim() && !section.skipped
                ? "Start"
                : "Open";
            const open = () => onOpenSection?.(section.id);

            return (
              <li key={section.id} className="list-none">
                <button
                  type="button"
                  onClick={open}
                  disabled={!onOpenSection}
                  data-testid={`workshop-map-row-${section.id}`}
                  data-active-focus={isActive ? "true" : undefined}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={`${section.label} — ${openLabel}`}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    isActive
                      ? "border-[#1e4f4f] bg-[#f0f5f5] ring-2 ring-[#1e4f4f]/30"
                      : "border-[#e7dfd4] bg-white/70 hover:border-[#1e4f4f]/40 hover:bg-[#f7faf9]"
                  } ${!onOpenSection ? "cursor-default opacity-90" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#1f1c19]">
                      {section.label}
                    </span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="rounded-full border border-[#e7dfd4] bg-[#faf7f2] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[#6b635a]">
                        {label}
                      </span>
                      {onOpenSection ? (
                        <span
                          data-testid={`workshop-map-open-${section.id}`}
                          className="rounded-lg border border-[#1e4f4f]/30 bg-[#1e4f4f] px-2.5 py-1 text-xs font-semibold text-white"
                        >
                          {openLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {section.skipped ? (
                    <p className="mt-1 text-sm italic text-[#9a8f82]">
                      Skipped for now — still openable anytime
                    </p>
                  ) : section.content.trim() ? (
                    <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm leading-relaxed text-[#4b463f]">
                      {section.content.trim()}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-[#9a8f82]">
                      Not started — open to begin in Current Focus
                    </p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        {draft ? (
          <div
            className="rounded-2xl border border-[#c9bfb0] bg-white/90 px-4 py-3"
            data-testid="workspace-draft-present"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
              Working draft
            </p>
            <div className="mt-2 max-h-[40vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-[#1f1c19]">
              {draft}
            </div>
          </div>
        ) : null}
        <p className="text-xs text-[#9a8f82]">
          {filledCount} of {allSections.length} sections have notes
          {mapHidden > 0 ? ` · ${mapHidden} more in the full map` : ""}
        </p>
      </div>
    );
  }

  if (workspacePhase === "generating") {
    return (
      <div className="flex flex-1 flex-col justify-center px-4 py-6">
        <div className="companion-fade-in mx-auto w-full max-w-lg rounded-2xl border border-[#d4cdc3] bg-white/85 p-5 shadow-sm">
          <SparkLoadingState
            message={`Creating your ${displayType}…`}
            size="lg"
          />
          <p className="mt-2 text-center text-sm text-[#6b635a]">
            {BUILD_DRAFT_LOADING_MESSAGES[loadingMessageIndex]}
          </p>
        </div>
      </div>
    );
  }

  if (workspacePhase === "error") {
    return (
      <div className="flex flex-1 flex-col justify-center px-4 py-6">
        <div className="companion-fade-in mx-auto w-full max-w-lg rounded-2xl border border-[#e8c4c4] bg-[#fdf5f5] p-5 shadow-sm">
          <p className="text-lg font-semibold text-[#6b3a3a]">Something went wrong</p>
          <p className="mt-2 text-sm text-[#6b3a3a]">
            {errorMessage ?? "Try Build Draft again."}
          </p>
          {onTryAgain ? (
            <button
              type="button"
              onClick={onTryAgain}
              className="mt-4 w-full rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        estatePresentation
          ? "flex min-h-0 flex-1 flex-col"
          : "flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4"
      }
      data-create-v2-presentation={presentation}
    >
      <div
        className={
          estatePresentation
            ? "companion-fade-in flex w-full flex-1 flex-col"
            : "companion-fade-in mx-auto flex w-full max-w-lg flex-1 flex-col"
        }
      >
        {estatePresentation ? null : (
          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
            Your workspace
          </p>
        )}
        {estatePresentation ? null : (
        <h2 className="mt-1 text-lg font-semibold text-[#1f1c19]">
          {editingTitle ? (
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => {
                onWorkflowChange(updateWorkspaceV2DisplayTitle(workflow, titleDraft));
                setEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onWorkflowChange(updateWorkspaceV2DisplayTitle(workflow, titleDraft));
                  setEditingTitle(false);
                }
              }}
              className="w-full rounded-lg border border-[#c9bfb0] px-2 py-1 text-lg font-semibold"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setTitleDraft(workspaceTitle);
                setEditingTitle(true);
              }}
              className="text-left hover:text-[#1e4f4f]"
              title="Rename this project"
            >
              {workspaceTitle}
            </button>
          )}
        </h2>
        )}
        {estatePresentation ? (
          <p className="text-xs text-[#6b635a]">
            {isEventWorkspace
              ? `${filledCount} of ${allSections.length} sections have progress · showing ${
                  showAll ? "full map" : "what matters now"
                } · drag or use ↑ ↓ to reorder`
              : `${filledCount} of ${sections.length} sections started · drag or use ↑ ↓ to reorder`}
          </p>
        ) : (
          <>
        <p className="mt-2 text-sm leading-relaxed text-[#6b635a]">
          {isEventWorkspace
            ? "Your foundation is already here. We shape the next pieces together — only what you confirm fills each box."
            : "Sections start empty — we shape them together. Share what you know in the conversation; only what you confirm fills each box. When you're ready,"}{" "}
          {!isEventWorkspace ? (
            <>
              <span className="font-semibold text-[#1f1c19]"> Build Draft</span> turns your
              notes into a working draft you can keep shaping, print, or export.
            </>
          ) : null}
        </p>
        <p className="mt-1 text-xs text-[#9a8f82]">
          {filledCount} of {sections.length} sections have content or are N/A · drag a
          section or use ↑ ↓ to reorder
        </p>
          </>
        )}

        {!showAll && hiddenCount > 0 ? (
          <button
            type="button"
            className="mt-3 w-full rounded-xl border border-[#c9bfb0] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
            data-testid="workshop-map-show-full"
            onClick={() =>
              onWorkflowChange({
                ...workflow,
                showAllWorkspaceSections: true,
              })
            }
          >
            Show full workshop map ({hiddenCount} more sections)
          </button>
        ) : null}
        {showAll && (workflow.focusSectionIds?.length ?? 0) > 0 ? (
          <button
            type="button"
            className="mt-3 w-full rounded-xl border border-transparent px-4 py-2 text-sm font-semibold text-[#6b635a] hover:text-[#1e4f4f]"
            data-testid="workshop-map-show-focus"
            onClick={() =>
              onWorkflowChange({
                ...workflow,
                showAllWorkspaceSections: false,
              })
            }
          >
            Show what matters now
          </button>
        ) : null}

        <div className="mt-4 flex-1 space-y-3">
          {sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              total={sections.length}
              isDragging={dragSectionId === section.id}
              isDragTarget={dropTargetId === section.id && dragSectionId !== section.id}
              isHighlighted={highlightSectionId === section.id}
              highlightStamp={
                highlightSectionId === section.id ? highlightKey : 0
              }
              sectionStatus={
                FACILITATED_SECTION_STATUS_LABELS[
                  resolveFacilitatedSectionStatus(section, workflow)
                ]
              }
              onContentChange={(content) =>
                onWorkflowChange(
                  updateWorkspaceV2SectionContent(workflow, section.id, content),
                )
              }
              onNeedIdeas={() => onNeedIdeas(section.id, section.label)}
              ideasLabel={
                isEventWorkspace ? "Create related" : "Need Ideas"
              }
              onOpenSection={
                onOpenSection
                  ? () => onOpenSection(section.id)
                  : undefined
              }
              isActiveFocus={workflow.activeSectionId === section.id}
              onToggleSkipped={() =>
                onWorkflowChange(toggleWorkspaceV2SectionSkipped(workflow, section.id))
              }
              onRename={(label) =>
                onWorkflowChange(renameWorkspaceV2Section(workflow, section.id, label))
              }
              onDelete={() =>
                onWorkflowChange(deleteWorkspaceV2Section(workflow, section.id))
              }
              onMoveUp={() =>
                onWorkflowChange(moveWorkspaceV2Section(workflow, section.id, "up"))
              }
              onMoveDown={() =>
                onWorkflowChange(moveWorkspaceV2Section(workflow, section.id, "down"))
              }
              onBeginDrag={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("[data-no-drag]")) {
                  e.preventDefault();
                  return;
                }
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", section.id);
                dragSectionIdRef.current = section.id;
                setDragSectionId(section.id);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                const fromId = dragSectionIdRef.current;
                if (fromId && fromId !== section.id) {
                  setDropTargetId(section.id);
                }
              }}
              onDragLeave={() => {
                if (dropTargetId === section.id) setDropTargetId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromId =
                  dragSectionIdRef.current ?? e.dataTransfer.getData("text/plain");
                if (fromId) handleReorder(fromId, section.id);
                dragSectionIdRef.current = null;
                setDragSectionId(null);
                setDropTargetId(null);
              }}
              onDragEnd={() => {
                dragSectionIdRef.current = null;
                setDragSectionId(null);
                setDropTargetId(null);
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => onWorkflowChange(addWorkspaceV2Section(workflow))}
          className="mt-3 w-full rounded-xl border border-dashed border-[#c9bfb0] px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
        >
          + Add Section
        </button>

        <div className="mt-5 rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#1f1c19]">Save blueprint</p>
          <p className="mt-1 text-xs leading-relaxed text-[#6b635a]">
            Save this section layout and order to reuse later — name it something you&apos;ll
            recognize.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={blueprintName}
              onChange={(e) => setBlueprintName(e.target.value)}
              placeholder="e.g. Letter to friend, Weekly newsletter…"
              className="min-w-0 flex-1 rounded-xl border border-[#d4cdc3] bg-white px-3 py-2.5 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            />
            <button
              type="button"
              disabled={!blueprintName.trim()}
              onClick={() => {
                const result = saveWorkspaceV2Blueprint(workflow, blueprintName);
                if (result) {
                  onWorkflowChange(result.workflow);
                  setSaveNote(`Saved blueprint “${result.saved.name}”.`);
                  window.setTimeout(() => setSaveNote(null), 4000);
                }
              }}
              className="shrink-0 rounded-xl border border-[#1e4f4f]/30 bg-[#f0f5f5] px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#e4eded] disabled:opacity-40"
            >
              Save for later
            </button>
          </div>
          {saveNote ? (
            <p className="mt-2 text-xs font-semibold text-[#1e4f4f]">{saveNote}</p>
          ) : null}
          {savedBlueprints.length > 0 ? (
            <div className="mt-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
                Load saved blueprint
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-[#d4cdc3] bg-white px-3 py-2.5 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                value={workflow.selectedTemplateId ?? ""}
                onChange={(e) => {
                  const id = e.target.value;
                  if (!id) return;
                  const next = loadWorkspaceV2Blueprint(workflow, id);
                  if (next) onWorkflowChange(next);
                }}
              >
                <option value="">Choose a saved blueprint…</option>
                {savedBlueprints.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <div className="mt-4 rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 shadow-sm">
          <ConfirmDialog
            open={confirmDeleteDraft}
            title="Delete this draft permanently?"
            message="This cannot be undone."
            confirmLabel="Delete"
            cancelLabel="Cancel"
            destructive
            onCancel={() => setConfirmDeleteDraft(false)}
            onConfirm={() => {
              setConfirmDeleteDraft(false);
              onDeleteDraft?.();
            }}
          />
          <button
            type="button"
            disabled={building || !canBuild}
            onClick={onBuildDraft}
            className="w-full rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {building ? `Creating your ${workspaceTitle}…` : "Build Draft"}
          </button>
          {onDeleteDraft ? (
            <button
              type="button"
              disabled={building}
              onClick={() => setConfirmDeleteDraft(true)}
              className="mt-2 w-full rounded-xl border border-[#e8c4c4] bg-white px-4 py-2.5 text-sm font-semibold text-[#a85c4a] hover:bg-[#fdf5f5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Delete Draft
            </button>
          ) : null}
          {!canBuild ? (
            <p className="mt-2 text-center text-xs leading-relaxed text-[#9a8f82]">
              Add content to at least one section (or mark sections N/A), then build.
            </p>
          ) : (
            <p className="mt-2 text-center text-xs leading-relaxed text-[#9a8f82]">
              After the draft appears, you can edit, add, print, copy, or export.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
