"use client";

import { useEffect, useState } from "react";
import { AdaptMyDayCheckIn } from "@/components/companion/AdaptMyDayCheckIn";
import { ProgressivePlanMyDay } from "@/components/companion/ProgressivePlanMyDay";
import { PlanMyDayMorningRoomShell } from "@/components/companion/PlanMyDayMorningRoomShell";
import {
  applyAdaptedDayProposal,
  type AdaptedDayProposal,
} from "@/lib/dailyAdaptation";
import {
  ADAPT_MY_DAY_ITEM,
  PLAN_ADAPT_HOW_DO_I,
  PLAN_ADAPT_WINDOW_TITLE,
  PLAN_MY_DAY_ITEM,
  type PlanAdaptSharedChildId,
} from "@/lib/myDaySharedWindows";
import { useDismissibleWindow } from "@/lib/windowDismiss";
import { requestPlanDayImStuck } from "@/lib/planMyDay/planDayImStuck";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";
import {
  isMeaningfulPlanItem,
  loadTodayPlanItems,
  PLAN_MY_DAY_UPDATED,
  type PlanDayItem,
} from "@/lib/planMyDay";

const CARD =
  "flex h-full flex-col rounded-2xl border border-[#e7dfd4] bg-white/90 px-4 py-4 text-left transition-colors";
const CARD_SELECTED =
  "flex h-full flex-col rounded-2xl border-2 border-[#1e4f4f] bg-white px-4 py-4 text-left shadow-sm";

const OPEN_BTN =
  "mt-auto inline-flex w-full items-center justify-center rounded-xl bg-[#1e4f4f] px-4 py-3 text-base font-semibold text-white hover:bg-[#163d3d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]";

type Props = {
  onBack: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  /** Fresh arrival: null shows both choices; menu child can pre-select. */
  initialChild?: PlanAdaptSharedChildId | null;
};

function SharedHowDoI() {
  const [open, setOpen] = useState(false);
  return (
    <div className="plan-day-how-do-i" data-testid="plan-adapt-shared-how-do-i">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="plan-day-how-do-i__toggle inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:text-[#163c3c] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
        aria-expanded={open}
        data-testid="plan-adapt-shared-how-do-i-toggle"
      >
        How Do I…
        <span aria-hidden="true" className="text-xs font-bold">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <p
          className="plan-day-how-do-i__body mt-2 max-w-xl whitespace-pre-line text-sm leading-relaxed text-[#4b463f]"
          data-testid="plan-adapt-shared-how-do-i-body"
        >
          {PLAN_ADAPT_HOW_DO_I}
        </p>
      ) : null}
    </div>
  );
}

function PlanChildContent({
  items,
  setItems,
  onOpenAdapt,
}: {
  items: PlanDayItem[];
  setItems: (items: PlanDayItem[]) => void;
  onOpenAdapt: () => void;
}) {
  const listItems = items.filter(
    (item) => isMeaningfulPlanItem(item) && !item.done,
  );

  return (
    <div
      className="mt-4 flex flex-col gap-6 pb-6"
      data-testid="plan-adapt-shared-plan-content"
    >
      <div data-testid="plan-day-section-todays-list">
        <ProgressivePlanMyDay
          items={items}
          onItemsChange={setItems}
          onOpenAdapt={onOpenAdapt}
          onImStuck={(extras) =>
            requestPlanDayImStuck(
              listItems.map((item) => item.title),
              extras,
            )
          }
        />
      </div>
    </div>
  );
}

/**
 * Welcome Home → My Day → Plan My Day / Adapt My Day
 * One shared scrollable window; two side-by-side children; one How Do I…
 */
