"use client";

import { useEffect, useMemo, useState } from "react";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { workspaceV2Sections } from "@/lib/createWorkspaceSections";
import {
  resolveFacilitatedSectionStatus,
  FACILITATED_SECTION_STATUS_LABELS,
} from "@/lib/facilitatedCreation";
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
            {group.completedCount} of {group.totalCount} complete
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
 * Estate Workshop Map — flat for short maps, grouped/collapsible for long ones.
 */
export function GroupedWorkshopMap({
  workflow,
  onOpenSection,
  onWorkflowChange,
  showAll,
  focusSet,
}: Props) {
  const allSections = workspaceV2Sections(workflow);
  const mapSections = showAll
    ? allSections
    : allSections.filter((s) => focusSet.has(s.id) || s.content.trim());
  const visibleIds = useMemo(
    () => new Set(mapSections.map((s) => s.id)),
    [mapSections],
  );
  const mapHidden = allSections.length - mapSections.length;

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

  const [openGroupIds, setOpenGroupIds] = useState<string[]>(
    () => resolved.initiallyOpenGroupIds,
  );
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [mapMenuOpen, setMapMenuOpen] = useState(false);

  useEffect(() => {
    const activeGroup = resolved.groups.find((g) =>
      g.sectionIds.includes(workflow.activeSectionId ?? ""),
    );
    if (!activeGroup) return;
    setOpenGroupIds((prev) =>
      prev.includes(activeGroup.groupId)
        ? prev
        : [...prev, activeGroup.groupId],
    );
  }, [workflow.activeSectionId, resolved.groups]);

  function toggleGroup(groupId: string) {
    setOpenGroupIds((prev) => {
      const isOpen = prev.includes(groupId);
      if (isOpen) {
        setPinned((p) => {
          const next = new Set(p);
          next.delete(groupId);
          return next;
        });
        return prev.filter((id) => id !== groupId);
      }
      setPinned((p) => new Set(p).add(groupId));
      return [...prev, groupId];
    });
  }

  function expandAll() {
    setOpenGroupIds(resolved.groups.map((g) => g.groupId));
    setPinned(new Set(resolved.groups.map((g) => g.groupId)));
    setMapMenuOpen(false);
  }

  function collapseAll() {
    const activeGroup = resolved.groups.find((g) =>
      g.sectionIds.includes(workflow.activeSectionId ?? ""),
    );
    setOpenGroupIds(activeGroup ? [activeGroup.groupId] : []);
    setPinned(new Set());
    setMapMenuOpen(false);
  }

  const filledCount = allSections.filter((s) => s.content.trim()).length;

  return (
    <div
      className="flex flex-col gap-4"
      data-testid="create-workspace-v2-presentation"
      data-answer-capture="disabled"
      data-creation-interaction-owner="current_focus"
      data-workshop-map="estate"
      data-workshop-map-mode={resolved.mode}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm leading-relaxed text-[#4b463f]">
          Every section opens in Current Focus above. Tap a row to work on it —
          nothing stays locked.
        </p>
        {resolved.mode === "grouped" ? (
          <div className="relative shrink-0">
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-xs font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
              aria-expanded={mapMenuOpen}
              data-testid="workshop-map-secondary-menu"
              onClick={() => setMapMenuOpen((o) => !o)}
            >
              Map options
            </button>
            {mapMenuOpen ? (
              <div
                className="absolute right-0 z-10 mt-1 min-w-[10rem] rounded-xl border border-[#e7dfd4] bg-white py-1 shadow-sm"
                data-testid="workshop-map-secondary-menu-panel"
              >
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-[#1f1c19] hover:bg-[#faf7f2]"
                  data-testid="workshop-map-expand-all"
                  onClick={expandAll}
                >
                  Expand all
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-[#1f1c19] hover:bg-[#faf7f2]"
                  data-testid="workshop-map-collapse-all"
                  onClick={collapseAll}
                >
                  Collapse all
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

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

      {resolved.mode === "grouped" ? (
        <div
          className="flex flex-col gap-2"
          role="list"
          aria-label="Grouped Workshop Map"
        >
          {resolved.groups.map((group) => (
            <GroupBlock
              key={group.groupId}
              group={group}
              open={
                openGroupIds.includes(group.groupId) ||
                pinned.has(group.groupId)
              }
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
          aria-label="Full Workshop Map"
        >
          {mapSections.map((section) => (
            <SectionRow
              key={section.id}
              sectionId={section.id}
              workflow={workflow}
              onOpenSection={onOpenSection}
            />
          ))}
        </ul>
      )}

      <p className="text-xs text-[#9a8f82]">
        {filledCount} of {allSections.length} sections have notes
        {mapHidden > 0 ? ` · ${mapHidden} more in the full map` : ""}
        {resolved.mode === "grouped" ? " · grouped map" : ""}
      </p>
    </div>
  );
}
