"use client";

import type { ReactNode } from "react";

import type { ActivityCategoryId } from "@/lib/companionActivities";

const CATEGORY_GLYPH: Partial<Record<ActivityCategoryId, string>> = {
  focus: "🌿",
  calm: "🌊",
  energize: "☀️",
  "slow-down": "🍃",
  decide: "🧭",
  overwhelm: "🫧",
  creativity: "✨",
};

export type CompanionDeskPrimaryAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

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

function DeskProgress({
  stepIndex,
  stepCount,
}: {
  stepIndex: number;
  stepCount: number;
}) {
  const progress = ((stepIndex + 1) / stepCount) * 100;
  return (
    <div
      className="companion-desk__progress"
      aria-label={`Step ${stepIndex + 1} of ${stepCount}`}
    >
      <div className="companion-desk__progress-dots" aria-hidden>
        {Array.from({ length: stepCount }, (_, i) => (
          <span
            key={i}
            className={[
              "companion-desk__progress-dot",
              i <= stepIndex ? "companion-desk__progress-dot--filled" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </div>
      <span className="companion-desk__progress-text">
        {stepIndex + 1} of {stepCount}
      </span>
      <span className="companion-desk__progress-line-track" aria-hidden>
        <span
          className="companion-desk__progress-line"
          style={{ width: `${progress}%` }}
        />
      </span>
    </div>
  );
}

/**
 * Companion Desk — the permanent frosted conversation surface for guided
 * experiences. Same frame everywhere; only the workflow content changes.
 */
export function CompanionDesk({
  activityTitle,
  categoryId,
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
  const glyph = categoryId ? CATEGORY_GLYPH[categoryId] : undefined;
  const showStep =
    stepIndex !== undefined &&
    stepCount !== undefined &&
    instruction !== undefined &&
    stepCount > 0;

  return (
    <div
      className="companion-desk"
      data-testid="companion-desk"
      role="region"
      aria-label={`${activityTitle} — companion desk`}
    >
      <div className="companion-desk__surface">
        {showStep ? (
          <DeskProgress stepIndex={stepIndex} stepCount={stepCount} />
        ) : null}

        <div className="companion-desk__zones">
          <div className="companion-desk__left">
            {onLeftNav && leftNavLabel ? (
              <button
                type="button"
                onClick={onLeftNav}
                className="companion-desk__nav-link"
              >
                {leftNavLabel}
              </button>
            ) : null}
          </div>

          <div className="companion-desk__center">
            <p className="companion-desk__workflow-title">
              {glyph ? (
                <span className="companion-desk__glyph" aria-hidden>
                  {glyph}{" "}
                </span>
              ) : null}
              {activityTitle}
            </p>
            {categoryLabel && !showStep ? (
              <p className="companion-desk__meta">{categoryLabel}</p>
            ) : null}
            {timeLabel && !showStep ? (
              <p className="companion-desk__time">{timeLabel}</p>
            ) : null}

            {linkedSuggestion ? (
              <div className="companion-desk__linked">{linkedSuggestion}</div>
            ) : null}

            {children ??
              (showStep ? (
                <div
                  key={stepKey ?? stepIndex}
                  className="companion-desk__conversation"
                >
                  <p className="companion-desk__step-label">
                    Question {stepIndex + 1} of {stepCount}
                  </p>
                  <p className="companion-desk__question">{instruction}</p>
                  {fields ? (
                    <div className="companion-desk__fields">{fields}</div>
                  ) : null}
                </div>
              ) : null)}
          </div>

          <div className="companion-desk__right">
            {onPause ? (
              <button
                type="button"
                onClick={onPause}
                className="companion-desk__utility"
              >
                {pauseLabel}
              </button>
            ) : null}
            {onExit ? (
              <button
                type="button"
                onClick={onExit}
                className="companion-desk__utility"
              >
                {exitLabel}
              </button>
            ) : null}
          </div>
        </div>

        {primaryAction ? (
          <footer className="companion-desk__footer">
            <button
              type="button"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              className="companion-desk__btn-continue"
            >
              {primaryAction.label}
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  );
}

/** @deprecated Use CompanionDesk — kept for gradual migration. */
export const FocusInteractionDock = CompanionDesk;
