"use client";

import { useEffect, useMemo, useState } from "react";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { workspaceV2Sections } from "@/lib/createWorkspaceSections";
import {
  resolveFacilitatedSectionStatus,
  FACILITATED_SECTION_STATUS_LABELS,
} from "@/lib/facilitatedCreation";
import {
  formatCategoryProgressLine,
  formatPlanProgressSummary,
  isWorkshopMapFullUnlocked,
  noteWorkshopMapVisit,
  readWorkshopMapModePreference,
  resolveFocusModeSectionIds,
  WORKSHOP_MAP_MODE_LABELS,
  writeWorkshopMapModePreference,
  type WorkshopMapPresentationMode,
} from "@/lib/createEstate/workshopMapModes";
import {
  resolveWorkshopMapForWorkflow,
  type WorkshopMapGroupView,
} from "@/lib/universalWorkEngine";

type Props = {
  workflow: CreateWorkflowState;
  onOpenSection?: (sectionId: string) => void;
  onWorkflowChange: (workflow: CreateWorkflowState) => void;
  showAll: boolean;
  focusSet: Set<string>;
};

function SectionRow({
  sectionId,
  workflow,
  onOpenSection,
}: {
  sectionId: string;
  workflow: CreateWorkflowState;
  onOpenSection?: (sectionId: string) => void;
}) {
  const section = workspaceV2Sections(workflow).find((s) => s.id === sectionId);
  if (!section) return null;
  const status = resolveFacilitatedSectionStatus(section, workflow);
  const label = FACILITATED_SECTION_STATUS_LABELS[status];
  const isActive = workflow.activeSectionId === section.id;
  const openLabel = isActive
    ? "Working here"
    : !section.content.trim() && !section.skipped
      ? "Start"
      : "Open";

  return (
    <li className="list-none">
      <button
        type="button"
        onClick={() => onOpenSection?.(section.id)}
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
}

function GroupBlock({
  group,
  open,
  onToggle,
  workflow,
  onOpenSection,
  visibleSectionIds,
}: {
  group: WorkshopMapGroupView;
  open: boolean;
  onToggle: () => void;
  workflow: CreateWorkflowState;
  onOpenSection?: (sectionId: string) => void;
  visibleSectionIds: Set<string>;
}) {
  const sectionIds = group.sectionIds.filter((id) => visibleSectionIds.has(id));
  if (!sectionIds.length) return null;
  const panelId = `workshop-map-group-panel-${group.groupId}`;
  const headerId = `workshop-map-group-header-${group.groupId}`;
  const progress = formatCategoryProgressLine({
    title: group.title,
    completedCount: group.completedCount,
    totalCount: group.totalCount,
  });

  return (
    <div
      className="rounded-2xl border border-[#e7dfd4] bg-white/60"
      data-testid={`workshop-map-group-${group.groupId}`}
      data-group-open={open ? "true" : "false"}
    >
      <h3 className="m-0">
        <button
          type="button"
          id={headerId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
          data-testid={`workshop-map-group-toggle-${group.groupId}`}
        >
          <span className="text-sm font-semibold text-[#1f1c19]">
            {group.title}
          </span>
          <span className="text-xs font-medium text-[#6b635a]">
            {progress}
            <span className="ml-2 text-[#9a8f82]" aria-hidden="true">
              {open ? "▾" : "▸"}
            </span>
          </span>
        </button>
      </h3>
      {open ? (
        <ul
          id={panelId}
          role="list"
          aria-labelledby={headerId}
          className="flex flex-col gap-2 border-t border-[#e7dfd4] px-2 py-2"
        >
          {sectionIds.map((id) => (
            <SectionRow
              key={id}
              sectionId={id}
              workflow={workflow}
              onOpenSection={onOpenSection}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Estate Workshop Map — Focus / Organized / Full modes (127).
 * Categories collapse by default; one category open at a time.
 */
export function GroupedWorkshopMap({
  workflow,
  onOpenSection,
  onWorkflowChange,
  showAll,
  focusSet,
}: Props) {
  const allSections = workspaceV2Sections(workflow);
  const completedIds = new Set(workflow.completedSectionIds ?? []);

  const resolved = useMemo(
    () =>
      resolveWorkshopMapForWorkflow(workflow, {
        activeSectionId: workflow.activeSectionId,
      }),
    [
      workflow.activeSectionId,
      workflow.sectionContent,
      workflow.templateSections,
      workflow.completedSectionIds,
      workflow.selectedTypeLabel,
      workflow.creationWorkspaceKind,
      workflow.skippedSectionIds,
    ],
  );

  const [mapMode, setMapMode] = useState<WorkshopMapPresentationMode>("focus");
  const [fullUnlocked, setFullUnlocked] = useState(false);
  const [openGroupId, setOpenGroupId] = useState<string | null>(
    () => resolved.initiallyOpenGroupIds[0] ?? null,
  );

  useEffect(() => {
    setMapMode(readWorkshopMapModePreference());
    setFullUnlocked(isWorkshopMapFullUnlocked());
    noteWorkshopMapVisit({
      completedSectionCount: completedIds.size,
    });
    // Mount-only familiarity + preference hydrate.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, []);

  useEffect(() => {
    const activeGroup = resolved.groups.find((g) =>
      g.sectionIds.includes(workflow.activeSectionId ?? ""),
    );
    if (activeGroup) {
      setOpenGroupId(activeGroup.groupId);
      return;
    }
    if (!openGroupId && resolved.initiallyOpenGroupIds[0]) {
      setOpenGroupId(resolved.initiallyOpenGroupIds[0]!);
    }
  }, [workflow.activeSectionId, resolved.groups, resolved.initiallyOpenGroupIds, openGroupId]);

  function selectMode(mode: WorkshopMapPresentationMode) {
    if (mode === "full" && !fullUnlocked && !isWorkshopMapFullUnlocked()) {
      return;
    }
    setMapMode(mode);
    writeWorkshopMapModePreference(mode);
    if (mode === "organized" || mode === "full") {
      setFullUnlocked(true);
    }
    if (mode === "full") {
      onWorkflowChange({
        ...workflow,
        showAllWorkspaceSections: true,
      });
    } else if (mode === "focus") {
      onWorkflowChange({
        ...workflow,
        showAllWorkspaceSections: false,
      });
    }
  }

  function toggleGroup(groupId: string) {
    // One category at a time (127 req 20).
    setOpenGroupId((prev) => (prev === groupId ? null : groupId));
  }

  const isSectionComplete = (sectionId: string) => {
    const section = allSections.find((s) => s.id === sectionId);
    if (!section) return false;
    if (section.skipped) return true;
    if (completedIds.has(sectionId)) return true;
    return Boolean(section.content.trim());
  };

  const focusSectionIds = useMemo(
    () =>
      resolveFocusModeSectionIds({
        orderedSectionIds: resolved.flatSectionIds.length
          ? resolved.flatSectionIds
          : allSections.map((s) => s.id),
        activeSectionId: workflow.activeSectionId,
        isComplete: isSectionComplete,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- completeness derived from workflow
    [
      resolved.flatSectionIds,
      allSections,
      workflow.activeSectionId,
      workflow.sectionContent,
      workflow.completedSectionIds,
      workflow.skippedSectionIds,
    ],
  );

  const effectiveMode: WorkshopMapPresentationMode =
    mapMode === "full" && !fullUnlocked && !isWorkshopMapFullUnlocked()
      ? "focus"
      : mapMode;

  const useGrouped =
    (effectiveMode === "organized" || effectiveMode === "full") &&
    resolved.mode === "grouped";

  const visibleIds = useMemo(() => {
    if (effectiveMode === "focus") {
      return new Set(focusSectionIds);
    }
    if (effectiveMode === "organized" && !showAll && focusSet.size > 0) {
      return new Set(
        allSections
          .filter((s) => focusSet.has(s.id) || s.content.trim() || focusSectionIds.includes(s.id))
          .map((s) => s.id),
      );
    }
    return new Set(allSections.map((s) => s.id));
  }, [
    effectiveMode,
    focusSectionIds,
    showAll,
    focusSet,
    allSections,
  ]);

  const activeGroup = resolved.groups.find((g) =>
    g.sectionIds.includes(workflow.activeSectionId ?? ""),
  );
  const categoriesComplete = resolved.groups.filter(
    (g) => g.totalCount > 0 && g.completedCount >= g.totalCount,
  ).length;
  const progressLine =
    useGrouped && activeGroup
      ? formatCategoryProgressLine({
          title: activeGroup.title,
          completedCount: activeGroup.completedCount,
          totalCount: activeGroup.totalCount,
        })
      : formatPlanProgressSummary({
          categoriesComplete,
          categoriesTotal: resolved.groups.length || allSections.length,
          activeCategoryTitle: activeGroup?.title,
        });

  const listSectionIds =
    effectiveMode === "focus"
      ? focusSectionIds
      : allSections.map((s) => s.id).filter((id) => visibleIds.has(id));

  return (
    <div
      className="flex flex-col gap-3"
      data-testid="create-workspace-v2-presentation"
      data-answer-capture="disabled"
      data-creation-interaction-owner="current_focus"
      data-workshop-map="estate"
      data-workshop-map-mode={effectiveMode}
      data-workshop-map-grouped={useGrouped ? "true" : "false"}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          className="text-sm font-medium text-[#1e4f4f]"
          data-testid="workshop-map-progress"
        >
          {progressLine}
        </p>
        <div
          className="flex flex-wrap gap-1"
          role="group"
          aria-label="Workshop map view"
          data-testid="workshop-map-mode-switcher"
        >
          {(["focus", "organized", "full"] as const).map((mode) => {
            const locked = mode === "full" && !fullUnlocked && !isWorkshopMapFullUnlocked();
            if (locked) return null;
            return (
              <button
                key={mode}
                type="button"
                data-testid={`workshop-map-mode-${mode}`}
                aria-pressed={effectiveMode === mode}
                onClick={() => selectMode(mode)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  effectiveMode === mode
                    ? "bg-[#1e4f4f] text-white"
                    : "bg-[#faf7f2] text-[#6b635a] hover:bg-[#f0ebe3]"
                }`}
              >
                {WORKSHOP_MAP_MODE_LABELS[mode]}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs leading-relaxed text-[#6b635a]">
        {effectiveMode === "focus"
          ? "Today’s next steps — everything else can wait."
          : effectiveMode === "organized"
            ? "Your plan by area. Open one category at a time."
            : "The full plan — open any section in Current Focus."}
      </p>

      {useGrouped ? (
        <div
          className="flex flex-col gap-2"
          role="list"
          aria-label="Organized Workshop Map"
        >
          {resolved.groups.map((group) => (
            <GroupBlock
              key={group.groupId}
              group={group}
              open={openGroupId === group.groupId}
              onToggle={() => toggleGroup(group.groupId)}
              workflow={workflow}
              onOpenSection={onOpenSection}
              visibleSectionIds={visibleIds}
            />
          ))}
        </div>
      ) : (
        <ul
          className="flex flex-col gap-2"
          role="list"
          aria-label={
            effectiveMode === "focus" ? "Focus Workshop Map" : "Workshop Map"
          }
        >
          {listSectionIds.map((sectionId) => (
            <SectionRow
              key={sectionId}
              sectionId={sectionId}
              workflow={workflow}
              onOpenSection={onOpenSection}
            />
          ))}
        </ul>
      )}

      <p className="text-xs text-[#9a8f82]" data-testid="workshop-map-reassurance">
        {useGrouped
          ? "You have a plan — work one area at a time."
          : effectiveMode === "focus"
            ? "A few steps now. The rest waits until you’re ready."
            : `${allSections.filter((s) => s.content.trim() || s.skipped).length} of ${allSections.length} sections touched`}
      </p>
    </div>
  );
}
