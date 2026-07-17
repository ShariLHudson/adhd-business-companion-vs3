"use client";

import { useEffect, useState } from "react";
import { AdaptMyDayCheckIn } from "@/components/companion/AdaptMyDayCheckIn";
import { PlanDaySimpleAdd } from "@/components/companion/PlanDaySimpleAdd";
import { PlanDaySimpleList } from "@/components/companion/PlanDaySimpleList";
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
import {
  PLAN_DAY_IM_STUCK_BUTTON_LABEL,
  requestPlanDayImStuck,
} from "@/lib/planMyDay/planDayImStuck";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";
import {
  addQuickPlanItem,
  deletePlanItem,
  finishPlanItem,
  isMeaningfulPlanItem,
  loadTodayPlanItems,
  PLAN_MY_DAY_UPDATED,
  updatePlanItem,
  type PlanDayItem,
} from "@/lib/planMyDay";

const CARD =
  "rounded-2xl border border-[#e7dfd4] bg-white/90 px-4 py-4 text-left transition-colors";
const CARD_SELECTED =
  "rounded-2xl border-2 border-[#1e4f4f] bg-white px-4 py-4 text-left shadow-sm";

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

function PlanChildContent() {
  const [items, setItems] = useState<PlanDayItem[]>([]);

  useEffect(() => {
    setItems(loadTodayPlanItems());
    const onUpdate = () => setItems(loadTodayPlanItems());
    window.addEventListener(PLAN_MY_DAY_UPDATED, onUpdate);
    return () => window.removeEventListener(PLAN_MY_DAY_UPDATED, onUpdate);
  }, []);

  const listItems = items.filter(
    (item) => isMeaningfulPlanItem(item) && !item.done,
  );

  return (
    <div
      className="mt-4 flex flex-col gap-8 pb-6"
      data-testid="plan-adapt-shared-plan-content"
    >
      <PlanDaySimpleAdd
        onAdd={(title) => {
          setItems(addQuickPlanItem(title, items));
        }}
      />
      <PlanDaySimpleList
        items={listItems}
        onComplete={(id) => {
          const result = finishPlanItem(items, id);
          if (result) setItems(result.items);
        }}
        onEdit={(id, title) => {
          setItems(updatePlanItem(items, id, { title }));
        }}
        onDelete={(id) => {
          setItems(deletePlanItem(items, id));
        }}
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
  );
}

/**
 * Welcome Home → My Day → Plan My Day / Adapt My Day
 * One shared scrollable window; two selectable children; one How Do I…
 */
export function PlanAdaptSharedWindow({
  onBack,
  registerBack,
  initialChild = null,
}: Props) {
  const [activeChild, setActiveChild] = useState<PlanAdaptSharedChildId | null>(
    initialChild,
  );

  useDismissibleWindow({
    open: true,
    onClose: onBack,
    closeOnEscape: true,
  });

  useEffect(() => {
    setActiveChild(initialChild ?? null);
  }, [initialChild]);

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => false);
    return () => registerBack(null);
  }, [registerBack]);

  function applyProposal(proposal: AdaptedDayProposal) {
    applyAdaptedDayProposal(proposal);
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
          className="mt-2 grid gap-3"
          role="group"
          aria-label="Choose Plan My Day or Adapt My Day"
          data-testid="plan-adapt-shared-choices"
        >
          <button
            type="button"
            className={activeChild === "plan" ? CARD_SELECTED : CARD}
            data-testid="plan-adapt-shared-choice-plan"
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
          </button>
          <button
            type="button"
            className={activeChild === "adapt" ? CARD_SELECTED : CARD}
            data-testid="plan-adapt-shared-choice-adapt"
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
          </button>
        </div>

        {activeChild === "plan" ? <PlanChildContent /> : null}

        {activeChild === "adapt" ? (
          <div
            className="mt-4"
            data-testid="plan-adapt-shared-adapt-content"
          >
            <AdaptMyDayCheckIn
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
