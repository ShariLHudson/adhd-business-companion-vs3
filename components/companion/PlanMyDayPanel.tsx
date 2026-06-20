"use client";

import { useEffect, useMemo, useState } from "react";
import { getDayState } from "@/lib/companionStore";
import {
  addQuickPlanItem,
  capacitySuggestionCopy,
  currentFocusItem,
  durationLabel,
  formatPlanTime,
  isPlanItemActive,
  loadTodayPlanItems,
  movePlanItemKanban,
  nextFocusOptions,
  planItemMetaLabel,
  planItemStyle,
  PLAN_MY_DAY_UPDATED,
  resolveInitialPlanningView,
  saveTodayPlanItems,
  PLANNING_VIEW_OPTIONS,
  setLastPlanningView,
  suggestedViewForCapacity,
  updatePlanItem,
  type PlanDayItem,
  type PlanItemColumn,
  type PlanningViewMode,
  type QuickPlanItemInput,
} from "@/lib/planMyDay";
import { PlanDayAddForm } from "@/components/companion/PlanDayAddForm";
import { BackButton } from "@/components/companion/BackButton";
import { PlanDayKanbanView } from "@/components/companion/PlanDayKanbanView";
import {
  PlanDayItemDetail,
  type PlanItemDetailMode,
} from "@/components/companion/PlanDayItemDetail";
import { LibraryCloseButton } from "@/components/companion/LibraryOrientationChrome";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { WorkspaceSectionHelp } from "@/components/companion/WorkspaceSectionHelp";
import { planViewSectionHelp } from "@/lib/planMyDay/planViewSectionHelp";
import { useCategoryColorCoding } from "@/lib/useCategoryColorCoding";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

const VIEW_PILL =
  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors";

