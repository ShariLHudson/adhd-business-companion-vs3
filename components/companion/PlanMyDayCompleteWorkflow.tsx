"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AVAILABLE_TIME_OPTIONS,
  ENERGY_OPTIONS,
  MOTIVATION_OPTIONS,
  STYLE_OPTIONS,
  buildCompleteDayPlan,
  loadPlanWorkflowState,
  recommendStyleForConstraints,
  savePlanWorkflowState,
  type PlanMyDayWorkflowState,
  type PlanWorkflowEnergy,
  type PlanWorkflowMotivation,
  type PlanWorkflowStyle,
} from "@/lib/planMyDay/completePlanWorkflow";
import {
  buildAvoidanceOffer,
  effortLabel,
  energyFitLabel,
  priorityBandLabel,
  type EffortBand,
  type PriorityBand,
  type TaskEnergyFit,
} from "@/lib/planMyDay/companionPlanRefinement";
import type { PlanDayItem } from "@/lib/planMyDay/types";
import { updatePlanItem } from "@/lib/planMyDay/planDayItems";

type Props = {
  items: PlanDayItem[];
  onItemsChange: (items: PlanDayItem[]) => void;
  onOpenAdapt: () => void;
  onImStuck: (extras: {
    availableTime?: string | null;
    energy?: string | null;
    motivation?: string | null;
    activeStep?: string | null;
  }) => void;
};

/** Optional choice chips — clear selected / hover / focus / active (touch) feedback. */
const CHOICE_BTN =
  "rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-sm font-semibold text-[#1f1c19] shadow-sm transition-colors hover:border-[#1e4f4f] hover:bg-[#f3f7f7] active:scale-[0.98] active:bg-[#e8f0f0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]";
const CHOICE_SELECTED =
  "rounded-xl border-2 border-[#1e4f4f] bg-[#1e4f4f]/12 px-3 py-2.5 text-sm font-semibold text-[#1e4f4f] shadow-sm ring-1 ring-[#1e4f4f]/30 transition-colors hover:bg-[#1e4f4f]/16 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]";

/**
 * Progressive Plan My Day sections below Today's List.
 * Capture remains above; this shapes the plan without redesigning the shared window.
 */
