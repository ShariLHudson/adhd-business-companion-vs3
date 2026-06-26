"use client";

import { useEffect, useRef, useState } from "react";
import { getDayState } from "@/lib/companionStore";
import {
  addQuickPlanItem,
  bringParkingLotItemToToday,
  durationLabel,
  formatPlanTime,
  isPlanItemActive,
  loadTodayPlanItems,
  readTodayPlanItems,
  movePlanItemKanban,
  finishPlanItem,
  planItemMetaLabel,
  planItemStyle,
  PLAN_MY_DAY_UPDATED,
  resolveInitialPlanningView,
  PLANNING_VIEW_OPTIONS,
  setLastPlanningView,
  updatePlanItem,
  type PlanDayItem,
  type PlanItemColumn,
  type PlanningViewMode,
  type QuickPlanItemInput,
} from "@/lib/planMyDay";
import {
  curatePlanBoardForJudgment,
  dayModeAtmosphereClass,
  gatherFlexiblePlanningContext,
  livingBoardSubtitle,
  markPlanDayFlexible,
  markPlanDayLiving,
  markPlanDayOrienting,
  materializeConfirmedProposals,
  partitionLivingBoard,
  readPlanDaySession,
  resolvePlanDayChapter,
  shouldSkipOrientation,
  usePlanDayCompanionCycle,
} from "@/lib/planMyDay/companionBrainClient";
import {
  diffBoardCuration,
  formatBoardStewardshipMessage,
  holdingTransparencyLine,
} from "@/lib/planMyDay/companionBrainClient/boardStewardship";
import { PlanDayStewardshipNotice } from "@/components/companion/PlanDayStewardshipNotice";
import { SmartLifeAreaSuggestionCard } from "@/components/companion/SmartLifeAreaSuggestionCard";
import { PlanDayPlanAdjustment } from "@/components/companion/PlanDayPlanAdjustment";
import { detectSmartLifeAreaSuggestions } from "@/lib/companionBrain/lifeAreas";
import type { SmartLifeAreaSuggestion } from "@/lib/companionBrain/lifeAreas/types";
import type { PlanSwapOption } from "@/lib/planMyDay/companionBrainClient/planAdjustment";
import {
  addPlanAlternativeToFocus,
  applyPlanSwap,
  gatherPlanAdjustmentPresentation,
  hidePlanItemForToday,
} from "@/lib/planMyDay/companionBrainClient/planAdjustment";
import { PlanDayAddForm } from "@/components/companion/PlanDayAddForm";
import { PlanDayKanbanView } from "@/components/companion/PlanDayKanbanView";
import { PlanDayJourneyShell } from "@/components/companion/PlanDayJourneyShell";
import { PlanDayLivingBoard } from "@/components/companion/PlanDayLivingBoard";
import { PlanDayOrientationSurface } from "@/components/companion/PlanDayOrientationSurface";
import { PlanDayFlexiblePlanningMode } from "@/components/companion/PlanDayFlexiblePlanningMode";
import { PlanDaySuggestionsReminder } from "@/components/companion/PlanDaySuggestionsReminder";
import {
  PlanDayItemDetail,
  type PlanItemDetailMode,
} from "@/components/companion/PlanDayItemDetail";
import {
  dismissPlanRealityPrompt,
  evaluatePlanRealityMismatch,
  type RealityMismatchPrompt,
} from "@/lib/planMyDay/planRealityAlignment";
import { useCategoryColorCoding } from "@/lib/useCategoryColorCoding";
import { publishRealitySignal } from "@/lib/companionJudgmentClient";
import { AdjustMyDayPanel } from "@/components/companion/AdjustMyDayPanel";
const PLAN_KANBAN_BOARD_CLASS = "mx-auto w-full min-w-0 max-w-6xl";

const VIEW_SELECT =
  "min-w-[10rem] rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-semibold text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

