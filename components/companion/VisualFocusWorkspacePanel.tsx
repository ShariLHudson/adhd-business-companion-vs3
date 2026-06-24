"use client";

import { useCallback, useEffect, useState } from "react";
import { LibraryCloseButton } from "@/components/companion/LibraryOrientationChrome";
import { VisualFocusStudioHub } from "@/components/companion/VisualFocusStudioHub";
import { VisualFocusPurposeAnchor } from "@/components/companion/VisualFocusPurposeAnchor";
import { VisualFocusMapHeader } from "@/components/companion/visualFocus/VisualFocusMapHeader";
import { VisualFocusVisualCanvas } from "@/components/companion/visualFocus/VisualFocusVisualCanvas";
import { VisualFocusIntelligencePanel } from "@/components/companion/visualFocus/VisualFocusIntelligencePanel";
import { IntelligenceViewModeToggle } from "@/components/companion/visualFocus/IntelligenceViewModeToggle";
import { BusinessCanvasHealthOverviewPanel } from "@/components/companion/visualFocus/BusinessCanvasHealthOverviewPanel";
import { VisualFocusSaveMenu } from "@/components/companion/visualFocus/VisualFocusSaveMenu";
import { VisualFocusVersionHistoryDialog } from "@/components/companion/visualFocus/VisualFocusVersionHistoryDialog";
import { ConfirmDialog } from "@/components/companion/ConfirmDialog";
import { SaveDestinationDialog } from "@/components/companion/SaveDestinationDialog";
import { suggestSaveDestinationForVisualMap } from "@/lib/saveDestinations";
import { BusinessCanvasInteractiveCanvas } from "@/components/companion/visualFocus/BusinessCanvasInteractiveCanvas";
import { affectedSectionsForChange } from "@/lib/visualFocus/businessCanvas/changeExploration";
import { BusinessCanvasChangePanel } from "@/components/companion/visualFocus/BusinessCanvasChangePanel";
import { createEmptyBusinessCanvas } from "@/lib/visualFocus/businessCanvas/factory";
import type { BusinessCanvasData, BusinessCanvasSectionId } from "@/lib/visualFocus/businessCanvas/types";
import type {
  BusinessCanvasChangeExploration,
  BusinessCanvasWorkflowStage,
} from "@/lib/visualFocus/businessCanvas/workflowTypes";
import { normalizeBusinessCanvasWorkflow } from "@/lib/visualFocus/businessCanvas/workflowTypes";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import {
  VISUAL_FOCUS_UPDATED,
  VISUAL_FOCUS_SHOW_STUDIO,
  VISUAL_FOCUS_OPEN_REQUESTED,
  canGenerateVisualFocusMap,
  clearActiveVisualFocusMapSelection,
  consumeVisualFocusOpen,
  createAndActivateMap,
  deleteVisualFocusMap,
  archiveVisualFocusMap,
  unarchiveVisualFocusMap,
  saveVisualFocusMapVersion,
  restoreVisualFocusMapVersion,
  duplicateVisualFocusMap,
  generateMapLabelForMode,
  generateVisualFocusMap,
  generateBusinessCanvasImpact,
  getVisualFocusMapById,
  listVisualFocusMaps,
  renameVisualFocusMap,
  saveVisualFocusMap,
  saveVisualFocusMapToDestination,
  setActiveVisualFocusMap,
  togglePinVisualFocusMap,
  studioCardTitleForMode,
  type VisualFocusMap,
  type VisualFocusMode,
  type VisualFocusNode,
  type VisualKanbanCard,
  type VisualKanbanColumn,
} from "@/lib/visualFocus";
import {
  mergeCanvasHighlights,
  type IntelligenceViewMode,
} from "@/lib/visualFocus/intelligence";

const NODE_COLORS = ["#1e4f4f", "#5b7c99", "#c48992", "#8b7355", "#6b8e6b"];

