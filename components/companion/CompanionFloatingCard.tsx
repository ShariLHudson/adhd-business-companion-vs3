"use client";

import type { ReactNode } from "react";

import type { ActivityCategoryId } from "@/lib/companionActivities";
import type { CompanionDeskPrimaryAction } from "@/components/companion/CompanionDesk";

type Props = {
  activityTitle: string;
  categoryId?: ActivityCategoryId;
  categoryLabel?: string;
  timeLabel?: string;
  stepIndex?: number;
  stepCount?: number;
  instruction?: string;
  onLeftNav?: () => void;
  leftNavLabel?: string;
  onPause?: () => void;
  onExit?: () => void;
  pauseLabel?: string;
  exitLabel?: string;
  primaryAction?: CompanionDeskPrimaryAction;
  linkedSuggestion?: ReactNode;
  fields?: ReactNode;
  stepKey?: number | string;
  children?: ReactNode;
};

/**
 * Centered frosted companion card for Focus My Brain guided workflows —
 * calm conversation inside the conservatory, not a bottom dock.
 */
export function CompanionFloatingCard({
  activityTitle,
  categoryLabel,
  timeLabel,
  stepIndex,
  stepCount,
  instruction,
  onLeftNav,
  leftNavLabel,
  onPause,
  onExit,
  pauseLabel = "Pause",
  exitLabel = "Exit exercise",
  primaryAction,
  linkedSuggestion,
  fields,
  stepKey,
  children,
}: Props) {
  const showStep =
    stepIndex !== undefined &&
    stepCount !== undefined &&
    instruction !== undefined &&
    stepCount > 0;

  return (
    <div
      className="companion-floating-card companion-glass-panel"
      data-testid="companion-floating-card"
      role="region"
      aria-label={`${activityTitle} — companion card`}
    >
      <header className="companion-floating-card__header">
        <div className="companion-floating-card__header-main">
          {onLeftNav && leftNavLabel ? (
            <button
              type="button"
              onClick={onLeftNav}
              className="companion-floating-card__back"
            >
              {leftNavLabel}
            </button>
          ) : null}
          <h2 className="companion-floating-card__title">{activityTitle}</h2>
          {categoryLabel && !showStep ? (
            <p className="companion-floating-card__meta">{categoryLabel}</p>
          ) : null}
          {timeLabel && !showStep ? (
            <p className="companion-floating-card__time">{timeLabel}</p>
          ) : null}
        </div>

        <div className="companion-floating-card__header-actions">
          {showStep ? (
            <span className="companion-floating-card__step">
              Question {stepIndex + 1} of {stepCount}
            </span>
          ) : null}
          {onPause ? (
            <button
              type="button"
              onClick={onPause}
              className="companion-floating-card__utility"
            >
              {pauseLabel}
            </button>
          ) : null}
          {onExit ? (
            <button
              type="button"
              onClick={onExit}
              className="companion-floating-card__utility"
            >
              {exitLabel}
            </button>
          ) : null}
        </div>
      </header>

      <div className="companion-floating-card__body">
        {linkedSuggestion ? (
          <div className="companion-floating-card__linked">{linkedSuggestion}</div>
        ) : null}

        {children ??
          (showStep ? (
            <div
              key={stepKey ?? stepIndex}
              className="companion-floating-card__conversation"
            >
              <p className="companion-floating-card__question">{instruction}</p>
              {fields ? (
                <div className="companion-floating-card__fields">{fields}</div>
              ) : null}
            </div>
          ) : null)}
      </div>

      {primaryAction ? (
        <footer className="companion-floating-card__footer">
          <button
            type="button"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            className="companion-floating-card__btn-continue"
          >
            {primaryAction.label}
          </button>
        </footer>
      ) : null}
    </div>
  );
}
