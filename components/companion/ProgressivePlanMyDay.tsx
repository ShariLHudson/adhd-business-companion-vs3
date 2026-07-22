"use client";

import { useEffect, useMemo, useState } from "react";
import { PlanDaySimpleAdd } from "@/components/companion/PlanDaySimpleAdd";
import { PlanDaySimpleList } from "@/components/companion/PlanDaySimpleList";
import { parseMindCapture } from "@/lib/planMyDay/morningConversation";
import {
  PLAN_DAY_IM_STUCK_BUTTON_LABEL,
  requestPlanDayImStuck,
} from "@/lib/planMyDay/planDayImStuck";
import {
  addQuickPlanItem,
  addQuickPlanItems,
  deferPlanItemToDate,
  deletePlanItem,
  finishPlanItem,
  isMeaningfulPlanItem,
  loadPlanWorkflowState,
  savePlanWorkflowState,
  saveTodayPlanItems,
  updatePlanItem,
  type PlanDayItem,
} from "@/lib/planMyDay";
import {
  advanceProgressiveStage,
  applyEnergyAdjustment,
  buildProgressiveTodayPlan,
  energyLabel,
  loadProgressivePlanState,
  morningGreeting,
  memberFirstName,
  progressiveStageTestId,
  PROGRESSIVE_USABLE_TIME_OPTIONS,
  quietPullInTodayItems,
  resolveEnergyBaselineForAsk,
  resolveQuietPlanningStyle,
  saveProgressivePlanState,
  shouldAskFreshEnergy,
  shouldAskPlanningStyleDaily,
  writeEnergyBaseline,
  type ProgressivePlanState,
  type ProgressivePlanStage,
} from "@/lib/planMyDay/progressivePlanFlow";
import {
  buildManualMoveReshapeOffer,
  dismissReshapeAskForToday,
  ensureSortOrders,
  lockPlanItemPosition,
  movePlanItemRelative,
  optimizeDayAroundLocks,
  pinPlanItemToTop,
  recordPlanReorderPreference,
  reorderFlexiblePlanItems,
  shouldAskReshapeToday,
  tomorrowDateStr,
} from "@/lib/planMyDay/todaysPlanReorder";

const CHOICE =
  "rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base font-semibold text-[#1f1c19] shadow-sm transition-colors hover:border-[#1e4f4f] hover:bg-[#f3f7f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]";
const CHOICE_SELECTED =
  "rounded-xl border-2 border-[#1e4f4f] bg-[#1e4f4f]/12 px-4 py-3 text-base font-semibold text-[#1e4f4f] shadow-sm";
const PRIMARY =
  "companion-btn-primary self-start rounded-xl px-6 py-3.5 text-base font-semibold";
const SECONDARY =
  "self-start rounded-xl border border-[#c9bfb0] bg-white px-5 py-3 text-base font-semibold text-[#1e4f4f] hover:bg-[#f5f0ea]";

type Props = {
  items: PlanDayItem[];
  onItemsChange: (items: PlanDayItem[]) => void;
  onOpenAdapt?: () => void;
  onImStuck?: (extras?: {
    availableTime?: string | null;
    energy?: string | null;
    activeStep?: string | null;
  }) => void;
};

function activeList(items: PlanDayItem[]): PlanDayItem[] {
  return ensureSortOrders(
    items.filter((item) => isMeaningfulPlanItem(item) && !item.done),
  );
}

/**
 * Progressive Plan My Day — one decision at a time on the simple paper path.
 */