function ViewDropdown({
  active,
  onChange,
}: {
  active: PlanningViewMode;
  onChange: (mode: PlanningViewMode) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="plan-day-view" className="text-base font-semibold text-[#1f1c19]">
        View:
      </label>
      <select
        id="plan-day-view"
        value={active}
        onChange={(e) => onChange(e.target.value as PlanningViewMode)}
        className={VIEW_SELECT}
        data-testid="plan-day-view-select"
      >
        {PLANNING_VIEW_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TimelineView({
  items,
  onOpen,
  colorCoding,
}: {
  items: PlanDayItem[];
  onOpen: (id: string) => void;
  colorCoding: boolean;
}) {
  const sorted = [...items]
    .filter(isPlanItemActive)
    .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
  return (
    <div className="plan-day-timeline-rail pl-4">
      <ul className="flex flex-col gap-2">
        {sorted.map((item) => {
          const style = planItemStyle(item, colorCoding);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onOpen(item.id)}
                className="relative flex w-full items-stretch gap-0 overflow-hidden rounded-xl border text-left shadow-sm transition-opacity hover:opacity-95"
                style={{
                  backgroundColor: colorCoding ? style.color : style.rail,
                  borderColor: colorCoding ? style.color : style.border,
                }}
              >
                <div
                  className="flex w-20 shrink-0 flex-col justify-center px-2 py-3 text-center"
                  style={{
                    backgroundColor: colorCoding ? "rgba(0,0,0,0.12)" : "#f5f5f2",
                  }}
                >
                  <span
                    className="text-base font-bold"
                    style={{ color: colorCoding ? "#fff" : "#4b463f" }}
                  >
                    {formatPlanTime(item.startTime)}
                  </span>
                </div>
                <div
                  className="flex min-w-0 flex-1 items-center px-4 py-3"
                  style={{ backgroundColor: colorCoding ? style.tint : "#ffffff" }}
                >
                  <span className="text-lg font-semibold text-[#1f1c19]">
                    {item.title}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CardsView({
  items,
  onOpen,
  colorCoding,
}: {
  items: PlanDayItem[];
  onOpen: (id: string) => void;
  colorCoding: boolean;
}) {
  const active = items.filter(isPlanItemActive);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {active.map((item) => {
        const style = planItemStyle(item, colorCoding);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item.id)}
            className="rounded-2xl border px-4 py-4 text-left shadow-sm transition-colors hover:border-[#1e4f4f]/35"
            style={{
              borderColor: colorCoding ? style.color : style.border,
              borderWidth: colorCoding ? 2 : 1,
              backgroundColor: colorCoding ? style.tint : style.tint,
            }}
          >
            <p className="text-lg font-semibold text-[#1f1c19]">{item.title}</p>
            <p className="mt-2 text-base font-medium text-[#6b635a]">
              {durationLabel(item)}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export function PlanMyDayPanel({
  onBack,
  onBackToChat,
  onOpenSettings,
  onStartFocus,
  onOpenProject,
  onOpenProjects,
  onOpenCalendar,
  onOpenAdaptMyDay,
  registerBack,
  initialOpenItemId,
}: {
  onBack?: () => void;
  onBackToChat?: () => void;
  onOpenSettings?: () => void;
  onStartFocus?: (item: PlanDayItem) => void;
  onOpenProject?: (projectId: string) => void;
  onOpenProjects?: () => void;
  onOpenCalendar?: () => void;
  onOpenAdaptMyDay?: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  initialOpenItemId?: string | null;
}) {
  const companion = usePlanDayCompanionCycle();
  const initialSession = readPlanDaySession(companion.dayKey);
  const dayEnergy = getDayState()?.energy ?? null;
  const colorCoding = useCategoryColorCoding();
  const [view, setView] = useState<PlanningViewMode>(() =>
    resolveInitialPlanningView(dayEnergy),
  );
  const [items, setItems] = useState<PlanDayItem[]>([]);
  const [openItemId, setOpenItemId] = useState<string | null>(
    initialOpenItemId ?? null,
  );
  const [detailMode, setDetailMode] = useState<PlanItemDetailMode>("form");
  const [kanbanToast, setKanbanToast] = useState<string | null>(null);
  const [realityPrompt, setRealityPrompt] =
    useState<RealityMismatchPrompt | null>(null);
  const [livingUnlocked, setLivingUnlocked] = useState(
    () =>
      initialSession.phase === "living" ||
      shouldSkipOrientation(initialSession.phase, initialOpenItemId),
  );
  const [flexibleMode, setFlexibleMode] = useState(
    () => initialSession.phase === "flexible",
  );
  const [readyLine, setReadyLine] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmedToday, setConfirmedToday] = useState(false);
  const [editingReality, setEditingReality] = useState(false);
  const [stewardshipNotice, setStewardshipNotice] = useState<string | null>(
    null,
  );
  const [holdingTransparency, setHoldingTransparency] = useState<string | null>(
    null,
  );
  const [smartLifeAreaSuggestion, setSmartLifeAreaSuggestion] =
    useState<SmartLifeAreaSuggestion | null>(null);
  const [showPlanAdjustment, setShowPlanAdjustment] = useState(false);
  const [planAdjustToast, setPlanAdjustToast] = useState<string | null>(null);
  const lastJudgmentRevision = useRef(0);

  const atmosphereClass = dayModeAtmosphereClass(companion.orientation.dayMode);
  const showOrientation =
    !livingUnlocked && !flexibleMode && !openItemId && !editingReality;
  const flexibleContext = gatherFlexiblePlanningContext(
    items,
    companion.cycle.judgment,
  );
  const planAdjustment = gatherPlanAdjustmentPresentation(
    items,
    companion.cycle.judgment,
  );
  const session = readPlanDaySession(companion.dayKey);
  const showSuggestionsReminder =
    livingUnlocked &&
    !flexibleMode &&
    !openItemId &&
    !editingReality &&
    session.livingEntry === "flexible-build" &&
    flexibleContext.suggestionCount > 0;
  const chapter = resolvePlanDayChapter({
    orienting: showOrientation,
    flexiblePlanning: flexibleMode && !openItemId && !editingReality,
    editingReality,
    openItemId,
    detailMode,
  });
  const livingPartition = partitionLivingBoard(
    items,
    companion.cycle.judgment.momentum.label,
  );
  const boardSubtitle = livingBoardSubtitle(
    companion.cycle.judgment,
    confirmedToday || companion.sessionPhase === "living",
  );

  useEffect(() => {
    if (!livingUnlocked || showOrientation || flexibleMode) {
      setShowAddForm(false);
      return;
    }
    const timer = window.setTimeout(() => setShowAddForm(true), 2400);
    return () => window.clearTimeout(timer);
  }, [livingUnlocked, showOrientation, flexibleMode]);

  useEffect(() => {
    if (!livingUnlocked) return;
    const stored = readTodayPlanItems();
    if (!stored.length) return;
    const next = curatePlanBoardForJudgment(
      stored,
      companion.cycle.judgment,
    );
    const curationDiff = diffBoardCuration(stored, next);
    refresh(next);

    const revisionChanged =
      companion.judgmentRevision !== lastJudgmentRevision.current;
    const shouldExplain =
      revisionChanged &&
      (companion.meaningfulShift ||
        companion.lastSignal?.source === "todays-reality" ||
        curationDiff.newlyHeld > 0 ||
        curationDiff.released > 0);

    if (shouldExplain) {
      const notice = formatBoardStewardshipMessage({
        diff: curationDiff,
        judgment: companion.cycle.judgment,
        signal: companion.lastSignal,
        meaningfulShift: companion.meaningfulShift,
      });
      if (notice) setStewardshipNotice(notice);
      setHoldingTransparency(holdingTransparencyLine(curationDiff));
    } else if (curationDiff.heldTotal > 0) {
      setHoldingTransparency(holdingTransparencyLine(curationDiff));
    }

    lastJudgmentRevision.current = companion.judgmentRevision;
  }, [livingUnlocked, companion.judgmentRevision]);

  useEffect(() => {
    if (companion.sessionPhase === "living") {
      setConfirmedToday(true);
    }
  }, [companion.sessionPhase]);

  useEffect(() => {
    setItems(loadTodayPlanItems());
    const sync = () => setItems(readTodayPlanItems());
    window.addEventListener(PLAN_MY_DAY_UPDATED, sync);
    return () => window.removeEventListener(PLAN_MY_DAY_UPDATED, sync);
  }, []);

  useEffect(() => {
    if (!livingUnlocked) return;
    const suggestions = detectSmartLifeAreaSuggestions(items);
    setSmartLifeAreaSuggestion(suggestions[0] ?? null);
  }, [items, livingUnlocked]);

  useEffect(() => {
    if (initialOpenItemId) {
      setOpenItemId(initialOpenItemId);
      setDetailMode("form");
      setLivingUnlocked(true);
    }
  }, [initialOpenItemId]);

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => {
      if (editingReality) {
        closeTodaysReality();
        return true;
      }
      if (openItemId) {
        if (detailMode !== "form") {
          setDetailMode("form");
          return true;
        }
        setOpenItemId(null);
        setDetailMode("form");
        return true;
      }
      if (flexibleMode) {
        returnToGateway();
        return true;
      }
      if (showOrientation) {
        return false;
      }
      return false;
    });
    return () => registerBack(null);
  }, [
    editingReality,
    registerBack,
    openItemId,
    detailMode,
    flexibleMode,
    showOrientation,
    companion.dayKey,
  ]);

  const openItem = openItemId
    ? items.find((i) => i.id === openItemId) ?? null
    : null;

  function refresh(next: PlanDayItem[]) {
    setItems(next);
  }

  function unlockLiving(
    confirmed: boolean,
    livingEntry: "confirmed" | "flexible-build" | "flexible-suggestions" = confirmed
      ? "confirmed"
      : "flexible-build",
  ) {
    let next = readTodayPlanItems();
    if (confirmed && companion.cycle.judgment.proposals.length > 0) {
      next = materializeConfirmedProposals(
        next,
        companion.cycle.judgment.proposals,
        companion.cycle.judgment.momentum.candidateId,
        companion.cycle.judgment,
      );
      setConfirmedToday(true);
    } else if (!confirmed) {
      next = loadTodayPlanItems();
    }
    next = curatePlanBoardForJudgment(next, companion.cycle.judgment);
    refresh(next);
    markPlanDayLiving(companion.dayKey, livingEntry);
    setFlexibleMode(false);
    setLivingUnlocked(true);
    setReadyLine(true);
    window.setTimeout(() => setReadyLine(false), 4000);
  }

  function enterFlexiblePlanning() {
    markPlanDayFlexible(companion.dayKey);
    setFlexibleMode(true);
    setLivingUnlocked(false);
    setConfirmedToday(false);
  }

  function enterBuildMyWay() {
    const next = curatePlanBoardForJudgment(
      readTodayPlanItems(),
      companion.cycle.judgment,
    );
    refresh(next);
    markPlanDayLiving(companion.dayKey, "flexible-build");
    setFlexibleMode(false);
    setLivingUnlocked(true);
    setConfirmedToday(false);
    setReadyLine(true);
    window.setTimeout(() => setReadyLine(false), 4000);
  }

  function acceptCompanionSuggestions() {
    unlockLiving(true, "flexible-suggestions");
  }

  function returnToGateway() {
    markPlanDayOrienting(companion.dayKey);
    setFlexibleMode(false);
    setLivingUnlocked(false);
  }

  function handleBringParkingItem(itemId: string) {
    refresh(bringParkingLotItemToToday(itemId));
  }

  function handlePlanSwap(swapOutId: string, option: PlanSwapOption) {
    refresh(
      applyPlanSwap(items, swapOutId, option, companion.cycle.judgment),
    );
    setPlanAdjustToast("Swapped — your Today's Reality stayed the same.");
    window.setTimeout(() => setPlanAdjustToast(null), 3500);
  }

  function handleHideForToday(itemId: string) {
    refresh(hidePlanItemForToday(items, itemId));
    setPlanAdjustToast("Hidden for today — still here whenever you want it.");
    window.setTimeout(() => setPlanAdjustToast(null), 3500);
  }

  function handleAddPlanExtra(option: PlanSwapOption) {
    refresh(
      addPlanAlternativeToFocus(items, option, companion.cycle.judgment),
    );
    setPlanAdjustToast("Added to today's focus.");
    window.setTimeout(() => setPlanAdjustToast(null), 3500);
  }

  function openPlanAdjustmentFromReality() {
    setShowPlanAdjustment(false);
    openTodaysReality();
  }

  function openTodaysReality() {
    setEditingReality(true);
    setOpenItemId(null);
    setDetailMode("form");
  }

  function closeTodaysReality() {
    setEditingReality(false);
  }

  function handleNavBack() {
    if (editingReality) {
      closeTodaysReality();
      return;
    }
    if (openItemId) {
      if (detailMode !== "form") {
        setDetailMode("form");
        return;
      }
      handleCloseItem();
      return;
    }
    onBack?.();
  }

  const visibleItems = items.filter(isPlanItemActive);
  const shariWhisper =
    flexibleMode && !openItemId && !editingReality
      ? "Take your time — I'm here whenever you're ready."
      : !showOrientation && !openItemId && !editingReality
        ? companion.liveAdaptation ??
          (readyLine ? "We're ready." : boardSubtitle)
        : null;

  function handleOpenItem(id: string, mode: PlanItemDetailMode = "form") {
    setOpenItemId(id);
    setDetailMode(mode);
  }

  function handleCloseItem() {
    setOpenItemId(null);
    setDetailMode("form");
  }

  function showCompletionToast(message: string) {
    setKanbanToast(message);
    window.setTimeout(() => setKanbanToast(null), 2800);
  }

  function handleCompleteItem(id: string) {
    const result = finishPlanItem(items, id, { sourceWorkspace: "kanban" });
    if (!result) return;
    refresh(result.items);
    showCompletionToast(result.toast);
    if (openItemId === id) {
      setOpenItemId(null);
      setDetailMode("form");
    }
  }

  function handleKanbanDrop(id: string, column: PlanItemColumn) {
    const result = movePlanItemKanban(items, id, column);
    refresh(result.items);
    if (result.completed) {
      showCompletionToast(result.completed.toast);
      if (openItemId === id) {
        setOpenItemId(null);
        setDetailMode("form");
      }
    }
  }

  function handleStartFocus(id: string) {
    refresh(
      updatePlanItem(items, id, {
        column: "doing",
        done: false,
        focusRank: Date.now(),
      }),
    );
    const item = items.find((i) => i.id === id);
    if (item) onStartFocus?.(item);
  }

  function handleAdd(input: QuickPlanItemInput) {
    const next = addQuickPlanItem(input, items);
    refresh(next);
    publishRealitySignal({
      source: "plan-my-day",
      kind: "plan-items",
      at: new Date().toISOString(),
    });
    const title = typeof input === "string" ? input : input.title;
    const prompt = evaluatePlanRealityMismatch(next, { newItemTitle: title });
    if (prompt) setRealityPrompt(prompt);
  }

  function handleViewChange(mode: PlanningViewMode) {
    setView(mode);
    setLastPlanningView(mode);
  }

  function renderTaskView() {
    return (
      <>
        {kanbanToast ? (
          <p
            className="companion-fade-in mb-3 rounded-xl border border-[#c5e0e0] bg-[#f0f8f8] px-4 py-3 text-center text-base font-semibold text-[#1e4f4f]"
            role="status"
            aria-live="polite"
          >
            {kanbanToast}
          </p>
        ) : null}
        {view === "list" ? (
          <PlanDayLivingBoard
            partition={livingPartition}
            onOpen={(id) => handleOpenItem(id)}
            holdingTransparencyLine={holdingTransparency}
          />
        ) : null}
        {view === "timeline" ? (
          <TimelineView
            items={visibleItems}
            onOpen={(id) => handleOpenItem(id)}
            colorCoding={colorCoding}
          />
        ) : null}
        {view === "cards" ? (
          <CardsView
            items={visibleItems}
            onOpen={(id) => handleOpenItem(id)}
            colorCoding={colorCoding}
          />
        ) : null}
        {view === "kanban" ? (
          <PlanDayKanbanView
            items={visibleItems}
            onOpen={(id) => handleOpenItem(id)}
            onDrop={handleKanbanDrop}
            onComplete={handleCompleteItem}
            colorCoding={colorCoding}
          />
        ) : null}
      </>
    );
  }

  return (
    <div
      className={`companion-fade-in companion-panel-surface flex h-full min-h-0 w-full flex-col overflow-y-auto px-6 py-8 ${atmosphereClass}`}
      data-plan-view={view}
      data-day-mode={companion.orientation.dayMode}
      data-experience-phase={
        showOrientation ? "orienting" : flexibleMode ? "flexible" : "living"
      }
    >
      <PlanDayJourneyShell
        chapter={chapter}
        onBack={handleNavBack}
        onBackToChat={() => onBackToChat?.()}
        shariWhisper={shariWhisper}
        hideHelp={showOrientation || flexibleMode}
        headerActions={
          !showOrientation && !flexibleMode && !openItem && !editingReality ? (
            <ViewDropdown active={view} onChange={handleViewChange} />
          ) : undefined
        }
      >
        {showOrientation ? (
          <div className="flex flex-1 flex-col justify-center py-6 plan-day-journey-chapter-enter">
            <PlanDayOrientationSurface
              presentation={companion.orientation}
              onConfirm={() => unlockLiving(true, "confirmed")}
              onDecline={enterFlexiblePlanning}
              onOpenAdaptMyDay={openTodaysReality}
            />
          </div>
        ) : flexibleMode && !editingReality && !openItem ? (
          <div className="flex flex-1 flex-col justify-center py-6 plan-day-journey-chapter-enter">
            <PlanDayFlexiblePlanningMode
              context={flexibleContext}
              onUseSuggestions={acceptCompanionSuggestions}
              onBuildMyWay={enterBuildMyWay}
              onOpenProject={onOpenProject}
              onOpenProjects={onOpenProjects}
              onOpenCalendar={onOpenCalendar}
              onBringParkingItem={handleBringParkingItem}
              onOpenItem={(id) => handleOpenItem(id)}
              onReturnToGateway={returnToGateway}
            />
          </div>
        ) : editingReality ? (
          <div className="mt-4 plan-day-journey-chapter-enter">
            <AdjustMyDayPanel embedded onDone={closeTodaysReality} />
          </div>
        ) : openItem ? (
          <div className="mt-4 plan-day-journey-chapter-enter">
            <PlanDayItemDetail
              key={`${openItem.id}-${detailMode}`}
              item={openItem}
              items={items}
              onItemsChange={refresh}
              onClose={handleCloseItem}
              onStartNow={(it) => handleStartFocus(it.id)}
              onOpenProject={onOpenProject}
              onOpenNextItem={(id) => handleOpenItem(id)}
              initialMode={detailMode}
              onModeChange={setDetailMode}
              hideClose
              onCompleted={showCompletionToast}
            />
          </div>
        ) : (
          <>
            <div
              className="mt-4 flex flex-col gap-4 plan-day-journey-chapter-enter"
              style={{ animationDelay: "120ms" }}
            >
              {realityPrompt ? (
                <div
                  className="rounded-xl border border-[#c9bfb0] bg-[#faf7f2] p-4"
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-base font-semibold text-[#1f1c19]">
                    Your plan may have changed since your last check-in.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        dismissPlanRealityPrompt(items);
                        setRealityPrompt(null);
                      }}
                      className="rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-sm font-semibold text-[#6b635a] hover:bg-[#f5f0ea]"
                    >
                      Keep Current Reality
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRealityPrompt(null);
                        openTodaysReality();
                      }}
                      className="rounded-xl border border-[#1e4f4f]/30 bg-[#1e4f4f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#163c3c]"
                    >
                      Update Today&apos;s Reality
                    </button>
                  </div>
                </div>
              ) : null}
              {showSuggestionsReminder ? (
                <PlanDaySuggestionsReminder
                  context={flexibleContext}
                  onUseSuggestions={acceptCompanionSuggestions}
                />
              ) : null}
              {!showPlanAdjustment ? (
                <button
                  type="button"
                  onClick={() => setShowPlanAdjustment(true)}
                  className="self-start text-sm font-semibold text-[#1e4f4f] hover:underline"
                  data-testid="plan-day-adjust-plan-trigger"
                >
                  Let&apos;s look at other possibilities
                </button>
              ) : (
                <PlanDayPlanAdjustment
                  presentation={planAdjustment}
                  onSwap={handlePlanSwap}
                  onHide={handleHideForToday}
                  onAddExtra={handleAddPlanExtra}
                  onOpenTodaysReality={openPlanAdjustmentFromReality}
                  onClose={() => setShowPlanAdjustment(false)}
                />
              )}
              {planAdjustToast ? (
                <p
                  className="rounded-xl border border-[#c5e0e0] bg-[#f0f8f8] px-4 py-3 text-sm font-semibold text-[#1e4f4f]"
                  role="status"
                >
                  {planAdjustToast}
                </p>
              ) : null}
              {stewardshipNotice ? (
                <PlanDayStewardshipNotice message={stewardshipNotice} />
              ) : null}
              {smartLifeAreaSuggestion ? (
                <SmartLifeAreaSuggestionCard
                  suggestion={smartLifeAreaSuggestion}
                  onAccepted={() => setSmartLifeAreaSuggestion(null)}
                  onDismiss={() => setSmartLifeAreaSuggestion(null)}
                />
              ) : null}
              {showAddForm ? (
                <div className="plan-day-living-enter plan-day-add-form--delayed">
                  <p className="mb-3 text-base leading-relaxed text-[#6b635a]">
                    Unlike Clear My Mind™, enter one task at a time so I can place
                    each one where it belongs.
                  </p>
                  <PlanDayAddForm onAdd={handleAdd} />
                </div>
              ) : null}
              {view !== "kanban" ? renderTaskView() : null}
            </div>
            {view === "kanban" ? (
              <div
                className={`mt-4 ${PLAN_KANBAN_BOARD_CLASS} plan-day-journey-chapter-enter`}
                style={{ animationDelay: "220ms" }}
              >
                {renderTaskView()}
              </div>
            ) : null}
            {onOpenSettings ? (
              <div className="mt-4">
                <p className="text-base text-[#6b635a]">
                  Set your default view in{" "}
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="font-semibold text-[#1e4f4f] hover:underline"
                  >
                    Settings → Planning
                  </button>
                  .
                </p>
              </div>
            ) : null}
          </>
        )}
      </PlanDayJourneyShell>
    </div>
  );
}
