"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getDayState } from "@/lib/companionStore";
import {
  addQuickPlanItem,
  bringParkingLotItemToToday,
  durationLabel,
  formatPlanTime,
  hasMeaningfulPlanItemsForToday,
  isMeaningfulPlanItem,
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
  deletePlanItem,
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
import { PlanMyDayMorningRoomShell } from "@/components/companion/PlanMyDayMorningRoomShell";
import { CompanionWorkspaceShell } from "@/components/companion/CompanionWorkspaceShell";
import { PlanDayLivingBoard } from "@/components/companion/PlanDayLivingBoard";
import { PlanDayOrientationSurface } from "@/components/companion/PlanDayOrientationSurface";
import { PlanMyDayMorningConversation } from "@/components/companion/PlanMyDayMorningConversation";
import { PlanDayFlexiblePlanningMode } from "@/components/companion/PlanDayFlexiblePlanningMode";
import { PlanDaySuggestionsReminder } from "@/components/companion/PlanDaySuggestionsReminder";
import {
  PlanDayItemDetail,
  type PlanItemDetailMode,
} from "@/components/companion/PlanDayItemDetail";
import { PlanMyDayPlanningNav } from "@/components/companion/PlanMyDayPlanningNav";
import { PlanMyDayRhythmsArea } from "@/components/companion/PlanMyDayRhythmsArea";
import { PlanMyDayCalendarArea } from "@/components/companion/PlanMyDayCalendarArea";
import { PlanMyDayUpcomingArea } from "@/components/companion/PlanMyDayUpcomingArea";
import { PlanMyDayParkingLotArea } from "@/components/companion/PlanMyDayParkingLotArea";
import { ensureCalendarPlanItem } from "@/lib/calendar/openCalendarItem";
import { PlanMyDayHistoryArea } from "@/components/companion/PlanMyDayHistoryArea";
import {
  PLAN_DAY_IM_STUCK_BUTTON_LABEL,
  requestPlanDayImStuck,
} from "@/lib/planMyDay/planDayImStuck";
import { PlanDaySimpleAdd } from "@/components/companion/PlanDaySimpleAdd";
import { PlanDaySimpleList } from "@/components/companion/PlanDaySimpleList";
import { PlanDayPreviousDayPrompt } from "@/components/companion/PlanDayPreviousDayPrompt";
import { PlanDayPreviousDayReview } from "@/components/companion/PlanDayPreviousDayReview";
import {
  isPlanningCenterArea,
  type PlanningCenterArea,
} from "@/lib/planMyDay/planningCenter";
import {
  beginPreviousDayReview,
  clearPreviousDayReviewSession,
  findHeldPreviousDayUnfinished,
  getPlanCompletionsForDate,
  getReviewablePreviousDayItems,
  leavePreviousDayItemsThere,
  previousDayPromptCopy,
  readPreviousDayPromptState,
  shouldShowPreviousDayPrompt,
} from "@/lib/planMyDay";
import {
  dismissPlanRealityPrompt,
  evaluatePlanRealityMismatch,
  type RealityMismatchPrompt,
} from "@/lib/planMyDay/planRealityAlignment";
import { useCategoryColorCoding } from "@/lib/useCategoryColorCoding";
import { publishRealitySignal } from "@/lib/companionJudgmentClient";
import { AdaptMyDayCheckIn } from "@/components/companion/AdaptMyDayCheckIn";
import { PlanOrAdaptPathChooser } from "@/components/companion/PlanOrAdaptPathChooser";
import type { AdaptedDayProposal } from "@/lib/dailyAdaptation";
const PLAN_KANBAN_BOARD_CLASS = "mx-auto w-full min-w-0 max-w-6xl";
const PLANNING_AREA_STORAGE_KEY = "companion-plan-my-day-planning-area-v1";

function readInitialPlanningArea(): PlanningCenterArea {
  if (typeof window === "undefined") return "today";
  try {
    const fromQuery = new URLSearchParams(window.location.search).get(
      "planningArea",
    );
    if (fromQuery && isPlanningCenterArea(fromQuery)) return fromQuery;
    const stored = localStorage.getItem(PLANNING_AREA_STORAGE_KEY);
    if (stored && isPlanningCenterArea(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "today";
}

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
  onOpenAppointment,
  onOpenAdaptMyDay,
  registerBack,
  initialOpenItemId,
  initialPlanningArea,
  initialRhythmsTab,
  standalone = false,
}: {
  onBack?: () => void;
  onBackToChat?: () => void;
  onOpenSettings?: () => void;
  onStartFocus?: (item: PlanDayItem) => void;
  onOpenProject?: (projectId: string) => void;
  onOpenProjects?: () => void;
  onOpenCalendar?: () => void;
  /**
   * Open a calendar / legacy Momentum Appointment in the current detail experience.
   * Prefer local Plan My Day calendar detail; host should route via openCalendarItem.
   */
  onOpenAppointment?: (appointmentId?: string) => void;
  onOpenAdaptMyDay?: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  initialOpenItemId?: string | null;
  /** When set (e.g. Room menu → Rhythms), open that Planning Center area. */
  initialPlanningArea?: PlanningCenterArea | null;
  /** When opening Rhythms, optionally land on Reminders (or another tab). */
  initialRhythmsTab?: "today" | "all" | "reminders" | null;
  standalone?: boolean;
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
  /** Detail for calendar / legacy appointments not yet on today's board. */
  const [calendarDetailItem, setCalendarDetailItem] =
    useState<PlanDayItem | null>(null);
  const [detailMode, setDetailMode] = useState<PlanItemDetailMode>("form");
  const [kanbanToast, setKanbanToast] = useState<string | null>(null);
  const [realityPrompt, setRealityPrompt] =
    useState<RealityMismatchPrompt | null>(null);
  const [livingUnlocked, setLivingUnlocked] = useState(() => {
    if (standalone) return true;
    const hasPlan = hasMeaningfulPlanItemsForToday();
    return (
      hasPlan ||
      initialSession.phase === "living" ||
      shouldSkipOrientation(
        initialSession.phase,
        initialOpenItemId,
        hasPlan,
      )
    );
  });
  const [flexibleMode, setFlexibleMode] = useState(
    () =>
      !standalone &&
      initialSession.phase === "flexible" &&
      !hasMeaningfulPlanItemsForToday(),
  );
  const [readyLine, setReadyLine] = useState(false);
  /** Today's Plan: add form stays collapsed until "Add another item". */
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmedToday, setConfirmedToday] = useState(false);
  const [editingReality, setEditingReality] = useState(false);
  /** null = show Plan vs Adapt chooser on Today before orientation. */
  const [dayPath, setDayPath] = useState<"plan" | "adapt" | null>(() => {
    if (standalone) return "plan";
    const hasPlan = hasMeaningfulPlanItemsForToday();
    if (
      hasPlan ||
      initialSession.phase === "living" ||
      shouldSkipOrientation(
        initialSession.phase,
        initialOpenItemId,
        hasPlan,
      )
    ) {
      return "plan";
    }
    return null;
  });
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
  const [planningArea, setPlanningArea] = useState<PlanningCenterArea>(() =>
    initialPlanningArea && isPlanningCenterArea(initialPlanningArea)
      ? initialPlanningArea
      : readInitialPlanningArea(),
  );
  const [previousDayPrompt, setPreviousDayPrompt] = useState<{
    sourceDate: string;
    count: number;
  } | null>(null);
  const [reviewingPreviousDay, setReviewingPreviousDay] = useState<
    string | null
  >(null);
  const [previousReviewRevision, setPreviousReviewRevision] = useState(0);
  const [completionRevision, setCompletionRevision] = useState(0);
  const lastJudgmentRevision = useRef(0);

  function handlePlanningAreaChange(area: PlanningCenterArea) {
    setPlanningArea(area);
    try {
      localStorage.setItem(PLANNING_AREA_STORAGE_KEY, area);
    } catch {
      /* ignore */
    }
    if (area !== "today") {
      setOpenItemId(null);
      setCalendarDetailItem(null);
      setEditingReality(false);
      setFlexibleMode(false);
      setShowAddForm(false);
    }
  }

  useEffect(() => {
    if (!initialPlanningArea || !isPlanningCenterArea(initialPlanningArea)) {
      return;
    }
    setPlanningArea(initialPlanningArea);
    try {
      localStorage.setItem(PLANNING_AREA_STORAGE_KEY, initialPlanningArea);
    } catch {
      /* ignore */
    }
    // Keep the requested item when deep-linking into Calendar (or another area).
    if (initialPlanningArea !== "today" && !initialOpenItemId) {
      setOpenItemId(null);
      setCalendarDetailItem(null);
      setEditingReality(false);
      setFlexibleMode(false);
      setShowAddForm(false);
    } else if (initialPlanningArea !== "today") {
      setEditingReality(false);
      setFlexibleMode(false);
      setShowAddForm(false);
    }
  }, [initialPlanningArea, initialOpenItemId]);

  const atmosphereClass = dayModeAtmosphereClass(companion.orientation.dayMode);
  const hasMeaningfulToday = items.some(isMeaningfulPlanItem);
  /** State A — Start My Day: no meaningful saved items for local today. */
  const showOrientation =
    planningArea === "today" &&
    !livingUnlocked &&
    !flexibleMode &&
    !openItemId &&
    !editingReality &&
    !hasMeaningfulToday;
  /** State B — Today's Plan: saved items (or session already living today). */
  const showingTodaysPlan =
    planningArea === "today" &&
    livingUnlocked &&
    !flexibleMode &&
    !openItemId &&
    !editingReality;
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
    planningArea === "today" &&
    livingUnlocked &&
    !flexibleMode &&
    !openItemId &&
    !editingReality &&
    session.livingEntry === "flexible-build" &&
    flexibleContext.suggestionCount > 0;
  const chapter = resolvePlanDayChapter({
    orienting: showOrientation,
    flexiblePlanning:
      planningArea === "today" && flexibleMode && !openItemId && !editingReality,
    editingReality: planningArea === "today" && editingReality,
    openItemId: planningArea === "today" ? openItemId : null,
    detailMode,
  });
  const livingPartition = partitionLivingBoard(
    items,
    companion.cycle.judgment.momentum.label,
  );
  const boardSubtitle = livingBoardSubtitle(
    companion.cycle.judgment,
    confirmedToday || companion.sessionPhase === "living" || hasMeaningfulToday,
  );
  const completedToday = useMemo(() => {
    void completionRevision;
    return getPlanCompletionsForDate().map((r) => ({
      id: r.id,
      title: r.taskName,
    }));
  }, [completionRevision, items]);
  const previousReviewItems = useMemo(() => {
    void previousReviewRevision;
    if (!reviewingPreviousDay) return [];
    return getReviewablePreviousDayItems(reviewingPreviousDay);
  }, [reviewingPreviousDay, previousReviewRevision]);

  const showPreviousDayBanner =
    planningArea === "today" &&
    !reviewingPreviousDay &&
    !openItemId &&
    !editingReality &&
    !flexibleMode &&
    Boolean(previousDayPrompt);

  /** Saved items for today prove the day has started — no separate setup flag. */
  function enterTodaysPlanFromSavedItems() {
    setFlexibleMode(false);
    setLivingUnlocked(true);
    setShowAddForm(false);
    const current = readPlanDaySession(companion.dayKey);
    if (current.phase !== "living") {
      markPlanDayLiving(companion.dayKey, current.livingEntry ?? "flexible-build");
    }
  }

  useEffect(() => {
    if (!livingUnlocked || showOrientation || flexibleMode) {
      setShowAddForm(false);
    }
  }, [livingUnlocked, showOrientation, flexibleMode]);

  useEffect(() => {
    if (!standalone) return;
    setLivingUnlocked(true);
    setFlexibleMode(false);
    const current = readPlanDaySession(companion.dayKey);
    if (current.phase !== "living") {
      markPlanDayLiving(
        companion.dayKey,
        current.livingEntry ?? "flexible-build",
      );
    }
  }, [standalone, companion.dayKey]);

  /** Settings → Planning (and in-room last-used) keep this panel in sync. */
  useEffect(() => {
    const syncView = () => {
      const next = resolveInitialPlanningView(
        getDayState()?.energy ?? dayEnergy,
      );
      setView((current) => (current === next ? current : next));
    };
    window.addEventListener("companion-prefs-updated", syncView);
    return () => window.removeEventListener("companion-prefs-updated", syncView);
  }, [dayEnergy]);

  useEffect(() => {
    if (standalone) return;
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
    const loaded = loadTodayPlanItems();
    setItems(loaded);
    if (loaded.some(isMeaningfulPlanItem)) {
      enterTodaysPlanFromSavedItems();
    }

    const promptState = readPreviousDayPromptState();
    if (promptState.reviewSourceDate) {
      setReviewingPreviousDay(promptState.reviewSourceDate);
      setPreviousDayPrompt(null);
    } else if (shouldShowPreviousDayPrompt()) {
      const held = findHeldPreviousDayUnfinished();
      if (held) {
        setPreviousDayPrompt({
          sourceDate: held.date,
          count: held.unfinished.length,
        });
      }
    } else {
      setPreviousDayPrompt(null);
    }

    const sync = () => {
      const next = readTodayPlanItems();
      setItems(next);
      if (next.some(isMeaningfulPlanItem)) {
        enterTodaysPlanFromSavedItems();
      }
      setCompletionRevision((n) => n + 1);
      setPreviousReviewRevision((n) => n + 1);
    };
    window.addEventListener(PLAN_MY_DAY_UPDATED, sync);
    return () => window.removeEventListener(PLAN_MY_DAY_UPDATED, sync);
  }, []);

  /** First saved item for today → leave Start My Day for Today's Plan. */
  useEffect(() => {
    if (!hasMeaningfulToday) return;
    if (livingUnlocked && !flexibleMode) return;
    enterTodaysPlanFromSavedItems();
  }, [hasMeaningfulToday, livingUnlocked, flexibleMode]);

  useEffect(() => {
    if (!livingUnlocked) return;
    const suggestions = detectSmartLifeAreaSuggestions(items);
    setSmartLifeAreaSuggestion(suggestions[0] ?? null);
  }, [items, livingUnlocked]);

  useEffect(() => {
    if (!initialOpenItemId) return;
    const ensured =
      ensureCalendarPlanItem(initialOpenItemId) ??
      readTodayPlanItems().find((i) => i.id === initialOpenItemId) ??
      null;
    if (ensured) {
      setCalendarDetailItem(ensured);
      setOpenItemId(ensured.id);
      setItems((prev) =>
        prev.some((i) => i.id === ensured.id) ? prev : [...prev, ensured],
      );
    } else {
      setOpenItemId(initialOpenItemId);
    }
    setDetailMode("form");
    setLivingUnlocked(true);
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
        setCalendarDetailItem(null);
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
    ? items.find((i) => i.id === openItemId) ??
      (calendarDetailItem?.id === openItemId ? calendarDetailItem : null)
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
    setShowAddForm(!next.some(isMeaningfulPlanItem));
    setReadyLine(true);
    window.setTimeout(() => setReadyLine(false), 4000);
  }

  function enterFlexiblePlanning() {
    if (hasMeaningfulPlanItemsForToday() || items.some(isMeaningfulPlanItem)) {
      enterTodaysPlanFromSavedItems();
      return;
    }
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
    setShowAddForm(!next.some(isMeaningfulPlanItem));
    setConfirmedToday(false);
    setReadyLine(true);
    window.setTimeout(() => setReadyLine(false), 4000);
  }

  function acceptCompanionSuggestions() {
    unlockLiving(true, "flexible-suggestions");
  }

  function returnToGateway() {
    if (hasMeaningfulPlanItemsForToday() || items.some(isMeaningfulPlanItem)) {
      enterTodaysPlanFromSavedItems();
      return;
    }
    markPlanDayOrienting(companion.dayKey);
    setFlexibleMode(false);
    setLivingUnlocked(false);
    setShowAddForm(false);
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
    setDayPath("adapt");
    setEditingReality(true);
    setOpenItemId(null);
    setDetailMode("form");
  }

  function closeTodaysReality() {
    setEditingReality(false);
    if (dayPath === "adapt") setDayPath("plan");
  }

  function finishAdaptInsidePlan(_proposal: AdaptedDayProposal) {
    closeTodaysReality();
    setDayPath("plan");
    setLivingUnlocked(true);
    setFlexibleMode(false);
    refresh(loadTodayPlanItems());
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
    const ensured =
      ensureCalendarPlanItem(id) ??
      items.find((i) => i.id === id) ??
      null;
    if (ensured) {
      setCalendarDetailItem(ensured);
      setOpenItemId(ensured.id);
      setItems((prev) =>
        prev.some((i) => i.id === ensured.id) ? prev : [...prev, ensured],
      );
    } else {
      setOpenItemId(id);
    }
    setDetailMode(mode);
  }

  function handleOpenCalendarEventId(rawId: string) {
    const ensured = ensureCalendarPlanItem(rawId);
    if (!ensured) {
      onOpenAppointment?.(rawId);
      return;
    }
    setCalendarDetailItem(ensured);
    setOpenItemId(ensured.id);
    setDetailMode("form");
    setItems((prev) =>
      prev.some((i) => i.id === ensured.id) ? prev : [...prev, ensured],
    );
    // Stay on Calendar so Back returns to the planning calendar, not Today.
    if (planningArea !== "calendar") {
      setPlanningArea("calendar");
      try {
        localStorage.setItem(PLANNING_AREA_STORAGE_KEY, "calendar");
      } catch {
        /* ignore */
      }
    }
  }

  function handleCloseItem() {
    setOpenItemId(null);
    setCalendarDetailItem(null);
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
    setCompletionRevision((n) => n + 1);
    showCompletionToast(result.toast);
    if (openItemId === id) {
      setOpenItemId(null);
      setDetailMode("form");
    }
  }

  function handlePreviousDayLeave() {
    leavePreviousDayItemsThere();
    setPreviousDayPrompt(null);
    setReviewingPreviousDay(null);
  }

  function handlePreviousDayReview() {
    const sourceDate =
      previousDayPrompt?.sourceDate ??
      findHeldPreviousDayUnfinished()?.date ??
      null;
    if (!sourceDate) {
      setPreviousDayPrompt(null);
      return;
    }
    beginPreviousDayReview(sourceDate);
    setPreviousDayPrompt(null);
    setReviewingPreviousDay(sourceDate);
    setPreviousReviewRevision((n) => n + 1);
  }

  function handleClosePreviousReview() {
    clearPreviousDayReviewSession();
    setReviewingPreviousDay(null);
    setPreviousReviewRevision((n) => n + 1);
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
    enterTodaysPlanFromSavedItems();
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
            completedToday={completedToday}
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

  if (standalone) {
    const listItems = items.filter(
      (item) => isMeaningfulPlanItem(item) && !item.done,
    );
    return (
      <PlanMyDayMorningRoomShell onOutsideDismiss={() => onBack?.()}>
        <div
          className="flex h-full min-h-0 w-full flex-col overflow-y-auto"
          data-testid="plan-day-simple-paper"
          data-daily-state="todays-plan"
          data-experience-phase="todays-plan"
        >
          <PlanDayJourneyShell
            chapter="todays-plan"
            onBack={() => onBack?.()}
            onBackToChat={() => onBackToChat?.()}
            morningRoom
            memberOrderLayout
            hideHelp
          >
            <div className="mt-6 flex flex-col gap-8 pb-10">
              <PlanDaySimpleAdd
                onAdd={(title) => handleAdd({ title, column: "today" })}
              />
              <PlanDaySimpleList
                items={listItems}
                onComplete={handleCompleteItem}
                onEdit={(id, title) =>
                  refresh(updatePlanItem(items, id, { title }))
                }
                onDelete={(id) => refresh(deletePlanItem(items, id))}
              />
              <button
                type="button"
                onClick={() =>
                  requestPlanDayImStuck(listItems.map((item) => item.title))
                }
                className="self-start rounded-xl border border-[#c9bfb0] bg-white px-5 py-3 text-base font-semibold text-[#1e4f4f] hover:bg-[#f5f0ea]"
                data-testid="plan-day-im-stuck"
              >
                {PLAN_DAY_IM_STUCK_BUTTON_LABEL}
              </button>
            </div>
          </PlanDayJourneyShell>
        </div>
      </PlanMyDayMorningRoomShell>
    );
  }

  return (
    <CompanionWorkspaceShell
      workspaceId="plan-my-day"
      hideHeader
      className={`companion-fade-in h-full min-h-0 ${atmosphereClass}`}
    >
      {renderPanelBody()}
    </CompanionWorkspaceShell>
  );

  function renderPanelBody() {
    return (
      <div
        className="flex h-full min-h-0 w-full flex-col overflow-y-auto"
        data-plan-view={view}
        data-day-mode={companion.orientation.dayMode}
        data-experience-phase={
          showOrientation
            ? "start-my-day"
            : flexibleMode
              ? "flexible"
              : "todays-plan"
        }
        data-daily-state={
          showOrientation || (!livingUnlocked && !hasMeaningfulToday)
            ? "start-my-day"
            : "todays-plan"
        }
      >
      {showOrientation && standalone && !reviewingPreviousDay ? (
        <>
          {showPreviousDayBanner && previousDayPrompt ? (
            <div className="mx-auto w-full max-w-xl px-4 pt-4">
              <PlanDayPreviousDayPrompt
                {...previousDayPromptCopy(previousDayPrompt.count)}
                onReview={handlePreviousDayReview}
                onLeave={handlePreviousDayLeave}
              />
            </div>
          ) : null}
          <PlanMyDayMorningConversation
            judgment={companion.cycle.judgment}
            onPrevious={handleNavBack}
            onConfirm={() => unlockLiving(true, "confirmed")}
            onNotRightNow={enterFlexiblePlanning}
          />
          <div className="mx-auto w-full max-w-xl px-4 pb-10">
            <PlanDayAddForm onAdd={handleAdd} />
          </div>
        </>
      ) : (
      <PlanDayJourneyShell
        chapter={chapter}
        onBack={handleNavBack}
        onBackToChat={() => onBackToChat?.()}
        shariWhisper={standalone ? null : shariWhisper}
        hideHelp={showOrientation || flexibleMode || standalone}
        morningRoom={standalone}
        memberOrderLayout={showingTodaysPlan}
        headerActions={
          planningArea === "today" &&
          !showOrientation &&
          !flexibleMode &&
          !openItem &&
          !editingReality ? (
            <ViewDropdown active={view} onChange={handleViewChange} />
          ) : undefined
        }
      >
        {!showOrientation && !showingTodaysPlan ? (
          <PlanMyDayPlanningNav
            active={planningArea}
            onChange={handlePlanningAreaChange}
          />
        ) : null}

        {openItem ? (
          <div
            className="mt-4 plan-day-journey-chapter-enter"
            data-testid="plan-day-calendar-item-detail"
          >
            <PlanDayItemDetail
              key={`${openItem.id}-${detailMode}`}
              item={openItem}
              items={items}
              onItemsChange={(next) => {
                refresh(next);
                const updated = next.find((i) => i.id === openItem.id);
                if (updated) setCalendarDetailItem(updated);
              }}
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
        ) : planningArea === "rhythms" ? (
          <div className="plan-day-journey-chapter-enter">
            <PlanMyDayRhythmsArea initialTab={initialRhythmsTab ?? undefined} />
          </div>
        ) : planningArea === "calendar" ? (
          <div className="plan-day-journey-chapter-enter">
            <PlanMyDayCalendarArea
              onOpenEvent={(ev) => {
                if (ev.source === "spark-plan" && ev.id.startsWith("plan-")) {
                  handleOpenItem(ev.id.slice("plan-".length));
                  return;
                }
                if (
                  ev.source === "spark-appointment" &&
                  ev.id.startsWith("tb-")
                ) {
                  handleOpenCalendarEventId(ev.id);
                }
              }}
            />
          </div>
        ) : planningArea === "upcoming" ? (
          <div className="plan-day-journey-chapter-enter">
            <PlanMyDayUpcomingArea
              onBroughtToToday={refresh}
              onGoToToday={() => handlePlanningAreaChange("today")}
            />
          </div>
        ) : planningArea === "parking-lot" ? (
          <div className="plan-day-journey-chapter-enter">
            <PlanMyDayParkingLotArea
              onBroughtToToday={refresh}
              onGoToToday={() => handlePlanningAreaChange("today")}
            />
          </div>
        ) : planningArea === "history" ? (
          <div className="plan-day-journey-chapter-enter">
            <PlanMyDayHistoryArea
              onTodayItemsChange={(next) => {
                refresh(next);
                enterTodaysPlanFromSavedItems();
              }}
              onGoToToday={() => handlePlanningAreaChange("today")}
            />
          </div>
        ) : reviewingPreviousDay ? (
          <div className="mt-4 plan-day-journey-chapter-enter">
            <PlanDayPreviousDayReview
              sourceDate={reviewingPreviousDay}
              items={previousReviewItems}
              onItemsChange={() => setPreviousReviewRevision((n) => n + 1)}
              onTodayItemsChange={(next) => {
                refresh(next);
                enterTodaysPlanFromSavedItems();
              }}
              onClose={handleClosePreviousReview}
            />
          </div>
        ) : dayPath === null && planningArea === "today" && !editingReality ? (
          <div className="flex flex-1 flex-col justify-center gap-6 py-6 plan-day-journey-chapter-enter">
            <PlanOrAdaptPathChooser
              onBack={onBack}
              onSelect={(choiceId) => {
                if (choiceId === "adapt-my-day") {
                  openTodaysReality();
                  return;
                }
                setDayPath("plan");
              }}
            />
          </div>
        ) : showOrientation && dayPath === "plan" ? (
          <div className="flex flex-1 flex-col justify-center gap-6 py-6 plan-day-journey-chapter-enter">
            {showPreviousDayBanner && previousDayPrompt ? (
              <PlanDayPreviousDayPrompt
                {...previousDayPromptCopy(previousDayPrompt.count)}
                onReview={handlePreviousDayReview}
                onLeave={handlePreviousDayLeave}
              />
            ) : null}
            <PlanDayOrientationSurface
              presentation={companion.orientation}
              onPrevious={() => setDayPath(null)}
              onConfirm={() => unlockLiving(true, "confirmed")}
              onOpenAdaptMyDay={openTodaysReality}
            />
            <PlanDayAddForm onAdd={handleAdd} />
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
              onOpenAppointment={(id) => handleOpenCalendarEventId(id)}
              onBringParkingItem={handleBringParkingItem}
              onOpenItem={(id) => handleOpenItem(id)}
              onReturnToGateway={returnToGateway}
            />
          </div>
        ) : editingReality ? (
          <div
            className="mt-4 plan-day-journey-chapter-enter"
            data-testid="plan-day-adapt-my-day"
          >
            <AdaptMyDayCheckIn
              onBack={closeTodaysReality}
              onUsePlan={finishAdaptInsidePlan}
              onAdjustPlan={finishAdaptInsidePlan}
              onStartFirstStep={finishAdaptInsidePlan}
              onKeepCurrentPlan={closeTodaysReality}
            />
          </div>
        ) : (
          <>
            <div
              className="mt-4 flex flex-col gap-4 plan-day-journey-chapter-enter"
              data-testid="plan-day-todays-plan-order"
              style={{ animationDelay: "120ms" }}
            >
              <div data-testid="plan-day-add-another-form">
                <PlanDayAddForm onAdd={handleAdd} />
              </div>

              <section
                aria-label="Today's Items"
                data-testid="plan-day-todays-items"
                className="flex flex-col gap-3"
              >
                <h2 className="text-lg font-semibold text-[#1f1c19]">
                  Today&apos;s Items
                </h2>
                {view !== "kanban" ? renderTaskView() : null}
                {view === "kanban" ? (
                  <div className={PLAN_KANBAN_BOARD_CLASS}>
                    {renderTaskView()}
                    {completedToday.length > 0 ? (
                      <div
                        className="mt-6"
                        data-testid="plan-day-completed-today-kanban"
                      >
                        <p className="text-lg font-semibold text-[#1f1c19]">
                          Completed Today
                        </p>
                        <ul className="mt-3 flex flex-col gap-2">
                          {completedToday.map((row) => (
                            <li
                              key={row.id}
                              className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/70 px-4 py-3 text-base text-[#4b463f]"
                            >
                              {row.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>

              <button
                type="button"
                onClick={() =>
                  requestPlanDayImStuck(
                    items.filter(isMeaningfulPlanItem).map((item) => item.title),
                  )
                }
                className="plan-day-morning-conversation__submit self-start"
                data-testid="plan-day-im-stuck"
              >
                {PLAN_DAY_IM_STUCK_BUTTON_LABEL}
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {showPreviousDayBanner && previousDayPrompt ? (
                <PlanDayPreviousDayPrompt
                  {...previousDayPromptCopy(previousDayPrompt.count)}
                  onReview={handlePreviousDayReview}
                  onLeave={handlePreviousDayLeave}
                />
              ) : null}
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
                      className="plan-day-morning-note__btn plan-day-morning-note__btn--secondary"
                    >
                      Adapt My Day
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
              {showingTodaysPlan ? (
                <PlanMyDayPlanningNav
                  active={planningArea}
                  onChange={handlePlanningAreaChange}
                />
              ) : null}
              {onOpenSettings ? (
                <div>
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
            </div>
          </>
        )}
      </PlanDayJourneyShell>
      )}
      </div>
    );
  }
}
