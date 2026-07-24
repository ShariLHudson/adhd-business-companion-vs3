"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { VisualFocusPurposeAnchor } from "@/components/companion/VisualFocusPurposeAnchor";
import { CartographersStudioRoom } from "@/components/companion/cartographersStudio/CartographersStudioRoom";
import { MapEntryPanel } from "@/components/companion/cartographersStudio/MapEntryPanel";
import { MapGuidedBuilder } from "@/components/companion/cartographersStudio/MapGuidedBuilder";
import { MapResearchEntry } from "@/components/companion/cartographersStudio/MapResearchEntry";
import { MyMapsPanel } from "@/components/companion/cartographersStudio/MyMapsPanel";
import { MindMapDiscoveryInterview } from "@/components/companion/cartographersStudio/MindMapDiscoveryInterview";
import { VisualThinkingRequestPanel } from "@/components/companion/cartographersStudio/VisualThinkingRequestPanel";
import { MindMapEditableCanvas } from "@/components/companion/cartographersStudio/MindMapEditableCanvas";
import { VisualFocusVisualCanvas } from "@/components/companion/visualFocus/VisualFocusVisualCanvas";
import {
  CompanionInsightsReveal,
  type CompanionInsightsPhase,
} from "@/components/companion/visualFocus/CompanionInsightsReveal";
import { DecisionSummarySheet } from "@/components/companion/visualFocus/DecisionSummarySheet";
import { BusinessCanvasHealthOverviewPanel } from "@/components/companion/visualFocus/BusinessCanvasHealthOverviewPanel";
import { ConfirmDialog } from "@/components/companion/ConfirmDialog";
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
import {
  CARTOGRAPHERS_ATLAS_SAVE_LINE,
  CARTOGRAPHERS_EXIT,
  CARTOGRAPHERS_HELP,
  CARTOGRAPHERS_RESUME_PREVIOUS,
  CARTOGRAPHERS_RETURN_TO_ESTATE,
  CARTOGRAPHERS_STUDIO_BACKGROUND,
  CARTOGRAPHERS_UPDATE_MAP,
  getCartographyMapDefinition,
  type CartographersFramedMapId,
} from "@/lib/cartographersStudio";
import { shouldShowRequestFirstExperience } from "@/lib/cartographersStudio/visualThinkingRequest";
import { CartographersContextualHelp } from "@/components/companion/cartographersStudio/CartographersContextualHelp";
import { buildDraftFromGuidedAnswers } from "@/lib/visualFocus/guidedBuilder";
import {
  buildResearchAssistedDraft,
  type MapDetailLevel,
} from "@/lib/visualFocus/researchAssisted";
import { printVisualFocusMap } from "@/lib/visualFocus/printMap";
import {
  applyCanonicalRootChange,
  canvasSyncStatusLabel,
  mapHasPublishedCanvas,
  refreshCanvasFromOutline,
  type CanvasSyncStatus,
} from "@/lib/visualFocus/canvasSync";
import {
  VISUAL_FOCUS_UPDATED,
  VISUAL_FOCUS_SHOW_STUDIO,
  VISUAL_FOCUS_OPEN_REQUESTED,
  VISUAL_FOCUS_MIND_MAP_DISCOVERY_REQUESTED,
  canBuildDecisionSummary,
  canGenerateVisualFocusMap,
  clearActiveVisualFocusMapSelection,
  consumeVisualFocusOpen,
  consumeMindMapDiscoveryPending,
  createAndActivateMap,
  deleteVisualFocusMap,
  archiveVisualFocusMap,
  generateMapLabelForMode,
  generateVisualFocusMap,
  generateBusinessCanvasImpact,
  getVisualFocusMapById,
  listVisualFocusMaps,
  saveVisualFocusMap,
  setActiveVisualFocusMap,
  listContinueThinkingMaps,
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
import {
  canRedo,
  canUndo,
  createMindMapHistory,
  pushMindMapHistory,
  redoMindMapHistory,
  undoMindMapHistory,
  type MindMapHistoryState,
} from "@/lib/visualFocus/mindMapHistory";
import { cloneTree } from "@/lib/visualFocus/mindMapEditing";

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

/** Total nodes in a tree, including the root. */
function countTreeNodes(root: VisualFocusNode): number {
  return 1 + root.children.reduce((sum, c) => sum + countTreeNodes(c), 0);
}

/** Top-level branch labels — the "few items" shown in the collapsed summary. */
function topLevelBranchLabels(root: VisualFocusNode): string[] {
  return root.children.map((c) => c.label.trim()).filter(Boolean);
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
  onReturnToEstate,
}: {
  onBack?: () => void;
  onClose?: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  /** @deprecated Removed from production chrome. */
  onWorkWithShari?: () => void;
  onReturnToEstate?: () => void;
}) {
  const [view, setView] = useState<StudioView>("hub");
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("build");
  const [maps, setMaps] = useState<VisualFocusMap[]>([]);
  const [active, setActive] = useState<VisualFocusMap | null>(null);
  const [pendingCreateMode, setPendingCreateMode] =
    useState<VisualFocusMode | null>(null);
  const [mindMapDiscoveryOpen, setMindMapDiscoveryOpen] = useState(false);
  const [mindMapDiscoverySeed, setMindMapDiscoverySeed] = useState<
    string | undefined
  >(undefined);
  const [entryMapId, setEntryMapId] =
    useState<CartographersFramedMapId | null>(null);
  const [guidedMapId, setGuidedMapId] =
    useState<CartographersFramedMapId | null>(null);
  const [guidedInitialAnswers, setGuidedInitialAnswers] = useState<
    Record<string, string> | undefined
  >(undefined);
  const [researchMapId, setResearchMapId] =
    useState<CartographersFramedMapId | null>(null);
  const [myMapsOpen, setMyMapsOpen] = useState(false);
  const [mapUpdatedAck, setMapUpdatedAck] = useState<string | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [showDraftReview, setShowDraftReview] = useState(false);
  const [atlasSaveAck, setAtlasSaveAck] = useState<string | null>(null);
  const [mindHistory, setMindHistory] = useState<MindMapHistoryState | null>(
    null,
  );
  const [hubDeleteMapId, setHubDeleteMapId] = useState<string | null>(null);
  const [intelligenceViewMode, setIntelligenceViewMode] =
    useState<IntelligenceViewMode>("canvas-intelligence");
  const [intelligenceHighlightSection, setIntelligenceHighlightSection] =
    useState<BusinessCanvasSectionId | null>(null);
  const [contextualHelpOpen, setContextualHelpOpen] = useState(false);
  const [canvasSyncStatus, setCanvasSyncStatus] =
    useState<CanvasSyncStatus>("synced");
  // Progressive disclosure — intelligence is earned, revealed one at a time.
  const [insightsPhase, setInsightsPhase] =
    useState<CompanionInsightsPhase>("invite");
  const [insightRevealCount, setInsightRevealCount] = useState(1);
  const [analyzeMenuOpen, setAnalyzeMenuOpen] = useState(false);
  const [structureExpanded, setStructureExpanded] = useState(false);
  const [decisionSummaryOpen, setDecisionSummaryOpen] = useState(false);

  // Reset the calm disclosure state each time a different map is opened, so
  // no map ever arrives with the intelligence panel already screaming.
  useEffect(() => {
    setInsightsPhase("invite");
    setInsightRevealCount(1);
    setAnalyzeMenuOpen(false);
    setStructureExpanded(false);
    setDecisionSummaryOpen(false);
    setIntelligenceViewMode("canvas-intelligence");
  }, [active?.id]);

  const revealInsights = useCallback(() => {
    setInsightsPhase("sequential");
    setInsightRevealCount(1);
    setAnalyzeMenuOpen(false);
  }, []);

  const showStudioHub = useCallback(() => {
    clearActiveVisualFocusMapSelection();
    setActive(null);
    setView("hub");
    setWorkspaceMode("build");
    setMindMapDiscoveryOpen(false);
    setMindMapDiscoverySeed(undefined);
    setEntryMapId(null);
    setGuidedMapId(null);
    setGuidedInitialAnswers(undefined);
    setResearchMapId(null);
    setMyMapsOpen(false);
    setMoreMenuOpen(false);
    setShowDraftReview(false);
  }, []);

  const openMindMapDiscovery = useCallback((seedText?: string) => {
    clearActiveVisualFocusMapSelection();
    setActive(null);
    setView("hub");
    setWorkspaceMode("build");
    setShowDraftReview(false);
    setPendingCreateMode(null);
    setEntryMapId(null);
    setGuidedMapId(null);
    setResearchMapId(null);
    setMindMapDiscoverySeed(seedText?.trim() || undefined);
    setMindMapDiscoveryOpen(true);
  }, []);

  const openMapWorkspace = useCallback(
    (mapId: string, preferGenerated = true) => {
      setActiveVisualFocusMap(mapId);
      const map = getVisualFocusMapById(mapId);
      setActive(map);
      setView("workspace");
      setShowDraftReview(false);
      if (map?.mode === "mind-map") {
        setMindHistory(createMindMapHistory(map.root));
        setWorkspaceMode("build");
      } else {
        setMindHistory(null);
        setWorkspaceMode(
          preferGenerated && map?.workflowStage === "generated"
            ? "generated"
            : "build",
        );
      }
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
    const discoveryPending = consumeMindMapDiscoveryPending();
    const pending = consumeVisualFocusOpen();
    if (discoveryPending) {
      openMindMapDiscovery(discoveryPending.seedText);
    } else if (pending) {
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
    const onMindMapDiscovery = (event: Event) => {
      const detail = (event as CustomEvent<{ seedText?: string }>).detail;
      const consumed = consumeMindMapDiscoveryPending();
      openMindMapDiscovery(
        consumed?.seedText ?? detail?.seedText,
      );
    };

    window.addEventListener(VISUAL_FOCUS_UPDATED, onUpdate);
    window.addEventListener(VISUAL_FOCUS_SHOW_STUDIO, onStudio);
    window.addEventListener(VISUAL_FOCUS_OPEN_REQUESTED, onOpenRequested);
    window.addEventListener(
      VISUAL_FOCUS_MIND_MAP_DISCOVERY_REQUESTED,
      onMindMapDiscovery,
    );
    return () => {
      window.removeEventListener(VISUAL_FOCUS_UPDATED, onUpdate);
      window.removeEventListener(VISUAL_FOCUS_SHOW_STUDIO, onStudio);
      window.removeEventListener(VISUAL_FOCUS_OPEN_REQUESTED, onOpenRequested);
      window.removeEventListener(
        VISUAL_FOCUS_MIND_MAP_DISCOVERY_REQUESTED,
        onMindMapDiscovery,
      );
    };
  }, [reload, showStudioHub, openMapWorkspace, openMindMapDiscovery]);

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

  function persist(map: VisualFocusMap, opts?: { announce?: boolean }) {
    const saved = saveVisualFocusMap(map);
    setActive(saved);
    setMaps(listVisualFocusMaps());
    if (opts?.announce) {
      setAtlasSaveAck(CARTOGRAPHERS_ATLAS_SAVE_LINE);
      window.setTimeout(() => setAtlasSaveAck(null), 4200);
    }
    return saved;
  }

  function handleSelectMindMapFromRoom() {
    setEntryMapId("mind-map");
  }

  function handleSelectWallMap(id: CartographersFramedMapId) {
    setGuidedMapId(null);
    setResearchMapId(null);
    setMindMapDiscoveryOpen(false);
    setEntryMapId(id);
  }

  function beginSelectedMap(id: CartographersFramedMapId) {
    const def = getCartographyMapDefinition(id);
    setEntryMapId(null);
    setResearchMapId(null);
    if (def.builderType === "mind-map-discovery") {
      openMindMapDiscovery();
      return;
    }
    setGuidedInitialAnswers(undefined);
    setGuidedMapId(id);
  }

  /** Open the research-assisted entry — Spark researches and builds a draft. */
  function openResearchEntry(id: CartographersFramedMapId) {
    setEntryMapId(null);
    setGuidedMapId(null);
    setMindMapDiscoveryOpen(false);
    setResearchMapId(id);
  }

  /** Build a first useful map from research at the chosen detail level. */
  function handleResearchComplete(
    wallId: CartographersFramedMapId,
    topic: string,
    detailLevel: MapDetailLevel,
  ) {
    const def = getCartographyMapDefinition(wallId);
    const draft = buildResearchAssistedDraft({
      mapType: def.visualFocusMode,
      topic,
      detailLevel,
    });
    const map = createAndActivateMap(def.visualFocusMode, draft.title);
    const seeded: VisualFocusMap = {
      ...map,
      title: draft.title,
      root: draft.root,
      summary: draft.summaryHint,
      detailLevel,
      research: draft.research,
      lifecycleStatus: "draft",
    };
    const withLayout = generateVisualFocusMap(seeded);
    const saved = persist(withLayout);
    setActive(saved);
    setMaps(listVisualFocusMaps());
    setView("workspace");
    setWorkspaceMode(def.visualFocusMode === "mind-map" ? "build" : "generated");
    setMindHistory(
      def.visualFocusMode === "mind-map"
        ? createMindMapHistory(saved.root)
        : null,
    );
    setResearchMapId(null);
    setShowDraftReview(false);
    setMapUpdatedAck("I built a first version we can refine together.");
    window.setTimeout(() => setMapUpdatedAck(null), 3600);
  }

  function handleGuidedComplete(
    wallId: CartographersFramedMapId,
    answers: Record<string, string>,
  ) {
    const def = getCartographyMapDefinition(wallId);
    const draft = buildDraftFromGuidedAnswers(def, answers);
    const map = createAndActivateMap(def.visualFocusMode, draft.title);
    const seeded: VisualFocusMap = {
      ...map,
      title: draft.title,
      root: draft.root,
      summary: draft.summaryHint,
      lifecycleStatus: "draft",
    };
    const withLayout = generateVisualFocusMap(seeded);
    const saved = persist(withLayout);
    setActive(saved);
    setMaps(listVisualFocusMaps());
    setView("workspace");
    setWorkspaceMode("generated");
    setMindHistory(null);
    setGuidedMapId(null);
    setGuidedInitialAnswers(undefined);
    setShowDraftReview(false);
    setMapUpdatedAck("Your map is ready.");
    window.setTimeout(() => setMapUpdatedAck(null), 3200);
  }

  function handleMindMapDiscoveryComplete(answers: {
    topic: string;
    everything: string;
    desiredOutcome?: string;
    anythingElse?: string;
  }) {
    const map = createAndActivateMap("mind-map", {
      mindMapDiscovery: {
        topic: answers.topic,
        everything: answers.everything,
        desiredOutcome: answers.desiredOutcome ?? answers.anythingElse,
      },
    });
    const withLayout = generateVisualFocusMap(map);
    const saved = persist(withLayout);
    setActive(saved);
    setMaps(listVisualFocusMaps());
    setView("workspace");
    setWorkspaceMode("build");
    setMindHistory(createMindMapHistory(saved.root));
    setShowDraftReview(true);
    setMindMapDiscoveryOpen(false);
    setMindMapDiscoverySeed(undefined);
  }

  function handleEditActiveMap() {
    if (!active) return;
    setMoreMenuOpen(false);
    setWorkspaceMode("build");
    setShowDraftReview(false);
    if (active.mode === "mind-map") {
      setMindHistory(createMindMapHistory(active.root));
    }
  }

  function handlePrintActiveMap() {
    if (!active) return;
    setMoreMenuOpen(false);
    printVisualFocusMap(active);
  }

  function handleRenameActiveMap(title: string) {
    if (!active) return;
    const saved = persist({ ...active, title, updatedAt: new Date().toISOString() });
    setActive(saved);
    setMapUpdatedAck("Your map has been updated.");
    window.setTimeout(() => setMapUpdatedAck(null), 3200);
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
    setCanvasSyncStatus("updating");
    const generated = generateVisualFocusMap(active);
    const saved = persist(generated);
    setActive(saved);
    setWorkspaceMode("generated");
    setCanvasSyncStatus("map-updated");
    window.setTimeout(() => setCanvasSyncStatus("synced"), 2400);
  }

  function handleRefreshCanvas() {
    if (!active) return;
    setCanvasSyncStatus("updating");
    const refreshed = refreshCanvasFromOutline(active);
    const saved = persist(refreshed);
    setActive(saved);
    setWorkspaceMode("generated");
    setCanvasSyncStatus("map-updated");
    window.setTimeout(() => setCanvasSyncStatus("synced"), 2400);
  }

  function persistOutlineRoot(root: VisualFocusNode) {
    if (!active) return;
    const next = applyCanonicalRootChange(active, root);
    if (mapHasPublishedCanvas(active)) {
      setCanvasSyncStatus("updating");
      setWorkspaceMode("generated");
    }
    persist(next);
    if (mapHasPublishedCanvas(active)) {
      setCanvasSyncStatus("map-updated");
      window.setTimeout(() => setCanvasSyncStatus("synced"), 2400);
    }
  }

  function handleAddAnotherBranch() {
    if (!active) return;
    const root = active.root;
    const next: VisualFocusNode = {
      ...root,
      collapsed: false,
      children: [
        ...root.children,
        { id: newId("n"), label: "New branch", children: [] },
      ],
    };
    persistOutlineRoot(next);
    setStructureExpanded(true);
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

  const continueThinking = useMemo(
    () => listContinueThinkingMaps(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maps],
  );
  const showGenerated =
    active?.workflowStage === "generated" &&
    workspaceMode === "generated" &&
    active.visualLayout &&
    active.analysis;

  const exitHandler = onReturnToEstate ?? onClose ?? onBack;

  return (
    <div
      className="cartographers-room-root"
      data-testid="visual-focus-workspace"
      data-visual-focus-view={view}
      data-workspace-mode={workspaceMode}
    >
      <ConfirmDialog
        open={Boolean(hubDeleteMap)}
        title="Delete this map?"
        message={
          hubDeleteMap
            ? `"${hubDeleteMap.title?.trim() || "Untitled map"}" will be removed from My Maps. This cannot be undone.`
            : "This cannot be undone."
        }
        confirmLabel="Delete Map"
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
          setMyMapsOpen(true);
          setMapUpdatedAck("Map deleted.");
          window.setTimeout(() => setMapUpdatedAck(null), 2800);
        }}
      />
      {view === "hub" ? (
        <>
          <CartographersStudioRoom
            continueThinking={continueThinking}
            onSelectMindMap={handleSelectMindMapFromRoom}
            onSelectWallMap={handleSelectWallMap}
            onOpenMap={handleOpenMap}
            onRemoveMap={handleRemoveContinueThinkingMap}
            onDeleteMap={handleRequestDeleteContinueThinkingMap}
            onViewMyMaps={() => setMyMapsOpen(true)}
            onReturnToEstate={onReturnToEstate ?? onClose ?? onBack}
            onBack={onBack}
            onClose={onClose}
          />
          {shouldShowRequestFirstExperience({
            hasActiveMap: Boolean(active),
            hasPendingMapOverlay: Boolean(
              entryMapId ||
                guidedMapId ||
                researchMapId ||
                myMapsOpen ||
                mindMapDiscoveryOpen,
            ),
          }) ? (
            <VisualThinkingRequestPanel
              onOpenPreviousWork={() => setMyMapsOpen(true)}
            />
          ) : null}
          {entryMapId ? (
            <MapEntryPanel
              definition={getCartographyMapDefinition(entryMapId)}
              existingMaps={maps}
              onClose={() => setEntryMapId(null)}
              onBegin={() => beginSelectedMap(entryMapId)}
              onResearchBuild={() => openResearchEntry(entryMapId)}
              onContinue={(mapId) => {
                setEntryMapId(null);
                handleOpenMap(mapId);
              }}
              onViewMyMaps={() => {
                setEntryMapId(null);
                setMyMapsOpen(true);
              }}
            />
          ) : null}
          {guidedMapId ? (
            <MapGuidedBuilder
              key={guidedMapId}
              definition={getCartographyMapDefinition(guidedMapId)}
              initialAnswers={guidedInitialAnswers}
              onCancel={() => {
                setGuidedMapId(null);
                setGuidedInitialAnswers(undefined);
              }}
              onComplete={(answers) =>
                handleGuidedComplete(guidedMapId, answers)
              }
            />
          ) : null}
          {researchMapId ? (
            <MapResearchEntry
              key={`research-${researchMapId}`}
              definition={getCartographyMapDefinition(researchMapId)}
              onCancel={() => setResearchMapId(null)}
              onBuildFromKnown={() => beginSelectedMap(researchMapId)}
              onThinkItThrough={() => beginSelectedMap(researchMapId)}
              onResearch={(topic, detailLevel) =>
                handleResearchComplete(researchMapId, topic, detailLevel)
              }
            />
          ) : null}
          {myMapsOpen ? (
            <MyMapsPanel
              maps={maps.filter((m) => m.lifecycleStatus !== "deleted")}
              onClose={() => setMyMapsOpen(false)}
              onCreate={() => {
                setMyMapsOpen(false);
              }}
              onOpen={(id) => {
                setMyMapsOpen(false);
                handleOpenMap(id);
              }}
              onEdit={(id) => {
                setMyMapsOpen(false);
                openMapWorkspace(id, false);
              }}
              onPrint={(id) => {
                const map = getVisualFocusMapById(id);
                if (map) printVisualFocusMap(map);
              }}
              onRename={(id, title) => {
                const map = getVisualFocusMapById(id);
                if (!map) return;
                saveVisualFocusMap({
                  ...map,
                  title,
                  updatedAt: new Date().toISOString(),
                });
                reload();
              }}
              onDelete={(id) => {
                setHubDeleteMapId(id);
              }}
            />
          ) : null}
          {mindMapDiscoveryOpen ? (
            <div className="cartographers-discovery-layer">
              <MindMapDiscoveryInterview
                key={mindMapDiscoverySeed ?? "mind-map-discovery"}
                seedText={mindMapDiscoverySeed}
                onCancel={() => {
                  setMindMapDiscoveryOpen(false);
                  setMindMapDiscoverySeed(undefined);
                }}
                onComplete={handleMindMapDiscoveryComplete}
              />
            </div>
          ) : null}
          {pendingCreateMode ? (
            <VisualFocusPurposeAnchor
              mode={pendingCreateMode}
              onCancel={() => setPendingCreateMode(null)}
              onConfirm={(answer) => handleCreate(pendingCreateMode, answer)}
            />
          ) : null}
          {mapUpdatedAck ? (
            <p className="cartographers-atlas-ack" role="status" aria-live="polite">
              {mapUpdatedAck}
            </p>
          ) : null}
        </>
      ) : active ? (
        <div className="cartographers-discovery-table">
          <div
            className="cartographers-discovery-table__plate"
            style={{ backgroundImage: `url(${CARTOGRAPHERS_STUDIO_BACKGROUND})` }}
            aria-hidden
          />
          <div className="cartographers-immersive__veil" aria-hidden />

          <div className="cartographers-immersive__chrome">
            <div className="cartographers-immersive__chrome-left">
              {exitHandler ? (
                <button
                  type="button"
                  className="cartographers-chrome-link"
                  data-testid="cartographers-workspace-return"
                  onClick={exitHandler}
                >
                  <span aria-hidden>←</span> {CARTOGRAPHERS_RETURN_TO_ESTATE}
                </button>
              ) : null}
            </div>
            <div className="cartographers-immersive__chrome-actions">
              <button
                type="button"
                className="cartographers-chrome-link"
                data-testid="cartographers-workspace-resume"
                onClick={backToStudio}
              >
                {CARTOGRAPHERS_RESUME_PREVIOUS}
              </button>
              <button
                type="button"
                className="cartographers-chrome-link"
                data-testid="cartographers-workspace-help"
                onClick={() => setContextualHelpOpen(true)}
                aria-label="Help for this map"
              >
                {CARTOGRAPHERS_HELP}
              </button>
              {exitHandler ? (
                <button
                  type="button"
                  className="cartographers-chrome-link"
                  data-testid="cartographers-workspace-exit"
                  onClick={exitHandler}
                >
                  {CARTOGRAPHERS_EXIT}
                </button>
              ) : null}
            </div>
          </div>

          {atlasSaveAck ? (
            <p
              className="cartographers-atlas-ack"
              role="status"
              aria-live="polite"
            >
              {atlasSaveAck}
            </p>
          ) : null}

          {contextualHelpOpen ? (
            <CartographersContextualHelp
              map={active}
              onClose={() => setContextualHelpOpen(false)}
              onBrowseMapTypes={() => {
                setContextualHelpOpen(false);
                backToStudio();
              }}
            />
          ) : null}

          {decisionSummaryOpen ? (
            <DecisionSummarySheet
              map={active}
              onClose={() => setDecisionSummaryOpen(false)}
            />
          ) : null}

          <div className="cartographers-discovery-table__focus">
            {active.mode === "mind-map" &&
            active.discoveryInterview &&
            showDraftReview ? (
              <div
                className="cartographers-draft-review"
                data-testid="mind-map-draft-review"
              >
                <p className="cartographers-draft-review__question">
                  I think this is a strong starting point. We can refine it together.
                </p>
                {active.draftExplanation ? (
                  <p className="mt-2 text-sm leading-relaxed text-[#6b635a]">
                    {active.draftExplanation}
                  </p>
                ) : null}
                {active.draftDuplicates && active.draftDuplicates.length > 0 ? (
                  <p className="mt-1 text-xs text-[#9a8f82]">
                    Merged near-duplicates: {active.draftDuplicates.slice(0, 3).join("; ")}
                  </p>
                ) : null}
                {active.draftSuggestions && active.draftSuggestions.length > 0 ? (
                  <p className="mt-1 text-sm text-[#6b635a]">
                    Soft prompts: {active.draftSuggestions.join(" · ")}
                  </p>
                ) : null}
                <div className="cartographers-draft-review__actions">
                  <button
                    type="button"
                    className="rounded-xl bg-[#1e4f4f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#163c3c]"
                    onClick={() => setShowDraftReview(false)}
                  >
                    Yes, keep going
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-[#e7dfd4] px-3 py-2 text-xs font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
                    onClick={() => setShowDraftReview(false)}
                  >
                    Keep editing on the map
                  </button>
                </div>
              </div>
            ) : null}

            {active.mode === "mind-map" ? (
              <div className="cartographers-workspace-shell mt-4 min-h-0 flex-1 overflow-hidden p-3">
                <input
                  value={active.title}
                  onChange={(e) => persist({ ...active, title: e.target.value })}
                  className="mb-3 w-full border-0 border-b border-[#e7dfd4] bg-transparent pb-2 text-xl font-semibold text-[#1f1c19] focus:border-[#8b7355] focus:outline-none"
                  aria-label="Map title"
                />
                <MindMapEditableCanvas
                  root={mindHistory?.present ?? active.root}
                  canUndo={mindHistory ? canUndo(mindHistory) : false}
                  canRedo={mindHistory ? canRedo(mindHistory) : false}
                  onUndo={() => {
                    if (!mindHistory || !canUndo(mindHistory)) return;
                    const next = undoMindMapHistory(mindHistory);
                    setMindHistory(next);
                    persist({ ...active, root: cloneTree(next.present) });
                  }}
                  onRedo={() => {
                    if (!mindHistory || !canRedo(mindHistory)) return;
                    const next = redoMindMapHistory(mindHistory);
                    setMindHistory(next);
                    persist({ ...active, root: cloneTree(next.present) });
                  }}
                  onChange={(root) => {
                    const base = mindHistory ?? createMindMapHistory(active.root);
                    const next = pushMindMapHistory(base, root);
                    setMindHistory(next);
                    persist({ ...active, root: cloneTree(root) });
                  }}
                />
              </div>
            ) : showGenerated ? (
              <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-[#1f1c19]">
                      {active.title?.trim() || "Untitled map"}
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                      Visual map
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {canvasSyncStatus !== "synced" ? (
                      <p
                        className={`cartographers-canvas-sync${
                          canvasSyncStatus === "sync-needed"
                            ? " cartographers-canvas-sync--needed"
                            : ""
                        }`}
                        role="status"
                        aria-live="polite"
                        data-testid="cartographers-canvas-sync-status"
                      >
                        {canvasSyncStatusLabel(canvasSyncStatus)}
                      </p>
                    ) : null}
                    {/* Canvas — just the map, no intelligence */}
                    <button
                      type="button"
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        intelligenceViewMode === "canvas-only"
                          ? "border-[#1e4f4f] bg-[#1e4f4f] text-white"
                          : "border-[#c9bfb0] bg-white text-[#1e4f4f] hover:bg-[#faf7f2]"
                      }`}
                      data-testid="cartographers-view-canvas"
                      aria-pressed={intelligenceViewMode === "canvas-only"}
                      onClick={() => {
                        setIntelligenceViewMode("canvas-only");
                        setAnalyzeMenuOpen(false);
                        setMoreMenuOpen(false);
                      }}
                    >
                      Canvas
                    </button>
                    {/* Analyze — earned intelligence, offers the three layouts */}
                    <div className="relative">
                      <button
                        type="button"
                        className="rounded-lg border border-[#c9bfb0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1e4f4f] hover:bg-[#faf7f2]"
                        data-testid="cartographers-analyze"
                        aria-expanded={analyzeMenuOpen}
                        aria-haspopup="menu"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          setAnalyzeMenuOpen((o) => !o);
                        }}
                      >
                        Analyze
                      </button>
                      {analyzeMenuOpen ? (
                        <ul
                          className="cartographers-my-maps__menu"
                          role="menu"
                          data-testid="cartographers-analyze-menu"
                          style={{ right: 0, left: "auto" }}
                        >
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              data-testid="cartographers-analyze-canvas-intelligence"
                              onClick={() => {
                                setIntelligenceViewMode("canvas-intelligence");
                                revealInsights();
                              }}
                            >
                              Canvas + Intelligence
                            </button>
                          </li>
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              data-testid="cartographers-analyze-canvas-only"
                              onClick={() => {
                                setIntelligenceViewMode("canvas-only");
                                setAnalyzeMenuOpen(false);
                              }}
                            >
                              Canvas Only
                            </button>
                          </li>
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              data-testid="cartographers-analyze-intelligence-only"
                              onClick={() => {
                                setIntelligenceViewMode("intelligence-only");
                                revealInsights();
                              }}
                            >
                              Intelligence Only
                            </button>
                          </li>
                        </ul>
                      ) : null}
                    </div>
                    {/* Decision Summary — permission-gated one-page synthesis */}
                    {canBuildDecisionSummary(active) ? (
                      <button
                        type="button"
                        className="rounded-lg border border-[#c9bfb0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1e4f4f] hover:bg-[#faf7f2]"
                        data-testid="cartographers-decision-summary"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          setAnalyzeMenuOpen(false);
                          setDecisionSummaryOpen(true);
                        }}
                      >
                        Decision Summary
                      </button>
                    ) : null}
                    {/* More — quieter map management */}
                    <div className="relative">
                      <button
                        type="button"
                        className="rounded-lg border border-[#c9bfb0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1e4f4f] hover:bg-[#faf7f2]"
                        data-testid="cartographers-map-more"
                        aria-expanded={moreMenuOpen}
                        aria-haspopup="menu"
                        onClick={() => {
                          setAnalyzeMenuOpen(false);
                          setMoreMenuOpen((o) => !o);
                        }}
                      >
                        More
                      </button>
                      {moreMenuOpen ? (
                        <ul
                          className="cartographers-my-maps__menu"
                          role="menu"
                          style={{ right: 0, left: "auto" }}
                        >
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              onClick={handleEditActiveMap}
                            >
                              Edit Map
                            </button>
                          </li>
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                const next = window.prompt(
                                  "Rename this map",
                                  active.title,
                                );
                                if (next != null) {
                                  handleRenameActiveMap(next.trim() || active.title);
                                }
                                setMoreMenuOpen(false);
                              }}
                            >
                              Rename
                            </button>
                          </li>
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              onClick={handlePrintActiveMap}
                            >
                              Print
                            </button>
                          </li>
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setMoreMenuOpen(false);
                                handleRefreshCanvas();
                                setMapUpdatedAck("Your map has been updated.");
                                window.setTimeout(
                                  () => setMapUpdatedAck(null),
                                  3200,
                                );
                              }}
                            >
                              {CARTOGRAPHERS_UPDATE_MAP}
                            </button>
                          </li>
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              className="cartographers-my-maps__danger"
                              onClick={() => {
                                setMoreMenuOpen(false);
                                setHubDeleteMapId(active.id);
                              }}
                            >
                              Delete
                            </button>
                          </li>
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </div>
                {mapUpdatedAck ? (
                  <p className="cartographers-atlas-ack" role="status" aria-live="polite">
                    {mapUpdatedAck}
                  </p>
                ) : null}
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
                active.mode !== "business-canvas" ? (
                  <aside
                    className="w-full shrink-0 overflow-y-auto lg:w-64 xl:w-72"
                    data-testid="visual-focus-structure"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                        {active.mode === "visual-kanban" && active.kanban
                          ? `Cards (${Object.keys(active.kanban.cards).length})`
                          : `Nodes (${countTreeNodes(active.root)})`}
                      </p>
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#1e4f4f] hover:underline"
                        data-testid="visual-focus-structure-edit"
                        aria-expanded={structureExpanded}
                        onClick={() => setStructureExpanded((e) => !e)}
                      >
                        {structureExpanded ? "Done" : "Edit"}
                      </button>
                    </div>
                    {structureExpanded ? (
                      active.mode === "visual-kanban" && active.kanban ? (
                        <VisualFocusKanbanEditor
                          columns={active.kanban.columns}
                          cards={active.kanban.cards}
                          onChange={(columns, cards) => {
                            const updated = { ...active, kanban: { columns, cards } };
                            if (mapHasPublishedCanvas(active) || workspaceMode === "generated") {
                              setCanvasSyncStatus("updating");
                              persist(
                                generateVisualFocusMap({
                                  ...updated,
                                  workflowStage: "build",
                                }),
                              );
                              setWorkspaceMode("generated");
                              setCanvasSyncStatus("map-updated");
                              window.setTimeout(
                                () => setCanvasSyncStatus("synced"),
                                2400,
                              );
                            } else {
                              persist(updated);
                            }
                          }}
                        />
                      ) : (
                        <VisualFocusTreeEditor
                          root={active.root}
                          onChange={(root) => persistOutlineRoot(root)}
                        />
                      )
                    ) : (
                      <div data-testid="visual-focus-structure-summary">
                        <ul className="flex flex-col gap-1">
                          {(active.mode === "visual-kanban" && active.kanban
                            ? Object.values(active.kanban.cards).map((c) => c.label)
                            : topLevelBranchLabels(active.root)
                          )
                            .slice(0, 4)
                            .map((label, index) => (
                              <li
                                key={`${label}-${index}`}
                                className="truncate rounded-lg border border-[#e7dfd4] bg-white px-3 py-1.5 text-sm font-medium text-[#2f261f]"
                              >
                                {label?.trim() || "Untitled branch"}
                              </li>
                            ))}
                        </ul>
                        {active.mode !== "visual-kanban" ? (
                          <button
                            type="button"
                            className="mt-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
                            data-testid="visual-focus-add-another"
                            onClick={handleAddAnotherBranch}
                          >
                            + Add Another
                          </button>
                        ) : null}
                      </div>
                    )}
                  </aside>
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
                <CompanionInsightsReveal
                  analysis={intelligenceAnalysis(active)}
                  phase={insightsPhase}
                  revealCount={insightRevealCount}
                  onYes={() => {
                    setInsightsPhase("sequential");
                    setInsightRevealCount(1);
                  }}
                  onNotYet={() => setInsightsPhase("teaser")}
                  onShowInsights={() => {
                    setInsightsPhase("sequential");
                    setInsightRevealCount(1);
                  }}
                  onRevealNext={() =>
                    setInsightRevealCount((c) => c + 1)
                  }
                  onShowAll={() => setInsightsPhase("all")}
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
                    onChange={(root) => persistOutlineRoot(root)}
                  />
                )}
                {canGenerateVisualFocusMap(active) ? (
                  <div className="sticky bottom-4 mt-6 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        handleGenerate();
                        setMapUpdatedAck("Your map has been updated.");
                        window.setTimeout(() => setMapUpdatedAck(null), 3200);
                      }}
                      className="rounded-full bg-[#1e4f4f] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#163b3b]"
                      data-testid="visual-focus-generate"
                    >
                      {generateMapLabelForMode(active.mode)}
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintActiveMap}
                      className="rounded-full border border-[#c9bfb0] bg-white px-6 py-3 text-sm font-bold text-[#1e4f4f]"
                    >
                      Print
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
        </div>
      ) : null}
    </div>
  );
}