type StudioView = "hub" | "workspace";
type WorkspaceMode = "build" | "generated";

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function updateNodeTree(
  root: VisualFocusNode,
  nodeId: string,
  updater: (n: VisualFocusNode) => VisualFocusNode,
): VisualFocusNode {
  if (root.id === nodeId) return updater(root);
  return {
    ...root,
    children: root.children.map((c) => updateNodeTree(c, nodeId, updater)),
  };
}

function VisualFocusTreeEditor({
  root,
  onChange,
  depth = 0,
}: {
  root: VisualFocusNode;
  onChange: (root: VisualFocusNode) => void;
  depth?: number;
}) {
  const toggle = (id: string) => {
    onChange(
      updateNodeTree(root, id, (n) => ({ ...n, collapsed: !n.collapsed })),
    );
  };

  const updateLabel = (id: string, label: string) => {
    onChange(updateNodeTree(root, id, (n) => ({ ...n, label })));
  };

  const addChild = (parentId: string) => {
    onChange(
      updateNodeTree(root, parentId, (n) => ({
        ...n,
        collapsed: false,
        children: [
          ...n.children,
          { id: newId("n"), label: "New branch", children: [] },
        ],
      })),
    );
  };

  const removeNode = (id: string) => {
    function prune(n: VisualFocusNode): VisualFocusNode | null {
      if (n.id === id) return null;
      return {
        ...n,
        children: n.children
          .map((c) => prune(c))
          .filter((c): c is VisualFocusNode => c !== null),
      };
    }
    const next = prune(root);
    if (next) onChange(next);
  };

  const renderNode = (n: VisualFocusNode, d: number) => (
    <li key={n.id} className="mt-2">
      <div
        className="flex flex-wrap items-center gap-2 rounded-xl border border-[#e7dfd4] bg-white px-3 py-2"
        style={{ marginLeft: d * 16 }}
      >
        {n.children.length > 0 ? (
          <button
            type="button"
            aria-label={n.collapsed ? "Expand" : "Collapse"}
            onClick={() => toggle(n.id)}
            className="text-sm font-bold text-[#1e4f4f]"
          >
            {n.collapsed ? "▸" : "▾"}
          </button>
        ) : (
          <span className="w-4" aria-hidden />
        )}
        <input
          value={n.label}
          onChange={(e) => updateLabel(n.id, e.target.value)}
          className="min-w-[8rem] flex-1 rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-base font-semibold text-[#1f1c19] focus:border-[#1e4f4f]/30 focus:bg-[#faf7f2] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => addChild(n.id)}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
        >
          + Branch
        </button>
        {d > 0 ? (
          <button
            type="button"
            onClick={() => removeNode(n.id)}
            className="rounded-lg px-2 py-1 text-xs text-[#9a8f82] hover:bg-red-50 hover:text-red-700"
          >
            Remove
          </button>
        ) : null}
      </div>
      {!n.collapsed && n.children.length > 0 ? (
        <ul className="list-none pl-0">{n.children.map((c) => renderNode(c, d + 1))}</ul>
      ) : null}
    </li>
  );

  return (
    <ul className="list-none pl-0" data-testid="visual-focus-tree">
      {renderNode(root, depth)}
    </ul>
  );
}

