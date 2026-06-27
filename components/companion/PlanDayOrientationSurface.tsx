"use client";

import type { PlanDayOrientationPresentation } from "@/lib/planMyDay/companionBrainClient/presentJudgment";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";

type Props = {
  presentation: PlanDayOrientationPresentation;
  onPrevious: () => void;
  onConfirm: () => void;
  onOpenAdaptMyDay?: () => void;
};

/**
 * Morning note on the desk — calm orientation, no portrait, equal partnership buttons.
 */
export function PlanDayOrientationSurface({
  presentation,
  onPrevious,
  onConfirm,
  onOpenAdaptMyDay,
}: Props) {
  const showPreview =
    presentation.proposalPreview.length > 0 && !presentation.minimalSurface;

  const moodLines = [
    ...(presentation.morningPresence.lead
      ? [presentation.morningPresence.lead]
      : []),
    ...presentation.morningPresence.lines,
  ].filter(Boolean);

  return (
    <section
      className="plan-day-morning-note"
      data-testid="plan-day-orientation"
      data-day-mode={presentation.dayMode}
      aria-label="Plan My Day morning orientation"
    >
      <button
        type="button"
        className="plan-day-morning-note__previous"
        onClick={onPrevious}
        data-testid="app-back-button"
      >
        <span aria-hidden="true">←</span>
        <span>{PLAN_MY_DAY_MORNING_COPY.previousScreen}</span>
      </button>

      <h1 className="plan-day-morning-note__title">
        {PLAN_MY_DAY_MORNING_COPY.title}
      </h1>

      <h2 className="plan-day-morning-note__adapt-heading">
        {PLAN_MY_DAY_MORNING_COPY.adaptMyDay}
      </h2>

      <p className="plan-day-morning-note__question">
        {PLAN_MY_DAY_MORNING_COPY.dayQuestion}
      </p>
      <p className="plan-day-morning-note__helper">
        {PLAN_MY_DAY_MORNING_COPY.dayHelper}
      </p>

      {moodLines.length > 0 ? (
        <div
          className="plan-day-morning-note__mood"
          data-testid="plan-day-morning-presence"
        >
          {moodLines.map((line) => (
            <p key={line} className="plan-day-morning-note__mood-line">
              {line}
            </p>
          ))}
        </div>
      ) : null}

      {presentation.invitation ? (
        <p
          className="plan-day-morning-note__invitation"
          data-testid="plan-day-invitation"
        >
          {presentation.invitation}
        </p>
      ) : null}

      {showPreview ? (
        <div
          className="plan-day-morning-note__preview"
          data-testid="plan-day-proposal-preview"
        >
          <ol className="plan-day-morning-note__preview-list">
            {presentation.proposalPreview.map((label, index) => (
              <li key={`${index}-${label}`}>{label}</li>
            ))}
          </ol>
        </div>
      ) : null}

      {presentation.confirmPrompt && showPreview ? (
        <p
          className="plan-day-morning-note__confirm-prompt"
          data-testid="plan-day-confirm-prompt"
        >
          {presentation.confirmPrompt}
        </p>
      ) : null}

      <div
        className="plan-day-morning-note__actions"
        data-testid="plan-day-confirm-actions"
      >
        <button
          type="button"
          onClick={onConfirm}
          className="plan-day-morning-note__btn plan-day-morning-note__btn--primary"
          data-testid="plan-day-confirm-primary"
        >
          {presentation.primaryConfirmLabel}
        </button>

        {onOpenAdaptMyDay && !presentation.minimalSurface ? (
          <button
            type="button"
            onClick={onOpenAdaptMyDay}
            className="plan-day-morning-note__btn plan-day-morning-note__btn--secondary"
            data-testid="plan-day-confirm-adjust"
          >
            {PLAN_MY_DAY_MORNING_COPY.adaptMyDay}
          </button>
        ) : null}
      </div>
    </section>
  );
}