export function ProgressivePlanMyDay({
  items,
  onItemsChange,
  onOpenAdapt,
  onImStuck,
}: Props) {
  const [flow, setFlow] = useState<ProgressivePlanState>(() =>
    loadProgressivePlanState(),
  );
  const [mindDraft, setMindDraft] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [reshapeOffer, setReshapeOffer] = useState<{
    message: string;
  } | null>(null);
  const [breakSourceId, setBreakSourceId] = useState<string | null>(null);
  const [breakDraft, setBreakDraft] = useState("");
  /** Adjust This Plan — in-place rearrange/edit/delete, never Adapt My Day. */
  const [adjustOpen, setAdjustOpen] = useState(false);
  /** Optimize My Day — honest, visible feedback every time (never a silent no-op). */
  const [optimizeNotice, setOptimizeNotice] = useState<string | null>(null);

  useEffect(() => {
    setFlow(loadProgressivePlanState());
  }, []);

  // Belt-and-suspenders: never carry an open "+ Add" form across a stage
  // change — each stage starts with the calm, collapsed control. `go()`
  // below already closes it synchronously; this covers any other path.
  const stageForAddReset = flow.stage;
  useEffect(() => {
    setShowAdd(false);
  }, [stageForAddReset]);

  const listItems = useMemo(() => activeList(items), [items]);
  const name = memberFirstName();
  const baseline = resolveEnergyBaselineForAsk();
  const askFreshEnergy = shouldAskFreshEnergy();

  function persistFlow(next: ProgressivePlanState) {
    setFlow(saveProgressivePlanState(next));
  }

  function go(stage: ProgressivePlanStage, patch?: Partial<ProgressivePlanState>) {
    setShowAdd(false);
    persistFlow(advanceProgressiveStage(flow, stage, patch));
  }

  function commitItems(next: PlanDayItem[]) {
    onItemsChange(saveTodayPlanItems(ensureSortOrders(next)));
  }

  function handleMindContinue(raw: string) {
    const trimmed = raw.trim();
    if (trimmed) {
      const titles = parseMindCapture(trimmed);
      const parts = titles.length > 0 ? titles : [trimmed];
      const next = addQuickPlanItems(parts, items);
      onItemsChange(next);
      const prior = loadPlanWorkflowState();
      savePlanWorkflowState({
        ...prior,
        sourceInputs: [...prior.sourceInputs, trimmed].filter(Boolean),
        stage:
          prior.stage === "planned" || prior.stage === "started"
            ? prior.stage
            : "capture",
      });
    }
    const pulled = quietPullInTodayItems();
    onItemsChange(pulled);
    go("anything-else", { skippedMindCapture: !trimmed });
    setMindDraft("");
  }

  function handleAlreadyKnow() {
    const pulled = quietPullInTodayItems();
    onItemsChange(pulled);
    go("anything-else", { skippedMindCapture: true });
  }

  function handleReorder(draggedId: string, targetIndex: number) {
    const next = reorderFlexiblePlanItems(listItems, draggedId, targetIndex);
    const full = mergeOrderedIntoFull(items, next);
    commitItems(full);
    const moved = listItems.find((i) => i.id === draggedId);
    recordPlanReorderPreference({
      kind: "manual-move",
      itemTitle: moved?.title,
      toTop: targetIndex === 0,
    });
    if (moved && shouldAskReshapeToday() && flow.stage === "today") {
      setReshapeOffer(
        buildManualMoveReshapeOffer({
          movedTitle: moved.title,
          toTop: targetIndex === 0,
        }),
      );
    }
  }

  function mergeOrderedIntoFull(
    all: PlanDayItem[],
    orderedActive: PlanDayItem[],
  ): PlanDayItem[] {
    const byId = new Map(all.map((i) => [i.id, i]));
    const orderedIds = new Set(orderedActive.map((i) => i.id));
    const rest = all.filter((i) => !orderedIds.has(i.id));
    return [
      ...orderedActive.map((i) => ({ ...byId.get(i.id)!, ...i })),
      ...rest,
    ];
  }

  function applyListTransform(
    transform: (active: PlanDayItem[]) => PlanDayItem[],
  ) {
    commitItems(mergeOrderedIntoFull(items, transform(listItems)));
  }

  /**
   * Optimize My Day — rearranges flexible (unscheduled) tasks around fixed
   * appointments and locked items, using priority plus learned scheduling
   * patterns. Locked/timed items never move. Always gives honest, visible
   * feedback — never a silent no-op (Primary Action Feedback™).
   */
  function runOptimizeMyDay() {
    const before = listItems.map((i) => i.id);
    const optimized = optimizeDayAroundLocks(listItems);
    const changed = before.some((id, index) => optimized[index]?.id !== id);
    applyListTransform(() => optimized);
    setOptimizeNotice(
      changed
        ? "Optimized — flexible tasks moved around your fixed times and locked items."
        : "Your day's already in a good order — nothing needed to change.",
    );
    window.setTimeout(() => setOptimizeNotice(null), 4500);
  }

  function handleBuildDay() {
    go("building");
    // Quiet build — no AI paragraphs on screen.
    const result = buildProgressiveTodayPlan({
      items: listItems,
      availableMinutes: flow.usableMinutes,
      energy: flow.energy,
    });
    onItemsChange(result.items);
    // Resolve style quietly (never ask).
    void resolveQuietPlanningStyle();
    void shouldAskPlanningStyleDaily();
    go("today", {
      usableMinutes: flow.usableMinutes,
      energy: flow.energy,
      energyAnswered: true,
    });
  }

  function startNextTask() {
    const workflow = loadPlanWorkflowState();
    const id = workflow.currentTaskId ?? workflow.primaryOutcomeId ?? listItems[0]?.id;
    if (!id) return;
    const next = updatePlanItem(items, id, {
      column: "doing",
      priority: "high",
    });
    onItemsChange(next);
    savePlanWorkflowState({
      ...workflow,
      stage: "started",
      currentTaskId: id,
    });
  }

  function breakIntoSteps(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setBreakSourceId(id);
    setBreakDraft(
      `1. Start ${item.title}\n2. Continue ${item.title}\n3. Finish ${item.title}`,
    );
  }

  function confirmBreak() {
    if (!breakSourceId) return;
    const lines = breakDraft
      .split(/\n+/)
      .map((l) => l.replace(/^\d+[.)]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 3);
    if (lines.length < 2) return;
    let next = deletePlanItem(items, breakSourceId);
    for (const title of lines) {
      next = addQuickPlanItem({ title, column: "today" }, next);
    }
    onItemsChange(next);
    setBreakSourceId(null);
    setBreakDraft("");
  }

  function stuck() {
    const extras = {
      availableTime: flow.usableMinutes ? `${flow.usableMinutes}m` : null,
      energy: flow.energy ?? null,
      activeStep: flow.stage,
    };
    if (onImStuck) onImStuck(extras);
    else requestPlanDayImStuck(listItems.map((i) => i.title), extras);
  }

  const stage = flow.stage;

  return (
    <div
      className="mt-4 flex flex-col gap-6 pb-8"
      data-testid="plan-day-progressive"
      data-stage={stage}
    >
      <div data-testid={progressiveStageTestId(stage)} />

      {stage === "mind" ? (
        <section className="flex flex-col gap-4" aria-label="What's on your mind">
          <h2
            className="text-2xl font-semibold text-[#1f1c19]"
            data-testid="plan-day-good-morning"
          >
            {morningGreeting(name)}
          </h2>
          <p className="text-lg text-[#4b463f]">What&apos;s on your mind today?</p>
          <label className="sr-only" htmlFor="plan-day-mind-input">
            What&apos;s on your mind today?
          </label>
          <textarea
            id="plan-day-mind-input"
            value={mindDraft}
            onChange={(e) => setMindDraft(e.target.value)}
            rows={3}
            placeholder="Anything you want to do, remember, or get off your mind…"
            className="w-full rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base text-[#1f1c19] outline-none placeholder:text-[#9a8f82] focus:border-[#1e4f4f]"
            data-testid="plan-day-mind-input"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={PRIMARY}
              data-testid="plan-day-mind-continue"
              onClick={() => handleMindContinue(mindDraft)}
              disabled={!mindDraft.trim()}
            >
              Continue
            </button>
            <button
              type="button"
              className={SECONDARY}
              data-testid="plan-day-already-know"
              onClick={handleAlreadyKnow}
            >
              I already know.
            </button>
          </div>
        </section>
      ) : null}

      {stage === "anything-else" ? (
        <section className="flex flex-col gap-4" aria-label="Anything else today">
          <p
            className="text-lg leading-relaxed text-[#1f1c19]"
            data-testid="plan-day-anything-else-question"
          >
            Does anything else need to happen today?
          </p>
          {listItems.length > 0 ? (
            <PlanDaySimpleList
              mode="calm-list"
              title="Added so far"
              items={listItems}
              onEdit={(id, title) =>
                onItemsChange(updatePlanItem(items, id, { title }))
              }
              onDelete={(id) => onItemsChange(deletePlanItem(items, id))}
            />
          ) : null}
          {showAdd ? (
            <PlanDaySimpleAdd
              onAdd={(raw) => {
                const titles = parseMindCapture(raw);
                const parts = titles.length > 0 ? titles : [raw.trim()];
                onItemsChange(addQuickPlanItems(parts, items));
                setShowAdd(false);
              }}
            />
          ) : (
            <button
              type="button"
              className={SECONDARY}
              data-testid="plan-day-add-something"
              onClick={() => setShowAdd(true)}
            >
              + Add Something
            </button>
          )}
          <button
            type="button"
            className={PRIMARY}
            data-testid="plan-day-anything-else-continue"
            onClick={() => go("list")}
          >
            Continue
          </button>
        </section>
      ) : null}

      {stage === "list" ? (
        <section className="flex flex-col gap-5" aria-label="Today's list step">
          <PlanDaySimpleList
            mode="calm-list"
            items={listItems}
            onItemsChange={commitItems}
            onComplete={(id) => {
              const result = finishPlanItem(items, id);
              if (result) onItemsChange(result.items);
            }}
            onEdit={(id, title) =>
              onItemsChange(updatePlanItem(items, id, { title }))
            }
            onDelete={(id) => onItemsChange(deletePlanItem(items, id))}
            onReorder={handleReorder}
            onMoveUp={(id) =>
              applyListTransform((active) => movePlanItemRelative(active, id, "up"))
            }
            onMoveDown={(id) =>
              applyListTransform((active) =>
                movePlanItemRelative(active, id, "down"),
              )
            }
            onPinToTop={(id) =>
              applyListTransform((active) => pinPlanItemToTop(active, id))
            }
            onLockPosition={(id) =>
              applyListTransform((active) => lockPlanItemPosition(active, id))
            }
            onSetPreferredTime={(id, time) =>
              onItemsChange(
                updatePlanItem(items, id, {
                  preferredTime: time,
                  startTime: time,
                }),
              )
            }
            onChangeDuration={(id, minutes) =>
              onItemsChange(updatePlanItem(items, id, { durationMinutes: minutes }))
            }
            onAddNotes={(id, notes) =>
              onItemsChange(updatePlanItem(items, id, { notes }))
            }
            onBreakIntoSteps={breakIntoSteps}
            onSkipUntilTomorrow={(id) =>
              onItemsChange(deferPlanItemToDate(items, id, tomorrowDateStr()))
            }
            onMoveToAnotherDay={(id) =>
              onItemsChange(deferPlanItemToDate(items, id, tomorrowDateStr()))
            }
          />
          {showAdd ? (
            <PlanDaySimpleAdd
              onAdd={(raw) => {
                const titles = parseMindCapture(raw);
                const parts = titles.length > 0 ? titles : [raw.trim()];
                onItemsChange(addQuickPlanItems(parts, items));
                setShowAdd(false);
              }}
            />
          ) : (
            <button
              type="button"
              className={SECONDARY}
              data-testid="plan-day-add-item"
              onClick={() => setShowAdd(true)}
            >
              + Add Item
            </button>
          )}
          <button
            type="button"
            className={PRIMARY}
            data-testid="plan-day-list-continue"
            onClick={() => go("usable-time")}
          >
            Continue
          </button>
        </section>
      ) : null}

      {stage === "usable-time" ? (
        <section className="flex flex-col gap-4" aria-label="Usable time">
          <p
            className="text-lg text-[#1f1c19]"
            data-testid="plan-day-usable-time-question"
          >
            About how much usable time do you have today?
          </p>
          <div className="flex flex-wrap gap-2" role="group">
            {PROGRESSIVE_USABLE_TIME_OPTIONS.map((opt) => {
              const selected = flow.usableMinutes === opt.minutes;
              return (
                <button
                  key={opt.minutes}
                  type="button"
                  aria-pressed={selected}
                  className={selected ? CHOICE_SELECTED : CHOICE}
                  data-testid={`plan-day-usable-${opt.minutes}`}
                  onClick={() => {
                    persistFlow({ ...flow, usableMinutes: opt.minutes });
                    go("energy", { usableMinutes: opt.minutes });
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {stage === "energy" ? (
        <section className="flex flex-col gap-4" aria-label="Energy check">
          {!askFreshEnergy && baseline ? (
            <>
              <p
                className="text-lg text-[#1f1c19]"
                data-testid="plan-day-energy-same-question"
              >
                Yesterday you felt {baseline.label}. Still about the same?
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["same", "Yes"],
                    ["lower", "Lower"],
                    ["higher", "Higher"],
                  ] as const
                ).map(([adj, label]) => (
                  <button
                    key={adj}
                    type="button"
                    className={CHOICE}
                    data-testid={`plan-day-energy-${adj}`}
                    onClick={() => {
                      const energy = applyEnergyAdjustment(baseline.energy, adj);
                      writeEnergyBaseline(energy);
                      go("building", { energy, energyAnswered: true });
                      const result = buildProgressiveTodayPlan({
                        items: listItems,
                        availableMinutes: flow.usableMinutes,
                        energy,
                      });
                      onItemsChange(result.items);
                      go("today", { energy, energyAnswered: true });
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p
                className="text-lg text-[#1f1c19]"
                data-testid="plan-day-energy-fresh-question"
              >
                How&apos;s your energy today?
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["low", "A bit low"],
                    ["steady", "Steady"],
                    ["high", "Strong"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={CHOICE}
                    data-testid={`plan-day-energy-pick-${id}`}
                    onClick={() => {
                      writeEnergyBaseline(id);
                      const result = buildProgressiveTodayPlan({
                        items: listItems,
                        availableMinutes: flow.usableMinutes,
                        energy: id,
                      });
                      onItemsChange(result.items);
                      go("today", { energy: id, energyAnswered: true });
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
          {/* Motivation intentionally omitted — inferred later if needed. */}
          <p className="sr-only" data-testid="plan-day-no-motivation-screen">
            No motivation screen
          </p>
          <p className="sr-only" data-testid="plan-day-no-style-ask">
            Planning style is not asked daily
          </p>
        </section>
      ) : null}

      {stage === "building" ? (
        <p
          className="text-base text-[#6b635a]"
          data-testid="plan-day-building"
        >
          Building your day…
        </p>
      ) : null}

      {stage === "today" ? (
        <section className="flex flex-col gap-5" aria-label="Today timeline">
          {adjustOpen ? (
            <p
              className="text-base leading-relaxed text-[#4b463f]"
              data-testid="plan-day-adjust-plan-active"
            >
              Move things up or down, edit, or remove anything below —
              right here in today&apos;s plan.
            </p>
          ) : null}
          <PlanDaySimpleList
            mode="timeline"
            title="TODAY"
            items={listItems}
            forceExpandActions={adjustOpen}
            onComplete={(id) => {
              const result = finishPlanItem(items, id);
              if (result) onItemsChange(result.items);
            }}
            onEdit={(id, title) =>
              onItemsChange(updatePlanItem(items, id, { title }))
            }
            onDelete={(id) => onItemsChange(deletePlanItem(items, id))}
            onReorder={handleReorder}
            onMoveUp={(id) =>
              applyListTransform((active) => movePlanItemRelative(active, id, "up"))
            }
            onMoveDown={(id) =>
              applyListTransform((active) =>
                movePlanItemRelative(active, id, "down"),
              )
            }
            onPinToTop={(id) =>
              applyListTransform((active) => pinPlanItemToTop(active, id))
            }
            onLockPosition={(id) =>
              applyListTransform((active) => lockPlanItemPosition(active, id))
            }
            onSetPreferredTime={(id, time) =>
              onItemsChange(
                updatePlanItem(items, id, {
                  preferredTime: time,
                  startTime: time,
                }),
              )
            }
            onChangeDuration={(id, minutes) =>
              onItemsChange(updatePlanItem(items, id, { durationMinutes: minutes }))
            }
            onAddNotes={(id, notes) =>
              onItemsChange(updatePlanItem(items, id, { notes }))
            }
            onBreakIntoSteps={breakIntoSteps}
            onSkipUntilTomorrow={(id) =>
              onItemsChange(deferPlanItemToDate(items, id, tomorrowDateStr()))
            }
            onMoveToAnotherDay={(id) =>
              onItemsChange(deferPlanItemToDate(items, id, tomorrowDateStr()))
            }
          />

          {showAdd ? (
            <PlanDaySimpleAdd
              onAdd={(raw) => {
                const titles = parseMindCapture(raw);
                const parts = titles.length > 0 ? titles : [raw.trim()];
                onItemsChange(addQuickPlanItems(parts, items));
                setShowAdd(false);
              }}
            />
          ) : (
            <button
              type="button"
              className={SECONDARY}
              data-testid="plan-day-today-add-item"
              onClick={() => setShowAdd(true)}
            >
              + Add Item
            </button>
          )}

          {reshapeOffer ? (
            <div
              className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2] px-4 py-3"
              data-testid="plan-day-reshape-offer"
            >
              <p className="text-base leading-relaxed text-[#4b463f]">
                {reshapeOffer.message}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={PRIMARY}
                  data-testid="plan-day-reshape-yes"
                  onClick={() => {
                    applyListTransform((active) => optimizeDayAroundLocks(active));
                    setReshapeOffer(null);
                  }}
                >
                  Yes, reshape my day
                </button>
                <button
                  type="button"
                  className={SECONDARY}
                  data-testid="plan-day-reshape-keep"
                  onClick={() => setReshapeOffer(null)}
                >
                  Keep everything else
                </button>
                <button
                  type="button"
                  className={SECONDARY}
                  data-testid="plan-day-reshape-dismiss"
                  onClick={() => {
                    dismissReshapeAskForToday();
                    setReshapeOffer(null);
                  }}
                >
                  Don&apos;t ask again today
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={PRIMARY}
              data-testid="plan-day-start-next"
              onClick={startNextTask}
              disabled={listItems.length === 0}
            >
              ▶ Start Next Task
            </button>
            <button
              type="button"
              className={SECONDARY}
              data-testid="plan-day-adjust-plan"
              aria-pressed={adjustOpen}
              onClick={() => setAdjustOpen((v) => !v)}
            >
              {adjustOpen ? "Done Adjusting" : "Adjust This Plan"}
            </button>
            <div className="relative">
              <button
                type="button"
                className={SECONDARY}
                data-testid="plan-day-more-menu-toggle"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((v) => !v)}
              >
                ⋯ More
              </button>
              {moreOpen ? (
                <div
                  className="absolute left-0 z-20 mt-1 min-w-[14rem] rounded-xl border border-[#e7dfd4] bg-white py-1 shadow-md"
                  data-testid="plan-day-secondary-more-menu"
                >
                  {onOpenAdapt ? (
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm font-semibold text-[#1f1c19] hover:bg-[#f5f0ea]"
                      data-testid="plan-day-more-adapt"
                      onClick={() => {
                        setMoreOpen(false);
                        onOpenAdapt();
                      }}
                    >
                      Adapt Today
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm font-semibold text-[#1f1c19] hover:bg-[#f5f0ea]"
                    data-testid="plan-day-more-save"
                    onClick={() => {
                      const w = loadPlanWorkflowState();
                      savePlanWorkflowState({
                        ...w,
                        stage: w.stage === "capture" ? "planned" : w.stage,
                      });
                      setMoreOpen(false);
                    }}
                  >
                    Save Plan
                  </button>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm font-semibold text-[#1f1c19] hover:bg-[#f5f0ea]"
                    data-testid="plan-day-more-rebuild"
                    onClick={() => {
                      setMoreOpen(false);
                      handleBuildDay();
                    }}
                  >
                    Rebuild Plan
                  </button>
                  <button
                    type="button"
                    className="flex w-full flex-col px-3 py-2 text-left hover:bg-[#f5f0ea]"
                    data-testid="plan-day-more-optimize"
                    aria-label="Optimize My Day — rearrange flexible tasks around your fixed times and locked items"
                    onClick={() => {
                      runOptimizeMyDay();
                      setMoreOpen(false);
                    }}
                  >
                    <span className="text-sm font-semibold text-[#1f1c19]">
                      Optimize My Day
                    </span>
                    <span className="text-xs font-normal text-[#6b635a]">
                      Reorder flexible tasks around your fixed times
                    </span>
                  </button>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm font-semibold text-[#1f1c19] hover:bg-[#f5f0ea]"
                    data-testid="plan-day-more-print"
                    onClick={() => {
                      setMoreOpen(false);
                      if (typeof window !== "undefined") window.print();
                    }}
                  >
                    Print
                  </button>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm font-semibold text-[#1f1c19] hover:bg-[#f5f0ea]"
                    data-testid="plan-day-more-stuck"
                    onClick={() => {
                      setMoreOpen(false);
                      stuck();
                    }}
                  >
                    {PLAN_DAY_IM_STUCK_BUTTON_LABEL}
                  </button>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm font-semibold text-[#1f1c19] hover:bg-[#f5f0ea]"
                    data-testid="plan-day-more-archive"
                    onClick={() => {
                      setMoreOpen(false);
                      go("mind");
                    }}
                  >
                    Archive / Start Fresh
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {listItems.some((i) => !i.sourceTimeBlockId && i.flexible !== false) ? (
            <div className="flex flex-col items-start gap-1">
              <button
                type="button"
                className={SECONDARY}
                data-testid="plan-day-optimize-inline"
                onClick={runOptimizeMyDay}
              >
                Optimize My Day
              </button>
              <p className="text-sm text-[#6b635a]">
                Reorders your flexible tasks around fixed times and
                priorities — anything locked or scheduled stays put.
              </p>
            </div>
          ) : null}

          {optimizeNotice ? (
            <p
              className="companion-fade-in rounded-xl border border-[#c5e0e0] bg-[#f0f8f8] px-4 py-3 text-base font-semibold text-[#1e4f4f]"
              role="status"
              aria-live="polite"
              data-testid="plan-day-optimize-notice"
            >
              {optimizeNotice}
            </p>
          ) : null}

          {flow.energy ? (
            <p className="sr-only">
              Energy noted as {energyLabel(flow.energy)}
            </p>
          ) : null}
        </section>
      ) : null}

      {breakSourceId ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/20 p-4 sm:items-center"
          data-testid="plan-day-break-dialog"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#e7dfd4] bg-white p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-[#1f1c19]">
              Break into smaller steps
            </h3>
            <p className="mt-1 text-sm text-[#6b635a]">
              One step per line — I&apos;ll replace the original with these.
            </p>
            <textarea
              value={breakDraft}
              onChange={(e) => setBreakDraft(e.target.value)}
              rows={5}
              className="mt-3 w-full rounded-xl border border-[#c9bfb0] px-3 py-2 text-base"
              data-testid="plan-day-break-draft"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className={PRIMARY}
                data-testid="plan-day-break-confirm"
                onClick={confirmBreak}
              >
                Replace with steps
              </button>
              <button
                type="button"
                className={SECONDARY}
                onClick={() => setBreakSourceId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