function VisualFocusKanbanEditor({
  columns,
  cards,
  onChange,
}: {
  columns: VisualKanbanColumn[];
  cards: Record<string, VisualKanbanCard>;
  onChange: (columns: VisualKanbanColumn[], cards: Record<string, VisualKanbanCard>) => void;
}) {
  const [dragCardId, setDragCardId] = useState<string | null>(null);

  function moveCard(cardId: string, toColumnId: string) {
    const nextCols = columns.map((col) => ({
      ...col,
      cardIds: col.cardIds.filter((id) => id !== cardId),
    }));
    const target = nextCols.find((c) => c.id === toColumnId);
    if (target) target.cardIds = [...target.cardIds, cardId];
    onChange(nextCols, cards);
  }

  function addCard(columnId: string) {
    const id = newId("card");
    const nextCards = {
      ...cards,
      [id]: { id, label: "New card", color: NODE_COLORS[columns.length % NODE_COLORS.length] },
    };
    const nextCols = columns.map((c) =>
      c.id === columnId ? { ...c, cardIds: [...c.cardIds, id] } : c,
    );
    onChange(nextCols, nextCards);
  }

  function updateCardLabel(cardId: string, label: string) {
    const card = cards[cardId];
    if (!card) return;
    onChange(columns, { ...cards, [cardId]: { ...card, label } });
  }

  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2"
      data-testid="visual-focus-kanban"
    >
      {columns.map((col) => (
        <div
          key={col.id}
          className="min-w-[200px] flex-1 rounded-2xl border border-[#e7dfd4] bg-[#faf7f2] p-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragCardId) moveCard(dragCardId, col.id);
            setDragCardId(null);
          }}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
              {col.label}
            </p>
            <button
              type="button"
              onClick={() => addCard(col.id)}
              className="text-xs font-semibold text-[#1e4f4f]"
            >
              + Card
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {col.cardIds.map((cardId) => {
              const card = cards[cardId];
              if (!card) return null;
              return (
                <li key={cardId}>
                  <div
                    draggable
                    onDragStart={() => setDragCardId(cardId)}
                    className="cursor-grab rounded-xl border border-[#d4cdc3] bg-white px-3 py-2 shadow-sm active:cursor-grabbing"
                    style={{
                      borderLeftWidth: 4,
                      borderLeftColor: card.color ?? "#1e4f4f",
                    }}
                  >
                    <input
                      value={card.label}
                      onChange={(e) => updateCardLabel(cardId, e.target.value)}
                      className="w-full border-0 bg-transparent text-sm font-semibold text-[#1f1c19] focus:outline-none"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function VisualFocusWorkspacePanel({
  onBack,
  onClose,
  registerBack,
  onWorkWithShari,
}: {
  onBack?: () => void;
  onClose?: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  onWorkWithShari?: () => void;
}) {
  const [view, setView] = useState<StudioView>("hub");
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("build");
  const [maps, setMaps] = useState<VisualFocusMap[]>([]);
  const [active, setActive] = useState<VisualFocusMap | null>(null);
  const [pendingCreateMode, setPendingCreateMode] =
    useState<VisualFocusMode | null>(null);
  const [showBuildPanel, setShowBuildPanel] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveAsMode, setSaveAsMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hubDeleteMapId, setHubDeleteMapId] = useState<string | null>(null);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [intelligenceViewMode, setIntelligenceViewMode] =
    useState<IntelligenceViewMode>("canvas-intelligence");
  const [intelligenceHighlightSection, setIntelligenceHighlightSection] =
    useState<BusinessCanvasSectionId | null>(null);

  const showStudioHub = useCallback(() => {
    clearActiveVisualFocusMapSelection();
    setActive(null);
    setView("hub");
    setWorkspaceMode("build");
  }, []);

  const openMapWorkspace = useCallback(
    (mapId: string, preferGenerated = true) => {
      setActiveVisualFocusMap(mapId);
      const map = getVisualFocusMapById(mapId);
      setActive(map);
      setView("workspace");
      setWorkspaceMode(
        preferGenerated && map?.workflowStage === "generated"
          ? "generated"
          : "build",
      );
    },
    [],
  );

  const reload = useCallback(() => {
    setMaps(listVisualFocusMaps());
    setActive((prev) => {
      if (!prev) return null;
      return getVisualFocusMapById(prev.id);
    });
  }, []);

  useEffect(() => {
    setMaps(listVisualFocusMaps());
    const pending = consumeVisualFocusOpen();
    if (pending) {
      openMapWorkspace(pending.mapId, pending.preferGenerated);
    } else {
      showStudioHub();
    }

    const onUpdate = () => reload();
    const onStudio = () => showStudioHub();
    const onOpenRequested = (event: Event) => {
      const detail = (event as CustomEvent<{
        mapId: string;
        preferGenerated: boolean;
      }>).detail;
      if (!detail?.mapId) return;
      const consumed = consumeVisualFocusOpen();
      openMapWorkspace(
        detail.mapId,
        consumed?.preferGenerated ?? detail.preferGenerated,
      );
    };

    window.addEventListener(VISUAL_FOCUS_UPDATED, onUpdate);
    window.addEventListener(VISUAL_FOCUS_SHOW_STUDIO, onStudio);
    window.addEventListener(VISUAL_FOCUS_OPEN_REQUESTED, onOpenRequested);
    return () => {
      window.removeEventListener(VISUAL_FOCUS_UPDATED, onUpdate);
      window.removeEventListener(VISUAL_FOCUS_SHOW_STUDIO, onStudio);
      window.removeEventListener(VISUAL_FOCUS_OPEN_REQUESTED, onOpenRequested);
    };
  }, [reload, showStudioHub, openMapWorkspace]);

  const backToStudio = useCallback(() => {
    setIntelligenceHighlightSection(null);
    setIntelligenceViewMode("canvas-intelligence");
    showStudioHub();
  }, [showStudioHub]);

  function handleRemoveContinueThinkingMap(mapId: string) {
    archiveVisualFocusMap(mapId);
    if (active?.id === mapId) {
      backToStudio();
    }
    reload();
  }

  function handleRequestDeleteContinueThinkingMap(mapId: string) {
    setHubDeleteMapId(mapId);
  }

  const hubDeleteMap = hubDeleteMapId ? getVisualFocusMapById(hubDeleteMapId) : null;

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => {
      if (view === "workspace") {
        backToStudio();
        return true;
      }
      return false;
    });
    return () => registerBack(null);
  }, [registerBack, view, backToStudio]);

  function persist(map: VisualFocusMap) {
    const saved = saveVisualFocusMap(map);
    setActive(saved);
    setMaps(listVisualFocusMaps());
    return saved;
  }

  function handleRequestCreate(mode: VisualFocusMode) {
    setPendingCreateMode(mode);
  }

  function handleCreate(mode: VisualFocusMode, purposeAnswer: string) {
    const map = createAndActivateMap(mode, purposeAnswer);
    setActive(map);
    setMaps(listVisualFocusMaps());
    setView("workspace");
    setWorkspaceMode("build");
    setPendingCreateMode(null);
  }

  function handleOpenMap(id: string) {
    openMapWorkspace(id, true);
  }

  function handleGenerate() {
    if (!active) return;
    const generated = generateVisualFocusMap(active);
    let saved = persist(generated);
    if (saved.mode !== "business-canvas") {
      const versioned = saveVisualFocusMapVersion(saved.id, "Generated snapshot");
      if (versioned) saved = versioned;
    }
    setActive(saved);
    setWorkspaceMode("generated");
  }

  function persistBusinessCanvas(
    data: BusinessCanvasData,
    regenerate = false,
  ) {
    if (!active) return;
    const updated = {
      ...active,
      businessCanvas: data,
    };
    persist(
      regenerate || workspaceMode === "generated"
        ? generateVisualFocusMap({ ...updated, workflowStage: "build" })
        : updated,
    );
  }

  function businessCanvasData(map: VisualFocusMap): BusinessCanvasData {
    return map.businessCanvas ?? createEmptyBusinessCanvas();
  }

  function businessCanvasWorkflow(map: VisualFocusMap): BusinessCanvasWorkflowStage {
    return normalizeBusinessCanvasWorkflow(
      map.businessCanvasWorkflow,
      map.workflowStage === "generated",
    );
  }

  function businessCanvasChange(map: VisualFocusMap): BusinessCanvasChangeExploration {
    return map.businessCanvasChange ?? { description: "", followUpAnswers: {} };
  }

  function persistBusinessCanvasChange(
    change: BusinessCanvasChangeExploration,
    stage: BusinessCanvasWorkflowStage,
  ) {
    if (!active) return;
    persist({
      ...active,
      businessCanvasChange: change,
      businessCanvasWorkflow: stage,
    });
  }

  function handleAnalyzeBusinessCanvasImpact() {
    if (!active) return;
    const result = generateBusinessCanvasImpact(active);
    if (result) persist(result);
  }

  function businessCanvasHighlights(map: VisualFocusMap): BusinessCanvasSectionId[] | undefined {
    const workflow = businessCanvasWorkflow(map);
    if (workflow !== "generatedImpact" && workflow !== "clarifyChange") return undefined;
    const change = map.businessCanvasChange?.description?.trim();
    if (!change) return undefined;
    return affectedSectionsForChange(change);
  }

  function mergedCanvasHighlights(
    map: VisualFocusMap,
  ): BusinessCanvasSectionId[] | undefined {
    return mergeCanvasHighlights(
      businessCanvasHighlights(map),
      intelligenceHighlightSection ? [intelligenceHighlightSection] : undefined,
    );
  }

  function handleIntelligenceSectionHighlight(
    sectionId: BusinessCanvasSectionId | null,
  ) {
    setIntelligenceHighlightSection(sectionId);
  }

  function intelligenceAnalysis(map: VisualFocusMap) {
    if (
      map.mode === "business-canvas" &&
      businessCanvasWorkflow(map) === "generatedImpact" &&
      map.businessCanvasImpactAnalysis
    ) {
      return map.businessCanvasImpactAnalysis;
    }
    return map.analysis!;
  }

  function promptTitle(defaultValue: string): string | null {
    if (typeof window === "undefined") return null;
    const next = window.prompt("Map name", defaultValue);
    if (next === null) return null;
    return next.trim() || defaultValue;
  }

  const modeBadge = active ? studioCardTitleForMode(active.mode) : null;
  const showGenerated =
    active?.workflowStage === "generated" &&
    workspaceMode === "generated" &&
    active.visualLayout &&
    active.analysis;

  return (
    <div
      className={`${workspacePanelShellClass({ width: "full", inSplit: true })} companion-panel-surface`}
      data-testid="visual-focus-workspace"
      data-visual-focus-view={view}
      data-workspace-mode={workspaceMode}
    >
      {view === "hub" ? (
        <>
          <VisualFocusStudioHub
            maps={maps}
            onCreate={handleRequestCreate}
            onOpenMap={handleOpenMap}
            onRemoveMap={handleRemoveContinueThinkingMap}
            onDeleteMap={handleRequestDeleteContinueThinkingMap}
            onWorkWithShari={onWorkWithShari}
            onBack={onBack}
            onClose={onClose}
          />
          <ConfirmDialog
            open={Boolean(hubDeleteMap)}
            title="Delete Map™"
            message={
              hubDeleteMap
                ? `Delete "${hubDeleteMap.title}" permanently? This cannot be undone.`
                : "This action cannot be undone."
            }
            confirmLabel="Delete"
            cancelLabel="Cancel"
            destructive
            onCancel={() => setHubDeleteMapId(null)}
            onConfirm={() => {
              if (!hubDeleteMapId) return;
              deleteVisualFocusMap(hubDeleteMapId);
              setHubDeleteMapId(null);
              if (active?.id === hubDeleteMapId) {
                backToStudio();
              }
              reload();
            }}
          />
          {pendingCreateMode ? (
            <VisualFocusPurposeAnchor
              mode={pendingCreateMode}
              onCancel={() => setPendingCreateMode(null)}
              onConfirm={(answer) => handleCreate(pendingCreateMode, answer)}
            />
          ) : null}
        </>
      ) : active ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7dfd4] pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={backToStudio}
                className="inline-flex items-center gap-1 rounded-full border border-[#e7d9c8] bg-[#faf7f2] px-3 py-1.5 text-sm font-semibold text-[#2f261f] hover:bg-[#f3ebe0]"
                data-testid="visual-focus-back-to-studio"
              >
                <span aria-hidden="true">←</span>
                Back to Studio
              </button>
              <button
                type="button"
                onClick={backToStudio}
                className="inline-flex items-center gap-1 rounded-full border border-[#e7dfd4] bg-white px-3 py-1.5 text-sm font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
                data-testid="visual-focus-close-map"
              >
                Close map
              </button>
              {modeBadge ? (
                <span
                  className="rounded-full bg-[#1e4f4f]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#1e4f4f]"
                  data-testid="visual-focus-mode-badge"
                >
                  {modeBadge}
                </span>
              ) : null}
              {active.workflowStage === "generated" ? (
                <button
                  type="button"
                  onClick={() =>
                    setWorkspaceMode((m) => (m === "generated" ? "build" : "generated"))
                  }
                  className="rounded-full border border-[#e7dfd4] px-3 py-1 text-xs font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
                >
                  {workspaceMode === "generated" ? "Edit structure" : "View visual map"}
                </button>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <VisualFocusSaveMenu
                pinned={active.pinned}
                archived={active.lifecycleStatus === "archived"}
                versionCount={active.versions?.length ?? 0}
                onSave={() => {
                  setSaveAsMode(false);
                  setSaveDialogOpen(true);
                }}
                onSaveAs={() => {
                  setSaveAsMode(true);
                  setSaveDialogOpen(true);
                }}
                onRename={() => {
                  const title = promptTitle(active.title);
                  if (!title) return;
                  const renamed = renameVisualFocusMap(active.id, title);
                  if (renamed) setActive(renamed);
                }}
                onDuplicate={() => {
                  const copy = duplicateVisualFocusMap(active.id);
                  if (copy) {
                    setActive(copy);
                    setMaps(listVisualFocusMaps());
                  }
                }}
                onSaveVersion={() => {
                  persist(active);
                  const defaultLabel =
                    (active.versions?.length ?? 0) > 0 ? "Version" : "Initial Version";
                  const label =
                    typeof window !== "undefined"
                      ? window.prompt("Version label (optional)", defaultLabel)
                      : defaultLabel;
                  if (label === null) return;
                  const updated = saveVisualFocusMapVersion(
                    active.id,
                    label.trim() || undefined,
                  );
                  if (updated) {
                    setActive(updated);
                    setMaps(listVisualFocusMaps());
                  }
                }}
                onVersionHistory={() => setVersionHistoryOpen(true)}
                onPin={() => {
                  const updated = togglePinVisualFocusMap(active.id);
                  if (updated) {
                    setActive(updated);
                    setMaps(listVisualFocusMaps());
                  }
                }}
                onArchive={() => {
                  persist(active);
                  const updated = archiveVisualFocusMap(active.id);
                  if (updated) {
                    setActive(updated);
                    reload();
                  }
                }}
                onUnarchive={() => {
                  const updated = unarchiveVisualFocusMap(active.id);
                  if (updated) {
                    setActive(updated);
                    reload();
                  }
                }}
                onDelete={() => setDeleteDialogOpen(true)}
              />
              {onClose ? <LibraryCloseButton onClose={onClose} /> : null}
            </div>
          </div>

          <SaveDestinationDialog
            open={saveDialogOpen && Boolean(active)}
            title={saveAsMode ? "Save As" : "Save To"}
            suggested={
              active
                ? suggestSaveDestinationForVisualMap(active.mode).destination
                : undefined
            }
            suggestionReason={
              active
                ? suggestSaveDestinationForVisualMap(active.mode).reason
                : undefined
            }
            onCancel={() => setSaveDialogOpen(false)}
            onSave={(destination) => {
              if (!active) return;
              persist(active);
              if (saveAsMode) {
                const copy = duplicateVisualFocusMap(active.id);
                if (copy) {
                  const saved = saveVisualFocusMapToDestination(copy.id, destination);
                  if (saved) {
                    setActive(saved);
                    setMaps(listVisualFocusMaps());
                  }
                }
              } else {
                const saved = saveVisualFocusMapToDestination(active.id, destination);
                if (saved) setActive(saved);
              }
              setSaveDialogOpen(false);
              setMaps(listVisualFocusMaps());
            }}
          />

          <ConfirmDialog
            open={deleteDialogOpen && Boolean(active)}
            title="Delete Map™"
            message="This action cannot be undone. The map will be permanently removed from your workspace."
            confirmLabel="Delete"
            cancelLabel="Cancel"
            destructive
            onCancel={() => setDeleteDialogOpen(false)}
            onConfirm={() => {
              if (!active) return;
              deleteVisualFocusMap(active.id);
              setDeleteDialogOpen(false);
              reload();
              backToStudio();
            }}
          />

          <VisualFocusVersionHistoryDialog
            open={versionHistoryOpen && Boolean(active)}
            map={active}
            onClose={() => setVersionHistoryOpen(false)}
            onSaveVersion={() => {
              if (!active) return;
              persist(active);
              const defaultLabel =
                (active.versions?.length ?? 0) > 0 ? "Version" : "Initial Version";
              const label =
                typeof window !== "undefined"
                  ? window.prompt("Version label (optional)", defaultLabel)
                  : defaultLabel;
              if (label === null) return;
              const updated = saveVisualFocusMapVersion(
                active.id,
                label.trim() || undefined,
              );
              if (updated) {
                setActive(updated);
                setMaps(listVisualFocusMaps());
              }
            }}
            onRestore={(versionId) => {
              if (!active) return;
              persist(active);
              const updated = restoreVisualFocusMapVersion(active.id, versionId);
              if (updated) {
                setActive(updated);
                setMaps(listVisualFocusMaps());
                setVersionHistoryOpen(false);
              }
            }}
          />

          <div className="mt-4">
            <VisualFocusMapHeader map={active} />
          </div>

          {showGenerated ? (
            <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                  Strategic view
                </p>
                <IntelligenceViewModeToggle
                  mode={intelligenceViewMode}
                  onChange={setIntelligenceViewMode}
                />
              </div>
              <div
                className={`flex min-h-0 flex-1 flex-col gap-4 ${
                  intelligenceViewMode === "canvas-intelligence"
                    ? "lg:flex-row"
                    : ""
                }`}
              >
              {active.mode === "business-canvas" &&
              active.businessCanvasHealth &&
              intelligenceViewMode !== "canvas-only" ? (
                <BusinessCanvasHealthOverviewPanel health={active.businessCanvasHealth} />
              ) : null}
              {intelligenceViewMode !== "intelligence-only" &&
              showBuildPanel &&
              active.mode !== "business-canvas" ? (
                <aside className="w-full shrink-0 overflow-y-auto lg:w-64 xl:w-72">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                      Input structure
                    </p>
                    <button
                      type="button"
                      className="text-xs text-[#9a8f82] lg:hidden"
                      onClick={() => setShowBuildPanel(false)}
                    >
                      Hide
                    </button>
                  </div>
                  {active.mode === "visual-kanban" && active.kanban ? (
                    <VisualFocusKanbanEditor
                      columns={active.kanban.columns}
                      cards={active.kanban.cards}
                      onChange={(columns, cards) => {
                        const updated = { ...active, kanban: { columns, cards } };
                        persist(
                          workspaceMode === "generated"
                            ? generateVisualFocusMap({ ...updated, workflowStage: "build" })
                            : updated,
                        );
                      }}
                    />
                  ) : (
                    <VisualFocusTreeEditor
                      root={active.root}
                      onChange={(root) => {
                        const updated = { ...active, root };
                        persist(
                          workspaceMode === "generated"
                            ? generateVisualFocusMap({ ...updated, workflowStage: "build" })
                            : updated,
                        );
                      }}
                    />
                  )}
                </aside>
              ) : showBuildPanel && active.mode !== "business-canvas" ? (
                <button
                  type="button"
                  className="self-start text-xs font-semibold text-[#1e4f4f] lg:hidden"
                  onClick={() => setShowBuildPanel(true)}
                >
                  Show input structure
                </button>
              ) : null}
              {intelligenceViewMode !== "intelligence-only" ? (
              <main className="min-h-0 flex-1 space-y-4">
                {active.mode === "business-canvas" ? (
                  <BusinessCanvasInteractiveCanvas
                    centerTitle={active.title}
                    data={businessCanvasData(active)}
                    highlightedSections={mergedCanvasHighlights(active)}
                    impactStates={active.businessCanvasImpactStates}
                    onChange={(data) =>
                      persistBusinessCanvas(data, workspaceMode === "generated")
                    }
                  />
                ) : (
                  <VisualFocusVisualCanvas
                    layout={active.visualLayout!}
                    centerTitle={active.title}
                  />
                )}
                {active.mode === "business-canvas" &&
                businessCanvasWorkflow(active) !== "buildCurrentCanvas" ? (
                  <BusinessCanvasChangePanel
                    workflow={businessCanvasWorkflow(active)}
                    change={businessCanvasChange(active)}
                    onChange={persistBusinessCanvasChange}
                    onAnalyzeImpact={handleAnalyzeBusinessCanvasImpact}
                  />
                ) : null}
              </main>
              ) : null}
              {intelligenceViewMode !== "canvas-only" ? (
              <VisualFocusIntelligencePanel
                analysis={intelligenceAnalysis(active)}
                onSectionHighlight={
                  active.mode === "business-canvas"
                    ? handleIntelligenceSectionHighlight
                    : undefined
                }
                fullWidth={intelligenceViewMode === "intelligence-only"}
              />
              ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
              <input
                value={active.title}
                onChange={(e) => persist({ ...active, title: e.target.value })}
                className="mb-4 w-full border-0 border-b border-[#e7dfd4] bg-transparent pb-2 text-xl font-semibold text-[#1f1c19] focus:border-[#1e4f4f] focus:outline-none"
                aria-label="Map title"
              />
              {active.mode === "business-canvas" ? (
                <BusinessCanvasInteractiveCanvas
                  data={businessCanvasData(active)}
                  highlightedSections={mergedCanvasHighlights(active)}
                  onChange={(data) =>
                    persist({ ...active, businessCanvas: data })
                  }
                />
              ) : active.mode === "visual-kanban" && active.kanban ? (
                <VisualFocusKanbanEditor
                  columns={active.kanban.columns}
                  cards={active.kanban.cards}
                  onChange={(columns, cards) =>
                    persist({ ...active, kanban: { columns, cards } })
                  }
                />
              ) : (
                <VisualFocusTreeEditor
                  root={active.root}
                  onChange={(root) => persist({ ...active, root })}
                />
              )}
              {canGenerateVisualFocusMap(active) ? (
                <div className="sticky bottom-4 mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="rounded-full bg-[#1e4f4f] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#163b3b]"
                    data-testid="visual-focus-generate"
                  >
                    {generateMapLabelForMode(active.mode)}
                  </button>
                </div>
              ) : (
                <p className="mt-6 text-center text-sm text-[#9a8f82]">
                  {active.mode === "business-canvas"
                    ? "Fill at least 3 sections (or 4 entries total) to generate your canvas."
                    : "Add at least two meaningful items to generate your visual map."}
                </p>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
