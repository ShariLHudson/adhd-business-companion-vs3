"use client";

import { useMemo, useState } from "react";
import {
  ADAPT_RECHECK_OPTIONS,
  DAILY_ADAPTATION_CHANGE_OPTIONS,
  DAILY_ADAPTATION_ENERGY_OPTIONS,
  DAILY_ADAPTATION_MOTIVATION_OPTIONS,
  applyAdaptedDayProposal,
  loadTodaysAdaptationCheckIn,
  proposeAdaptedDay,
  saveTodaysAdaptationCheckIn,
  shouldAskWhatChanged,
  type AdaptedDayProposal,
  type AdaptRecheckChoiceId,
  type DailyAdaptationChangeReason,
  type DailyAdaptationCheckIn,
  type DailyAdaptationEnergyLevel,
  type DailyAdaptationMotivationLevel,
} from "@/lib/dailyAdaptation";
import {
  loadTodayPlanItems,
  readTodayPlanItems,
} from "@/lib/planMyDay/planDayItems";
import type { PlanDayItem } from "@/lib/planMyDay/types";
import { todayStr } from "@/lib/companionStore";

type Step =
  | "recheck"
  | "energy"
  | "motivation"
  | "what-changed"
  | "proposal";

type Props = {
  onBack: () => void;
  onUsePlan: (proposal: AdaptedDayProposal) => void;
  onAdjustPlan: (proposal: AdaptedDayProposal) => void;
  onStartFirstStep: (proposal: AdaptedDayProposal) => void;
  onKeepCurrentPlan: () => void;
  /** Live Today's List from the shared window — used if storage briefly looks empty. */
  planItems?: PlanDayItem[];
};

const BUCKET_LABELS: Record<string, string> = {
  "start-with-this": "Start With This",
  "keep-today": "Keep Today",
  "make-smaller": "Make Smaller",
  "move-later": "Move Later",
  "delegate-or-ask": "Delegate or Ask for Help",
  remove: "Remove",
  "add-a-break": "Recovery",
};