function ViewSwitcher({
  active,
  onChange,
}: {
  active: PlanningViewMode;
  onChange: (mode: PlanningViewMode) => void;
}) {
  return (
    <div
      className="flex flex-wrap gap-1.5"
      role="tablist"
      aria-label="Planning view"
    >
      {PLANNING_VIEW_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="tab"
          aria-selected={active === opt.id}
          onClick={() => onChange(opt.id)}
          className={`${VIEW_PILL} ${
            active === opt.id
              ? "companion-btn-primary"
              : "bg-white text-[#4b463f] ring-1 ring-[#d4cdc3] hover:ring-[var(--cm-accent)]/40"
          }`}
        >
          {opt.label}
        </button>
      ))}
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
      <p className="text-sm font-semibold text-[#1f1c19]">Today&apos;s Focus</p>
      <ul className="mt-3 flex flex-col gap-2">
        {active.length === 0 ? (
          <li className="text-sm text-[#6b635a]">
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
                  className="flex w-full items-start gap-3 rounded-xl border bg-white px-3 py-2.5 text-left transition-colors hover:border-[#1e4f4f]/35"
                  style={{
                    borderColor: colorCoding ? `${style.color}44` : style.border,
                    borderLeftWidth: 4,
                    borderLeftColor: colorCoding ? style.color : style.border,
                    backgroundColor: colorCoding ? `${style.tint}cc` : style.tint,
                  }}
                >
                  <span className="min-w-0 flex-1">
                    <span className="text-base text-[#1f1c19]">{item.title}</span>
                    {item.keptForReference ? (
                      <span className="ml-2 text-[10px] font-bold uppercase text-[#1e4f4f]">
                        Reference
                      </span>
                    ) : null}
                    <span className="mt-0.5 block text-xs text-[#6b635a]">
                      {planItemMetaLabel(item, colorCoding)}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-[#9a8f82]" aria-hidden>
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
      <p className="text-sm font-semibold text-[#1f1c19]">Timeline</p>
      <ul className="mt-3 flex flex-col gap-2">
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
                    className="text-sm font-bold"
                    style={{ color: colorCoding ? "#fff" : "#4b463f" }}
                  >
                    {formatPlanTime(item.startTime)}
                  </span>
                </div>
                <div
                  className="flex min-w-0 flex-1 items-center px-4 py-3"
                  style={{ backgroundColor: colorCoding ? style.tint : "#ffffff" }}
                >
                  <span className="text-base font-semibold text-[#1f1c19]">
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
            <p className="mt-1 text-base font-semibold text-[#1f1c19]">
              {item.title}
            </p>
            <p
              className="mt-2 text-sm font-medium"
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

function VisualFocusView({
  items,
  onStart,
  onOpenItem,
  onPickNext,
  onTakeBreak,
}: {
  items: PlanDayItem[];
  onStart: (id: string) => void;
  onOpenItem: (id: string, mode?: PlanItemDetailMode) => void;
  onPickNext: (id: string) => void;
  onTakeBreak: () => void;
}) {
  const [justFinished, setJustFinished] = useState<string | null>(null);
  const focus = currentFocusItem(items);
  const next = nextFocusOptions(items, justFinished ?? focus?.id);

  if (justFinished) {
    return (
      <div className="rounded-2xl border border-[#c5e0e0] bg-gradient-to-br from-[#f0f8f8] to-white px-6 py-8 text-center">
        <p className="text-2xl font-semibold text-[#1f1c19]">Nice work.</p>
        <p className="mt-2 text-base text-[#6b635a]">
          What would you like next?
        </p>
        <ul className="mt-5 flex flex-col gap-2 text-left">
          {next.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setJustFinished(null);
                  onPickNext(item.id);
                }}
                className="flex w-full items-center gap-2 rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-left text-base font-semibold text-[#1f1c19] hover:border-[#1e4f4f]/40"
              >
                <span aria-hidden>▶</span>
                {item.title}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => {
                setJustFinished(null);
                onTakeBreak();
              }}
              className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[#d4cdc3] bg-[#faf7f2] px-4 py-3 text-left text-base font-semibold text-[#6b635a]"
            >
              <span aria-hidden>▶</span>
              Take a Break
            </button>
          </li>
        </ul>
      </div>
    );
  }

  if (!focus) {
    return (
      <p className="text-center text-base text-[#6b635a]">
        You&apos;re clear for today — add something above when you&apos;re ready.
      </p>
    );
  }

  return (
    <div className="plan-day-view-surface rounded-2xl border border-[#e7dfd4]/80 bg-[#faf7f2] p-1">
      <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white px-6 py-10 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
          Current Focus
        </p>
        <button
          type="button"
          onClick={() => onOpenItem(focus.id)}
          className="mt-4 block w-full text-3xl font-semibold text-[#1f1c19] hover:text-[#1e4f4f]"
        >
          {focus.title}
        </button>
        <p className="mt-2 text-lg text-[#6b635a]">{durationLabel(focus)}</p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => onStart(focus.id)}
            className="companion-btn-primary rounded-xl px-8 py-3 text-base font-semibold"
          >
            Start Now
          </button>
          <button
            type="button"
            onClick={() => onOpenItem(focus.id, "mark-done")}
            className="rounded-xl border border-[#1e4f4f]/35 bg-white px-6 py-3 text-base font-semibold text-[#1e4f4f]"
          >
            Mark Done
          </button>
        </div>
        <p className="mt-6 text-sm text-[#9a8f82]">
          Nothing else on screen — one thing at a time.
        </p>
      </div>
    </div>
  );
}

export function PlanMyDayPanel({
  onBack,
  onOpenSettings,
  onStartFocus,
  onOpenProject,
  registerBack,
  initialOpenItemId,
}: {
  onBack?: () => void;
  onOpenSettings?: () => void;
  /** Optional — e.g. open focus timer for an item */
  onStartFocus?: (item: PlanDayItem) => void;
  onOpenProject?: (projectId: string) => void;
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

  useEffect(() => {
    setItems(loadTodayPlanItems());
    const sync = () => setItems(loadTodayPlanItems());
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

  const capacityHint = useMemo(
    () => capacitySuggestionCopy(dayEnergy),
    [dayEnergy],
  );

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

  function handleKanbanDrop(id: string, column: PlanItemColumn) {
    const result = movePlanItemKanban(items, id, column);
    refresh(result.items);
    if (result.enteredDone) {
      setKanbanToast(`✓ ${result.itemTitle} completed`);
      window.setTimeout(() => setKanbanToast(null), 2800);
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

  function handlePickNext(id: string) {
    const next = items.map((it) =>
      it.id === id
        ? {
            ...it,
            column: "doing" as const,
            done: false,
            focusRank: Date.now(),
          }
        : it,
    );
    refresh(saveTodayPlanItems(next));
  }

  function handleAdd(input: QuickPlanItemInput) {
    refresh(addQuickPlanItem(input));
  }

  function handleViewChange(mode: PlanningViewMode) {
    setView(mode);
    setLastPlanningView(mode);
  }

  const activeViewMeta = PLANNING_VIEW_OPTIONS.find((o) => o.id === view);

  return (
    <div
      className={`${workspacePanelShellClass({ width: "standard", inSplit: true })} companion-panel-surface`}
      data-plan-view={view}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#e7dfd4] pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1f1c19]">Plan My Day</h1>
          <p className="mt-1 text-base text-[#6b635a]">
            The same plan — shown the way your brain works today.
          </p>
        </div>
        {onBack ? <LibraryCloseButton onClose={onBack} /> : null}
      </div>

      <WorkspaceAreaWorksGuide areaId="plan-my-day" />

      {openItem ? (
        <div className="mt-4">
          <BackButton
            onClick={handleCloseItem}
            label="Back to Plan My Day"
            size="compact"
            className="mb-3"
          />
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
          />
        </div>
      ) : (
        <>
          {capacityHint ? (
            <p className="mt-4 rounded-xl border border-[#c5e0e0] bg-[#f0f8f8] px-3 py-2 text-sm text-[#1e4f4f]">
              {capacityHint}
              {suggestedViewForCapacity(dayEnergy) !== view ? (
                <button
                  type="button"
                  onClick={() =>
                    handleViewChange(suggestedViewForCapacity(dayEnergy))
                  }
                  className="ml-2 font-semibold underline decoration-[#1e4f4f]/40"
                >
                  Try{" "}
                  {
                    PLANNING_VIEW_OPTIONS.find(
                      (o) => o.id === suggestedViewForCapacity(dayEnergy),
                    )?.label
                  }
                </button>
              ) : null}
            </p>
          ) : null}

          <div className="mt-4">
            <ViewSwitcher active={view} onChange={handleViewChange} />
            {activeViewMeta ? (
              <p className="mt-2 text-sm text-[#6b635a]">
                {activeViewMeta.desc}
              </p>
            ) : null}
            {(() => {
              const viewHelp = planViewSectionHelp(view);
              return viewHelp ? (
                <div className="mt-3">
                  <WorkspaceSectionHelp
                    title={viewHelp.title}
                    bullets={viewHelp.bullets}
                  />
                </div>
              ) : null;
            })()}
          </div>

          <div className="mt-4">
            <PlanDayAddForm onAdd={handleAdd} />
          </div>

          <div className="mt-5">
            {kanbanToast ? (
              <p
                className="companion-fade-in mb-3 rounded-xl border border-[#c5e0e0] bg-[#f0f8f8] px-4 py-2.5 text-center text-sm font-semibold text-[#1e4f4f]"
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
                colorCoding={colorCoding}
              />
            ) : null}
            {view === "visual-focus" ? (
              <VisualFocusView
                items={items}
                onStart={handleStartFocus}
                onOpenItem={handleOpenItem}
                onPickNext={handlePickNext}
                onTakeBreak={() => handleViewChange("list")}
              />
            ) : null}
          </div>

          {onOpenSettings ? (
            <p className="mt-6 text-sm text-[#6b635a]">
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
          ) : null}
        </>
      )}
    </div>
  );
}
