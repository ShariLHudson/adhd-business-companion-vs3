"use client";

import type { ReactNode } from "react";
import type { GuidedStageDefinition } from "@/lib/profile/guidedStageTypes";
import type { GuidedStageStatus } from "@/lib/profile/guidedStageTypes";

export type PeopleStageStatusRow = {
  stage: GuidedStageDefinition;
  status: GuidedStageStatus;
  label: string;
};

type Props = {
  stageTitle: string;
  stepIndex: number;
  stepCount: number;
  question: string;
  guidance: string;
  answer: ReactNode;
  help: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  onSaveLater: () => void;
  onCancel: () => void;
  /** Clean stage overview — current stage prominent */
  stageOverview?: PeopleStageStatusRow[];
  activeStageId?: string | null;
  onSelectStage?: (stageId: string) => void;
  /** Quick Start has no multi-stage overview */
  showStageOverview?: boolean;
};

/**
 * Calm one-question screen for People I Help → New Client Avatar.
 */
export function PeopleIHelpSingleQuestionScreen({
  stageTitle,
  stepIndex,
  stepCount,
  question,
  guidance,
  answer,
  help,
  primaryLabel,
  onPrimary,
  onSaveLater,
  onCancel,
  stageOverview = [],
  activeStageId = null,
  onSelectStage,
  showStageOverview = true,
}: Props) {
  const progressLabel =
    stepCount > 0
      ? `${stageTitle} · Step ${stepIndex + 1} of ${stepCount}`
      : stageTitle;

  return (
    <div
      className="pih-single-question"
      data-testid="pih-single-question"
    >
      {showStageOverview && stageOverview.length > 0 ? (
        <nav
          className="pih-single-question__stages"
          aria-label="Stage overview"
          data-testid="pih-stage-overview"
        >
          {stageOverview.map(({ stage, status }) => {
            const active = stage.id === activeStageId;
            const quietLabel =
              status === "enough_for_now" ||
              status === "saved" ||
              status === "explored"
                ? "Complete"
                : status === "ready_to_begin" ||
                    status === "ready_when_you_are"
                  ? "Not started"
                  : "Started";
            return (
              <button
                key={stage.id}
                type="button"
                className={`pih-single-question__stage${
                  active ? " pih-single-question__stage--active" : ""
                }${stage.optional ? " pih-single-question__stage--optional" : ""}`}
                onClick={() => onSelectStage?.(stage.id)}
                aria-current={active ? "step" : undefined}
                data-testid={`pih-stage-${stage.id}`}
              >
                <span className="pih-single-question__stage-title">
                  {stage.title}
                </span>
                <span className="pih-single-question__stage-status">
                  {quietLabel}
                </span>
              </button>
            );
          })}
        </nav>
      ) : null}

      <p
        className="pih-single-question__progress"
        data-testid="pih-question-progress"
      >
        {progressLabel}
      </p>

      <h2
        className="pih-single-question__question"
        data-testid="pih-question-heading"
      >
        {question}
      </h2>

      <p className="pih-single-question__guidance">{guidance}</p>

      <div
        className="pih-single-question__answer"
        data-testid="pih-answer-area"
      >
        {answer}
      </div>

      {help}

      <div className="pih-single-question__actions">
        <button
          type="button"
          className="pih-single-question__primary"
          onClick={onPrimary}
          data-testid="pih-primary-continue"
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          className="pih-single-question__secondary"
          onClick={onSaveLater}
          data-testid="save-and-return-later"
        >
          Save and Return Later
        </button>
        <button
          type="button"
          className="pih-single-question__secondary"
          onClick={onCancel}
          data-testid="pih-cancel"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