export function AdaptMyDayCheckIn({
  onBack,
  onUsePlan,
  onAdjustPlan,
  onStartFirstStep,
  onKeepCurrentPlan,
  planItems,
}: Props) {
  const prior = useMemo(() => loadTodaysAdaptationCheckIn(), []);
  const [step, setStep] = useState<Step>(prior ? "recheck" : "energy");
  const [energy, setEnergy] = useState<DailyAdaptationEnergyLevel | null>(
    prior?.energyLevel ?? null,
  );
  const [motivation, setMotivation] =
    useState<DailyAdaptationMotivationLevel | null>(
      prior?.motivationLevel ?? null,
    );
  const [changeReason, setChangeReason] =
    useState<DailyAdaptationChangeReason | undefined>(prior?.changeReason);
  const [note, setNote] = useState(prior?.note ?? "");
  const [proposal, setProposal] = useState<AdaptedDayProposal | null>(null);

  function resolvePlanItemsForAdapt(): PlanDayItem[] {
    const hydrated = loadTodayPlanItems();
    if (hydrated.length > 0) return hydrated;
    const stored = readTodayPlanItems();
    if (stored.length > 0) return stored;
    return planItems?.filter((item) => !item.done && item.title.trim()) ?? [];
  }

  function finishCheckIn(
    nextEnergy: DailyAdaptationEnergyLevel,
    nextMotivation: DailyAdaptationMotivationLevel,
    reason?: DailyAdaptationChangeReason,
  ) {
    const checkIn: DailyAdaptationCheckIn = {
      date: todayStr(),
      capturedAt: new Date().toISOString(),
      energyLevel: nextEnergy,
      motivationLevel: nextMotivation,
      changeReason: reason,
      note: note.trim() || undefined,
    };
    saveTodaysAdaptationCheckIn(checkIn);
    const nextProposal = proposeAdaptedDay(checkIn, resolvePlanItemsForAdapt());
    setProposal(nextProposal);
    setStep("proposal");
  }

  function handleEnergy(level: DailyAdaptationEnergyLevel) {
    setEnergy(level);
    setStep("motivation");
  }

  function handleMotivation(level: DailyAdaptationMotivationLevel) {
    setMotivation(level);
    const askChanged = shouldAskWhatChanged(
      energy ?? "unsure",
      level,
      Boolean(prior),
    );
    if (askChanged) {
      setStep("what-changed");
      return;
    }
    if (!energy) return;
    finishCheckIn(energy, level);
  }

  function handleWhatChanged(reason: DailyAdaptationChangeReason) {
    setChangeReason(reason);
    if (!energy || !motivation) return;
    finishCheckIn(energy, motivation, reason);
  }

  function handleRecheck(choice: AdaptRecheckChoiceId) {
    if (choice === "keep-current-plan") {
      onKeepCurrentPlan();
      return;
    }
    if (choice === "update-energy-motivation") {
      setStep("energy");
      return;
    }
    if (choice === "time-changed") {
      setChangeReason("less-time");
      setStep("energy");
      return;
    }
    if (choice === "new-priority") {
      setChangeReason("new-priority");
      setStep("energy");
      return;
    }
    if (choice === "overwhelmed") {
      setChangeReason("overwhelmed");
      setStep("energy");
    }
  }

  function handleUsePlan() {
    if (!proposal) return;
    applyAdaptedDayProposal(proposal, resolvePlanItemsForAdapt());
    onUsePlan(proposal);
  }

  if (step === "recheck") {
    return (
      <section
        className="global-daily-opening todays-welcome-card adapt-my-day-check-in"
        data-testid="adapt-my-day-check-in"
        data-mode="recheck"
        aria-label="Adapt My Day"
      >
        <header className="global-daily-opening__header">
          <p className="global-daily-opening__eyebrow">Adapt My Day</p>
          <h2 className="global-daily-opening__title">
            Has anything changed since your last check-in?
          </h2>
        </header>
        <ul className="global-daily-opening__cards global-daily-opening__cards--stack">
          {ADAPT_RECHECK_OPTIONS.map((option) => (
            <li key={option.id} className="global-daily-opening__card-item">
              <button
                type="button"
                className="global-daily-opening__card"
                onClick={() => handleRecheck(option.id)}
                data-testid={`adapt-recheck-${option.id}`}
              >
                <span className="global-daily-opening__card-title">
                  {option.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="global-daily-opening__back"
          onClick={onBack}
          data-testid="adapt-back"
        >
          Back
        </button>
      </section>
    );
  }

  if (step === "energy") {
    return (
      <section
        className="global-daily-opening todays-welcome-card adapt-my-day-check-in"
        data-testid="adapt-my-day-check-in"
        data-mode="energy"
        aria-label="Current energy"
      >
        <header className="global-daily-opening__header">
          <p className="global-daily-opening__eyebrow">Adapt My Day</p>
          <h2 className="global-daily-opening__title">
            How is your energy right now?
          </h2>
          <p className="global-daily-opening__message">
            Energy and motivation are separate — there is no wrong answer.
          </p>
        </header>
        <ul className="global-daily-opening__cards global-daily-opening__cards--stack">
          {DAILY_ADAPTATION_ENERGY_OPTIONS.map((option) => (
            <li key={option.id} className="global-daily-opening__card-item">
              <button
                type="button"
                className="global-daily-opening__card"
                onClick={() => handleEnergy(option.id)}
                data-testid={`adapt-energy-${option.id}`}
              >
                <span className="global-daily-opening__card-title">
                  {option.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <label className="adapt-my-day-check-in__note">
          <span>Optional note</span>
          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Anything you want me to know…"
            data-testid="adapt-note"
          />
        </label>
        <button
          type="button"
          className="global-daily-opening__back"
          onClick={onBack}
          data-testid="adapt-back"
        >
          Back
        </button>
      </section>
    );
  }

  if (step === "motivation") {
    return (
      <section
        className="global-daily-opening todays-welcome-card adapt-my-day-check-in"
        data-testid="adapt-my-day-check-in"
        data-mode="motivation"
        aria-label="Current motivation"
      >
        <header className="global-daily-opening__header">
          <p className="global-daily-opening__eyebrow">Adapt My Day</p>
          <h2 className="global-daily-opening__title">
            How motivated do you feel right now?
          </h2>
        </header>
        <ul className="global-daily-opening__cards global-daily-opening__cards--stack">
          {DAILY_ADAPTATION_MOTIVATION_OPTIONS.map((option) => (
            <li key={option.id} className="global-daily-opening__card-item">
              <button
                type="button"
                className="global-daily-opening__card"
                onClick={() => handleMotivation(option.id)}
                data-testid={`adapt-motivation-${option.id}`}
              >
                <span className="global-daily-opening__card-title">
                  {option.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="global-daily-opening__back"
          onClick={() => setStep("energy")}
          data-testid="adapt-back"
        >
          Back
        </button>
      </section>
    );
  }

  if (step === "what-changed") {
    return (
      <section
        className="global-daily-opening todays-welcome-card adapt-my-day-check-in"
        data-testid="adapt-my-day-check-in"
        data-mode="what-changed"
        aria-label="What changed"
      >
        <header className="global-daily-opening__header">
          <p className="global-daily-opening__eyebrow">Adapt My Day</p>
          <h2 className="global-daily-opening__title">What changed?</h2>
          <p className="global-daily-opening__message">
            Optional — only if it helps me reshape the plan.
          </p>
        </header>
        <ul className="global-daily-opening__cards global-daily-opening__cards--stack">
          {DAILY_ADAPTATION_CHANGE_OPTIONS.map((option) => (
            <li key={option.id} className="global-daily-opening__card-item">
              <button
                type="button"
                className="global-daily-opening__card"
                onClick={() => handleWhatChanged(option.id)}
                data-testid={`adapt-changed-${option.id}`}
              >
                <span className="global-daily-opening__card-title">
                  {option.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="global-daily-opening__back"
          onClick={() => {
            if (energy && motivation) finishCheckIn(energy, motivation);
          }}
          data-testid="adapt-skip-changed"
        >
          Skip — reshape from energy and motivation
        </button>
      </section>
    );
  }

  if (step === "proposal" && proposal) {
    const groups = groupProposal(proposal);
    return (
      <section
        className="global-daily-opening todays-welcome-card adapt-my-day-check-in"
        data-testid="adapt-my-day-proposal"
        data-mode="proposal"
        aria-label="Your adapted day"
      >
        <header className="global-daily-opening__header">
          <p className="global-daily-opening__eyebrow">Your Adapted Day</p>
          <p className="global-daily-opening__message">{proposal.guidance}</p>
        </header>
        <div className="adapt-my-day-check-in__proposal">
          {groups.map((group) => (
            <div key={group.bucket} className="adapt-my-day-check-in__group">
              <p className="adapt-my-day-check-in__group-title">
                {BUCKET_LABELS[group.bucket] ?? group.bucket}
              </p>
              <ul>
                {group.items.map((item) => (
                  <li key={item.itemId}>
                    {item.title}
                    {item.note ? (
                      <span className="adapt-my-day-check-in__item-note">
                        {" "}
                        — {item.note}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="adapt-my-day-check-in__actions">
          <button
            type="button"
            className="global-daily-opening__discovery-primary"
            onClick={handleUsePlan}
            data-testid="adapt-use-plan"
          >
            Use This Plan
          </button>
          <button
            type="button"
            className="global-daily-opening__discovery-secondary"
            onClick={() => {
              applyAdaptedDayProposal(proposal, resolvePlanItemsForAdapt());
              onAdjustPlan(proposal);
            }}
            data-testid="adapt-adjust-plan"
          >
            Adjust It
          </button>
          <button
            type="button"
            className="global-daily-opening__discovery-secondary"
            onClick={() => {
              applyAdaptedDayProposal(proposal, resolvePlanItemsForAdapt());
              onStartFirstStep(proposal);
            }}
            data-testid="adapt-start-first"
          >
            Start With the First Step
          </button>
        </div>
        <button
          type="button"
          className="global-daily-opening__back"
          onClick={() => setStep("motivation")}
          data-testid="adapt-back"
        >
          Back
        </button>
      </section>
    );
  }

  return null;
}

function groupProposal(proposal: AdaptedDayProposal) {
  const order = [
    "start-with-this",
    "keep-today",
    "make-smaller",
    "move-later",
    "delegate-or-ask",
    "remove",
    "add-a-break",
  ] as const;
  return order
    .map((bucket) => ({
      bucket,
      items: proposal.items.filter((item) => item.bucket === bucket),
    }))
    .filter((group) => group.items.length > 0);
}
