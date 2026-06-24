"use client";

import { useEffect, useState } from "react";
import { getDayState } from "@/lib/companionStore";
import {
  addQuickPlanItem,
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
import { PlanDayAddForm } from "@/components/companion/PlanDayAddForm";
import { PlanDayKanbanView } from "@/components/companion/PlanDayKanbanView";
import { TodaysRealitySummary } from "@/components/companion/TodaysRealitySummary";
import {
  PlanDayItemDetail,
  type PlanItemDetailMode,
} from "@/components/companion/PlanDayItemDetail";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import {
  dismissPlanRealityPrompt,
  evaluatePlanRealityMismatch,
  type RealityMismatchPrompt,
} from "@/lib/planMyDay/planRealityAlignment";
import { useCategoryColorCoding } from "@/lib/useCategoryColorCoding";

/** Readable centered column — matches other companion workspaces. */
const PLAN_CENTERED_CLASS = "mx-auto w-full max-w-3xl";
/** Kanban board — centered but wider than the header/entry column. */
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

function ListView({
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
    <div>
      <p className="text-lg font-semibold text-[#1f1c19]">Today&apos;s Focus</p>
      <ul className="mt-3 flex flex-col gap-2">
        {active.length === 0 ? (
          <li className="text-base text-[#6b635a]">
            Nothing on the plan yet — add something above.
          </li>
        ) : (
          active.map((item) => {
            const style = planItemStyle(item, colorCoding);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onOpen(item.id)}
                  className="flex w-full items-start gap-3 rounded-xl border bg-white px-4 py-3 text-left transition-colors hover:border-[#1e4f4f]/35"
                  style={{
                    borderColor: colorCoding ? `${style.color}44` : style.border,
                    borderLeftWidth: 4,
                    borderLeftColor: colorCoding ? style.color : style.border,
                    backgroundColor: colorCoding ? `${style.tint}cc` : style.tint,
                  }}
                >
                  <span className="min-w-0 flex-1">
                    <span className="text-lg text-[#1f1c19]">{item.title}</span>
                    {item.keptForReference ? (
                      <span className="ml-2 text-xs font-bold uppercase text-[#1e4f4f]">
                        Reference
                      </span>
                    ) : null}
                    <span className="mt-0.5 block text-base text-[#6b635a]">
                      {planItemMetaLabel(item, colorCoding)}
                    </span>
                  </span>
                  <span className="shrink-0 text-base text-[#9a8f82]" aria-hidden>
                    →
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
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
                  {colorCoding ? (
                    <span
                      className="ml-auto hidden text-xs font-bold uppercase tracking-wide sm:inline"
                      style={{ color: style.color }}
                    >
                      {style.label}
                    </span>
                  ) : null}
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
            {colorCoding ? (
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: style.color }}
              >
                {style.label}
              </p>
            ) : null}
            <p className="mt-1 text-lg font-semibold text-[#1f1c19]">
              {item.title}
            </p>
            <p
              className="mt-2 text-base font-medium"
              style={{ color: colorCoding ? style.color : "#6b635a" }}
            >
              {durationLabel(item)}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export function PlanMyDayPanel({
  onOpenSettings,
  onStartFocus,
  onOpenProject,
  onOpenAdaptMyDay,
  registerBack,
  initialOpenItemId,
}: {
  onBack?: () => void;
  onOpenSettings?: () => void;
  /** Optional — e.g. open focus timer for an item */
  onStartFocus?: (item: PlanDayItem) => void;
  onOpenProject?: (projectId: string) => void;
  onOpenAdaptMyDay?: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  initialOpenItemId?: string | null;
}) {
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

  useEffect(() => {
    setItems(loadTodayPlanItems());
    const sync = () => setItems(readTodayPlanItems());
    window.addEventListener(PLAN_MY_DAY_UPDATED, sync);
    return () => window.removeEventListener(PLAN_MY_DAY_UPDATED, sync);
  }, []);

  useEffect(() => {
    if (initialOpenItemId) {
      setOpenItemId(initialOpenItemId);
      setDetailMode("form");
    }
  }, [initialOpenItemId]);

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => {
      if (openItemId) {
        if (detailMode !== "form") {
          setDetailMode("form");
          return true;
        }
        setOpenItemId(null);
        setDetailMode("form");
        return true;
      }
      return false;
    });
    return () => registerBack(null);
  }, [registerBack, openItemId, detailMode]);

  const openItem = openItemId
    ? items.find((i) => i.id === openItemId) ?? null
    : null;

  function refresh(next: PlanDayItem[]) {
    setItems(next);
  }

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
      return;
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
    const next = addQuickPlanItem(input);
    refresh(next);
    const title = typeof input === "string" ? input : input.title;
    const prompt = evaluatePlanRealityMismatch(next, { newItemTitle: title });
    if (prompt) setRealityPrompt(prompt);
  }

  function handleViewChange(mode: PlanningViewMode) {
    setView(mode);
    setLastPlanningView(mode);
  }

  function handleUpdateTodaysReality() {
    setRealityPrompt(null);
    onOpenAdaptMyDay?.();
  }

  function handleKeepCurrentReality() {
    dismissPlanRealityPrompt(items);
    setRealityPrompt(null);
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
          <ListView
            items={items}
            onOpen={(id) => handleOpenItem(id)}
            colorCoding={colorCoding}
          />
        ) : null}
        {view === "timeline" ? (
          <TimelineView
            items={items}
            onOpen={(id) => handleOpenItem(id)}
            colorCoding={colorCoding}
          />
        ) : null}
        {view === "cards" ? (
          <CardsView
            items={items}
            onOpen={(id) => handleOpenItem(id)}
            colorCoding={colorCoding}
          />
        ) : null}
        {view === "kanban" ? (
          <PlanDayKanbanView
            items={items}
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
      className="companion-fade-in companion-panel-surface flex h-full min-h-0 w-full flex-col overflow-y-auto px-6 py-8"
      data-plan-view={view}
    >
      {!openItem ? (
        <div className={PLAN_CENTERED_CLASS}>
          <WorkspaceAreaWorksGuide areaId="plan-my-day" />
        </div>
      ) : null}

      <div className={`${PLAN_CENTERED_CLASS} ${openItem ? "" : "mt-4"}`}>
        <div className="flex flex-col gap-3 border-b border-[#e7dfd4] pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-[#1f1c19] lg:text-3xl">
              Plan My Day™
            </h1>
            <p className="mt-1 text-base leading-relaxed text-[#6b635a] lg:text-lg">
              Choose what fits today&apos;s reality — not everything on your mind.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
            <ViewDropdown active={view} onChange={handleViewChange} />
          </div>
        </div>
      </div>

      {openItem ? (
        <div className={`mt-4 ${PLAN_CENTERED_CLASS}`}>
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
          <div className={`mt-4 flex flex-col gap-4 ${PLAN_CENTERED_CLASS}`}>
            {realityPrompt ? (
              <div
                className="rounded-xl border border-[#c9bfb0] bg-[#faf7f2] p-4"
                role="status"
                aria-live="polite"
              >
                <p className="text-base font-semibold text-[#1f1c19]">
                  Your plan may have changed since your last check-in.
                </p>
                <p className="mt-2 text-sm text-[#6b635a]">You originally said:</p>
                <ul className="mt-1 list-inside list-disc text-sm text-[#6b635a]">
                  {realityPrompt.realitySummary.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-[#6b635a]">
                  {realityPrompt.reasons[0]}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleKeepCurrentReality}
                    className="rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-sm font-semibold text-[#6b635a] hover:bg-[#f5f0ea]"
                  >
                    Keep Current Reality
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateTodaysReality}
                    className="rounded-xl border border-[#1e4f4f]/30 bg-[#1e4f4f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#163c3c]"
                  >
                    Update Today&apos;s Reality
                  </button>
                </div>
              </div>
            ) : null}
            <TodaysRealitySummary />
            <p className="text-center text-sm text-[#9a8f82]">
              Add a task → decide where it belongs → work the board. Kanban:
              Considering Today → Today&apos;s Focus → In Progress. Tap ✓ to
              complete — items archive and leave the board.
            </p>
            <PlanDayAddForm onAdd={handleAdd} />
            {view !== "kanban" ? renderTaskView() : null}
          </div>
          {view === "kanban" ? (
            <div className={`mt-4 ${PLAN_KANBAN_BOARD_CLASS}`}>
              {renderTaskView()}
            </div>
          ) : null}
          {onOpenSettings ? (
            <div className={`mt-4 ${PLAN_CENTERED_CLASS}`}>
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
    </div>
  );
}
