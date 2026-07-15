"use client";

import { TodaysWelcomeCard } from "@/components/companion/TodaysWelcomeCard";
import {
  PLAN_OR_ADAPT_MESSAGE,
  hasActivePlanForToday,
  resolvePlanOrAdaptChoices,
  type PlanOrAdaptChoiceId,
} from "@/lib/dailyAdaptation";

type Props = {
  onSelect: (choiceId: PlanOrAdaptChoiceId) => void;
  onBack?: () => void;
};

/**
 * Plan My Day entry — two clear paths so Adapt is a real choice inside the room.
 */
export function PlanOrAdaptPathChooser({ onSelect, onBack }: Props) {
  const hasPlan = hasActivePlanForToday();
  const choices = resolvePlanOrAdaptChoices({ hasPlanToday: hasPlan });

  return (
    <section
      className="plan-day-morning-note"
      data-testid="plan-or-adapt-path-chooser"
      aria-label="Plan or Adapt My Day"
    >
      {onBack ? (
        <button
          type="button"
          className="plan-day-morning-note__previous"
          onClick={onBack}
          data-testid="app-back-button"
        >
          <span aria-hidden="true">←</span>
          <span>Previous Screen</span>
        </button>
      ) : null}
      <h1 className="plan-day-morning-note__title">Plan My Day</h1>
      <p className="plan-day-morning-note__helper mt-2">
        Today is not about doing everything. It is about choosing what matters
        most based on your time, energy, motivation, and commitments.
      </p>
      <p className="plan-day-morning-note__question mt-3">{PLAN_OR_ADAPT_MESSAGE}</p>
      <div className="mt-4">
        <TodaysWelcomeCard
          mode="plan-or-adapt"
          choices={choices}
          onSelect={onSelect}
        />
      </div>
    </section>
  );
}