export function PlanMyDayCompleteWorkflow({
  items,
  onItemsChange,
  onOpenAdapt,
  onImStuck,
}: Props) {
  const [workflow, setWorkflow] = useState<PlanMyDayWorkflowState>(() =>
    loadPlanWorkflowState(),
  );
  const [showConstraints, setShowConstraints] = useState(false);
  const [avoidanceDismissed, setAvoidanceDismissed] = useState(false);

  useEffect(() => {
    setWorkflow(loadPlanWorkflowState());
  }, []);

  const activeItems = useMemo(
    () => items.filter((item) => !item.done && item.title.trim()),
    [items],
  );

  const byId = useMemo(() => {
    const map = new Map<string, PlanDayItem>();
    for (const item of items) map.set(item.id, item);
    return map;
  }, [items]);

  const styleSuggestion = useMemo(
    () =>
      recommendStyleForConstraints({
        energy: workflow.energy,
        motivation: workflow.motivation,
        taskCount: activeItems.length,
      }),
    [workflow.energy, workflow.motivation, activeItems.length],
  );

  const avoidanceOffer = useMemo(
    () => (avoidanceDismissed ? null : buildAvoidanceOffer(activeItems)),
    [activeItems, avoidanceDismissed],
  );

  const energyGroups = useMemo(() => {
    const groups: Record<TaskEnergyFit, string[]> = {
      high: [],
      medium: [],
      low: [],
    };
    for (const id of workflow.orderedTaskIds) {
      const fit = (workflow.energyFitById[id] ?? "medium") as TaskEnergyFit;
      groups[fit].push(id);
    }
    return groups;
  }, [workflow.orderedTaskIds, workflow.energyFitById]);

  function persist(next: PlanMyDayWorkflowState) {
    setWorkflow(savePlanWorkflowState(next));
  }

  function generatePlan(style?: PlanWorkflowStyle) {
    const chosenStyle = style ?? workflow.planningStyle ?? styleSuggestion.style;
    const built = buildCompleteDayPlan({
      items: activeItems,
      availableMinutes: workflow.availableMinutes,
      energy: workflow.energy,
      motivation: workflow.motivation,
      planningStyle: chosenStyle,
    });
    const nextState: PlanMyDayWorkflowState = {
      ...workflow,
      ...built,
      planningStyle: chosenStyle,
      sourceInputs: workflow.sourceInputs,
      date: workflow.date,
    };
    persist(nextState);

    let nextItems = items;
    for (const item of activeItems) {
      const mins = built.estimatesById[item.id];
      if (!mins) continue;
      const isPrimary = item.id === built.primaryOutcomeId;
      const isParked = built.parkedTaskIds.includes(item.id);
      nextItems = updatePlanItem(nextItems, item.id, {
        durationMinutes: mins,
        priority: isPrimary ? "high" : isParked ? "low" : "medium",
        column: isParked ? "parked" : item.column === "doing" ? "doing" : "today",
        flexible: true,
      });
    }
    onItemsChange(nextItems);
    setShowConstraints(false);
  }

  function startFirstStep() {
    if (!workflow.primaryOutcomeId) return;
    const nextItems = updatePlanItem(items, workflow.primaryOutcomeId, {
      column: "doing",
      priority: "high",
    });
    onItemsChange(nextItems);
    persist({
      ...workflow,
      stage: "started",
      currentTaskId: workflow.primaryOutcomeId,
    });
  }

  function savePlan() {
    persist({
      ...workflow,
      stage: workflow.stage === "capture" ? "planned" : workflow.stage,
    });
  }

  function toggleOptional<T extends string>(
    current: T | undefined,
    next: T,
  ): T | undefined {
    return current === next ? undefined : next;
  }

  if (activeItems.length === 0) {
    return null;
  }

  const planned = workflow.stage === "planned" || workflow.stage === "started";
  const effectiveStyle =
    workflow.planningStyle ?? styleSuggestion.style ?? "balanced";

  return (
    <div
      className="mt-2 flex flex-col gap-6"
      data-testid="plan-my-day-complete-workflow"
      data-stage={workflow.stage}
    >
      {showConstraints || workflow.stage === "constraints" ? (
        <section
          className="rounded-2xl border border-[#e7dfd4] bg-white/90 px-4 py-4"
          data-testid="plan-day-section-constraints"
        >
          <h2 className="text-lg font-semibold text-[#1f1c19]">
            Time and Energy Fit
          </h2>
          <p className="mt-1 text-base leading-relaxed text-[#4b463f]">
            A few calm choices help turn the list into a realistic plan. Skip
            anything you&apos;re unsure about — I&apos;ll build a flexible plan.
          </p>

          <fieldset className="mt-4">
            <legend className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
              Usable time today
            </legend>
            <div className="mt-2 flex flex-wrap gap-2" role="group">
              {AVAILABLE_TIME_OPTIONS.map((opt) => {
                const selected = workflow.availableMinutes === opt.minutes;
                return (
                  <button
                    key={opt.minutes}
                    type="button"
                    aria-pressed={selected}
                    className={selected ? CHOICE_SELECTED : CHOICE_BTN}
                    data-testid={`plan-day-time-${opt.minutes}`}
                    onClick={() =>
                      persist({
                        ...workflow,
                        availableMinutes: selected ? undefined : opt.minutes,
                      })
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
              Energy right now
            </legend>
            <div className="mt-2 flex flex-wrap gap-2" role="group">
              {ENERGY_OPTIONS.map((opt) => {
                const selected = workflow.energy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={selected}
                    className={selected ? CHOICE_SELECTED : CHOICE_BTN}
                    data-testid={`plan-day-energy-${opt.id}`}
                    onClick={() =>
                      persist({
                        ...workflow,
                        energy: toggleOptional(
                          workflow.energy,
                          opt.id as PlanWorkflowEnergy,
                        ),
                      })
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
              Motivation
            </legend>
            <div className="mt-2 flex flex-wrap gap-2" role="group">
              {MOTIVATION_OPTIONS.map((opt) => {
                const selected = workflow.motivation === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={selected}
                    className={selected ? CHOICE_SELECTED : CHOICE_BTN}
                    data-testid={`plan-day-motivation-${opt.id}`}
                    onClick={() =>
                      persist({
                        ...workflow,
                        motivation: toggleOptional(
                          workflow.motivation,
                          opt.id as PlanWorkflowMotivation,
                        ),
                      })
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
              Planning style
            </legend>
            <p
              className="mt-1 text-sm leading-relaxed text-[#4b463f]"
              data-testid="plan-day-style-recommendation"
            >
              {styleSuggestion.reason}
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {STYLE_OPTIONS.map((opt) => {
                const selected = effectiveStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={selected}
                    className={selected ? CHOICE_SELECTED : CHOICE_BTN}
                    data-testid={`plan-day-style-${opt.id}`}
                    onClick={() =>
                      persist({
                        ...workflow,
                        planningStyle: opt.id as PlanWorkflowStyle,
                        styleRecommendation: styleSuggestion.reason,
                      })
                    }
                  >
                    <span className="block">{opt.label}</span>
                    <span className="mt-0.5 block text-xs font-normal text-[#6b635a]">
                      {opt.hint}
                      {opt.id === styleSuggestion.style
                        ? " · Suggested for today"
                        : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button
            type="button"
            className="companion-btn-primary mt-5 w-full rounded-xl px-5 py-3.5 text-base font-semibold sm:w-auto"
            data-testid="plan-day-generate-plan"
            onClick={() => generatePlan(effectiveStyle)}
          >
            Create Today&apos;s Plan
          </button>
        </section>
      ) : planned ? (
        <button
          type="button"
          className="self-start rounded-xl border border-[#c9bfb0] bg-white px-5 py-3 text-base font-semibold text-[#1e4f4f] transition-colors hover:bg-[#f5f0ea] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
          data-testid="plan-day-shape-plan"
          onClick={() => setShowConstraints(true)}
        >
          Adjust time, energy, or style
        </button>
      ) : (
        <button
          type="button"
          className="companion-btn-primary self-start rounded-xl px-6 py-3.5 text-base font-semibold"
          data-testid="plan-day-open-constraints"
          onClick={() => {
            setShowConstraints(true);
            persist({
              ...workflow,
              stage: "constraints",
              planningStyle: workflow.planningStyle ?? styleSuggestion.style,
              styleRecommendation: styleSuggestion.reason,
            });
          }}
        >
          Shape Today&apos;s Plan
        </button>
      )}

      {planned ? (
        <section
          className="rounded-2xl border border-[#e7dfd4] bg-white/90 px-4 py-4"
          data-testid="plan-day-section-plan"
        >
          <h2 className="text-lg font-semibold text-[#1f1c19]">Your Plan</h2>
          {workflow.fitMessage ? (
            <p
              className="mt-2 text-base leading-relaxed text-[#4b463f]"
              data-testid="plan-day-fit-message"
            >
              {workflow.fitMessage}
            </p>
          ) : null}

          {workflow.viewRecommendationReason ? (
            <p
              className="mt-2 text-sm leading-relaxed text-[#4b463f]"
              data-testid="plan-day-view-recommendation"
            >
              {workflow.viewRecommendationReason}
              {workflow.recommendedView
                ? ` (suggested view: ${workflow.recommendedView})`
                : ""}
            </p>
          ) : null}

          {(workflow.companionNotes?.length ?? 0) > 0 ? (
            <ul
              className="mt-3 space-y-1 text-sm leading-relaxed text-[#4b463f]"
              data-testid="plan-day-companion-notes"
            >
              {workflow.companionNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}

          {(workflow.dependencyNotes?.length ?? 0) > 0 ? (
            <div className="mt-3" data-testid="plan-day-dependency-notes">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
                Waiting or needs something first
              </h3>
              <ul className="mt-1 space-y-1 text-sm text-[#4b463f]">
                {workflow.dependencyNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {avoidanceOffer ? (
            <div
              className="mt-4 rounded-xl border border-[#c9bfb0] bg-[#faf7f2] px-4 py-3"
              data-testid="plan-day-avoidance-offer"
            >
              <p className="text-sm leading-relaxed text-[#4b463f]">
                {avoidanceOffer.message}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {avoidanceOffer.choices.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    className={CHOICE_BTN}
                    onClick={() => setAvoidanceDismissed(true)}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {workflow.primaryOutcomeId ? (
            <div className="mt-4" data-testid="plan-day-main-focus">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
                Today&apos;s Most Important Task
              </h3>
              <p className="mt-1 text-lg font-semibold text-[#1f1c19]">
                {byId.get(workflow.primaryOutcomeId)?.title}
              </p>
              {workflow.primaryReason ? (
                <p
                  className="mt-1 text-sm leading-relaxed text-[#4b463f]"
                  data-testid="plan-day-mit-reason"
                >
                  {workflow.primaryReason}
                </p>
              ) : null}
              <p className="mt-1 text-sm text-[#6b635a]">
                {taskMetaLine(
                  workflow.estimatesById[workflow.primaryOutcomeId],
                  workflow.effortById?.[workflow.primaryOutcomeId],
                  workflow.priorityBandById?.[workflow.primaryOutcomeId],
                  workflow.energyFitById?.[workflow.primaryOutcomeId],
                )}
              </p>
            </div>
          ) : null}

          {workflow.orderedTaskIds.length > 0 ? (
            <div className="mt-4" data-testid="plan-day-suggested-order">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
                Suggested Order
              </h3>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-base text-[#1f1c19]">
                {workflow.orderedTaskIds.map((id) => {
                  const item = byId.get(id);
                  if (!item) return null;
                  const tags = workflow.tagsById[id] ?? [];
                  const band = workflow.priorityBandById?.[id];
                  return (
                    <li key={id}>
                      <span className="font-semibold">{item.title}</span>
                      {band ? (
                        <span className="text-[#6b635a]">
                          {" "}
                          · {priorityBandLabel(band)}
                        </span>
                      ) : null}
                      <span className="block text-sm text-[#6b635a]">
                        {taskMetaLine(
                          workflow.estimatesById[id],
                          workflow.effortById?.[id],
                          undefined,
                          workflow.energyFitById?.[id],
                        )}
                      </span>
                      {tags.length ? (
                        <span className="block text-sm text-[#6b635a]">
                          {tags.join(" · ")}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}

          <div className="mt-4" data-testid="plan-day-energy-groups">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
              Matched to energy
            </h3>
            {(
              [
                ["high", "High energy — deep work, writing, strategy"],
                ["medium", "Medium — calls, planning, meetings"],
                ["low", "Low — email, paperwork, simple admin"],
              ] as const
            ).map(([fit, label]) => {
              const ids = energyGroups[fit];
              if (!ids.length) return null;
              return (
                <div key={fit} className="mt-2" data-testid={`plan-day-energy-${fit}`}>
                  <p className="text-sm font-semibold text-[#1f1c19]">{label}</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#4b463f]">
                    {ids.map((id) => (
                      <li key={id}>{byId.get(id)?.title}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {workflow.quickWinIds.length > 0 ? (
            <div className="mt-4" data-testid="plan-day-quick-wins">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
                Quick Wins
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-base text-[#1f1c19]">
                {workflow.quickWinIds.map((id) => (
                  <li key={id}>{byId.get(id)?.title}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {workflow.parkedTaskIds.length > 0 ? (
            <div className="mt-4" data-testid="plan-day-parked">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
                Nice if Time
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-base text-[#4b463f]">
                {workflow.parkedTaskIds.map((id) => (
                  <li key={id}>{byId.get(id)?.title}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {workflow.firstStepText ? (
            <div
              className="mt-5 rounded-xl border border-[#1e4f4f]/25 bg-[#1e4f4f]/08 px-4 py-3"
              data-testid="plan-day-first-step"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1e4f4f]">
                Start Here
              </h3>
              <p className="mt-1 text-base leading-relaxed text-[#1f1c19]">
                {workflow.firstStepText}
              </p>
            </div>
          ) : null}

          <div
            className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
            data-testid="plan-day-plan-actions"
          >
            <button
              type="button"
              className="companion-btn-primary rounded-xl px-5 py-3 text-base font-semibold"
              data-testid="plan-day-start-first-step"
              onClick={startFirstStep}
            >
              Start My First Step
            </button>
            <button
              type="button"
              className="rounded-xl border border-[#c9bfb0] bg-white px-5 py-3 text-base font-semibold text-[#1e4f4f] transition-colors hover:bg-[#f5f0ea] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
              data-testid="plan-day-adjust-plan"
              onClick={onOpenAdapt}
            >
              Adjust This Plan
            </button>
            <button
              type="button"
              className="rounded-xl border border-[#c9bfb0] bg-white px-5 py-3 text-base font-semibold text-[#1e4f4f] transition-colors hover:bg-[#f5f0ea] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
              data-testid="plan-day-adapt-my-day"
              onClick={onOpenAdapt}
            >
              Adapt My Day
            </button>
            <button
              type="button"
              className="rounded-xl border border-[#c9bfb0] bg-white px-5 py-3 text-base font-semibold text-[#1e4f4f] transition-colors hover:bg-[#f5f0ea] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
              data-testid="plan-day-save-plan"
              onClick={savePlan}
            >
              Save Today&apos;s Plan
            </button>
            <button
              type="button"
              className="rounded-xl border border-[#c9bfb0] bg-white px-5 py-3 text-base font-semibold text-[#1e4f4f] transition-colors hover:bg-[#f5f0ea] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
              data-testid="plan-day-regenerate-plan"
              onClick={() => generatePlan()}
            >
              Rebuild Plan
            </button>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        className="self-start rounded-xl border border-[#c9bfb0] bg-white px-5 py-3 text-base font-semibold text-[#1e4f4f] transition-colors hover:bg-[#f5f0ea] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
        data-testid="plan-day-im-stuck"
        onClick={() =>
          onImStuck({
            availableTime: workflow.availableMinutes
              ? `${workflow.availableMinutes} minutes`
              : null,
            energy: workflow.energy ?? null,
            motivation: workflow.motivation ?? null,
            activeStep: workflow.stage,
          })
        }
      >
        I&apos;m Stuck
      </button>
    </div>
  );
}

function taskMetaLine(
  minutes?: number,
  effort?: EffortBand,
  band?: PriorityBand,
  energy?: TaskEnergyFit,
): string {
  const parts: string[] = [];
  if (minutes) parts.push(`~${minutes} min`);
  if (effort) parts.push(effortLabel(effort));
  if (band) parts.push(priorityBandLabel(band));
  if (energy) parts.push(energyFitLabel(energy));
  return parts.join(" · ");
}