export function PlanAdaptSharedWindow({
  onBack,
  registerBack,
  initialChild = null,
}: Props) {
  const [activeChild, setActiveChild] = useState<PlanAdaptSharedChildId | null>(
    initialChild,
  );
  // Lift plan items above Plan/Adapt children so Adapt cannot remount an empty list.
  const [items, setItems] = useState<PlanDayItem[]>(() => loadTodayPlanItems());

  useDismissibleWindow({
    open: true,
    onClose: onBack,
    closeOnEscape: true,
  });

  useEffect(() => {
    setActiveChild(initialChild ?? null);
  }, [initialChild]);

  useEffect(() => {
    setItems(loadTodayPlanItems());
    const onUpdate = () => setItems(loadTodayPlanItems());
    window.addEventListener(PLAN_MY_DAY_UPDATED, onUpdate);
    return () => window.removeEventListener(PLAN_MY_DAY_UPDATED, onUpdate);
  }, []);

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => false);
    return () => registerBack(null);
  }, [registerBack]);

  function applyProposal(proposal: AdaptedDayProposal) {
    const next = applyAdaptedDayProposal(proposal, items);
    if (next.length > 0) {
      setItems(next);
    } else {
      // Never blank the visible list after accepting an adapted plan.
      const recovered = loadTodayPlanItems();
      if (recovered.length > 0) setItems(recovered);
    }
    setActiveChild("plan");
  }

  return (
    <PlanMyDayMorningRoomShell onOutsideDismiss={onBack}>
      <div
        className="plan-day-morning-note flex flex-col gap-3 pb-10"
        data-testid="plan-adapt-shared-window"
        data-active-child={activeChild ?? "none"}
      >
        <button
          type="button"
          className="plan-day-morning-note__previous"
          onClick={onBack}
          data-testid="app-back-button"
          aria-label="Previous Screen"
        >
          <span aria-hidden="true">←</span>
          <span>{PLAN_MY_DAY_MORNING_COPY.previousScreen}</span>
        </button>

        <h1
          className="plan-day-morning-note__title mt-2"
          data-testid="plan-adapt-shared-title"
        >
          {PLAN_ADAPT_WINDOW_TITLE}
        </h1>

        <SharedHowDoI />

        <div
          className="mt-2 grid gap-3 md:grid-cols-2"
          role="group"
          aria-label="Choose Plan My Day or Adapt My Day"
          data-testid="plan-adapt-shared-choices"
        >
          <div
            className={activeChild === "plan" ? CARD_SELECTED : CARD}
            data-testid="plan-adapt-shared-choice-plan"
          >
            <button
              type="button"
              className="flex h-full w-full flex-col text-left"
              data-testid="plan-adapt-open-plan"
              aria-pressed={activeChild === "plan"}
              onClick={() => setActiveChild("plan")}
            >
              <span className="block text-lg font-semibold text-[#1f1c19]">
                {PLAN_MY_DAY_ITEM.label}
              </span>
              <span
                className="mt-2 block text-base leading-relaxed text-[#4b463f]"
                data-testid="plan-adapt-shared-plan-description"
              >
                {PLAN_MY_DAY_ITEM.description}
              </span>
              <span className="mt-3 block text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
                Supports
              </span>
              <ul
                className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#6b635a]"
                data-testid="plan-adapt-shared-plan-supports"
              >
                {PLAN_MY_DAY_ITEM.supports.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <span className={`${OPEN_BTN} mt-4`} aria-hidden="true">
                {PLAN_MY_DAY_ITEM.openLabel}
              </span>
            </button>
          </div>

          <div
            className={activeChild === "adapt" ? CARD_SELECTED : CARD}
            data-testid="plan-adapt-shared-choice-adapt"
          >
            <button
              type="button"
              className="flex h-full w-full flex-col text-left"
              data-testid="plan-adapt-open-adapt"
              aria-pressed={activeChild === "adapt"}
              onClick={() => setActiveChild("adapt")}
            >
              <span className="block text-lg font-semibold text-[#1f1c19]">
                {ADAPT_MY_DAY_ITEM.label}
              </span>
              <span
                className="mt-2 block text-base leading-relaxed text-[#4b463f]"
                data-testid="plan-adapt-shared-adapt-description"
              >
                {ADAPT_MY_DAY_ITEM.description}
              </span>
              <span className="mt-3 block text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
                Supports
              </span>
              <ul
                className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#6b635a]"
                data-testid="plan-adapt-shared-adapt-supports"
              >
                {ADAPT_MY_DAY_ITEM.supports.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <span className={`${OPEN_BTN} mt-4`} aria-hidden="true">
                {ADAPT_MY_DAY_ITEM.openLabel}
              </span>
            </button>
          </div>
        </div>

        {activeChild === "plan" ? (
          <PlanChildContent
            items={items}
            setItems={setItems}
            onOpenAdapt={() => setActiveChild("adapt")}
          />
        ) : null}

        {activeChild === "adapt" ? (
          <div
            className="mt-4"
            data-testid="plan-adapt-shared-adapt-content"
          >
            <AdaptMyDayCheckIn
              planItems={items}
              onBack={() => setActiveChild(null)}
              onUsePlan={applyProposal}
              onAdjustPlan={applyProposal}
              onStartFirstStep={applyProposal}
              onKeepCurrentPlan={() => setActiveChild("plan")}
            />
          </div>
        ) : null}
      </div>
    </PlanMyDayMorningRoomShell>
  );
}
