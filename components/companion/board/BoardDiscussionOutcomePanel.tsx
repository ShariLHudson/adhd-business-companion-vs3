"use client";

import { useMemo, useState } from "react";
import {
  acceptBoardRecommendation,
  type BoardDirectorDiscussionRecord,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import {
  BOARD_OUTCOME_MORE,
  BOARD_OUTCOME_NEXT_STEP_CHOICES,
  BOARD_OUTCOME_PRIMARY,
  recommendNextStepDestination,
  type BoardOutcomeSecondaryActionId,
} from "@/lib/board/boardDiscussion/boardOutcomeActions";

type Props = {
  record: BoardDirectorDiscussionRecord;
  onRecordChange: (record: BoardDirectorDiscussionRecord) => void;
  onSecondaryAction?: (
    actionId: BoardOutcomeSecondaryActionId,
    record: BoardDirectorDiscussionRecord,
  ) => void;
  /** Return to originating Project / Work when available */
  onReturnToSource?: () => void;
  sourceLabel?: string | null;
};

/**
 * Finish line — at most three visible choices after recommendation.
 * Less common actions live under More.
 */
export function BoardDiscussionOutcomePanel({
  record,
  onRecordChange,
  onSecondaryAction,
  onReturnToSource,
  sourceLabel,
}: Props) {
  const accepted = Boolean(
    record.recommendationAcceptedAt ||
      record.status === "recommendation-accepted",
  );
  /** Decision Record is created with the discussion — do not duplicate Save. */
  const decisionSaved = Boolean(record.decisionRecord);
  const [showNextStepChoices, setShowNextStepChoices] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const recommendedDestination = useMemo(
    () =>
      recommendNextStepDestination({
        hasProjectContext: Boolean(
          record.sourceContext?.projectId ||
            record.sourceContext?.projectName ||
            record.sourceContext?.workTitle,
        ),
        mentionsTodayOrDay: /\b(today|tomorrow|this week|plan my day)\b/i.test(
          [
            record.answers.decision,
            record.decisionRecord?.nextUsefulStep,
            record.decisionRecord?.finalRecommendation,
          ]
            .filter(Boolean)
            .join(" "),
        ),
      }),
    [record],
  );

  function useNextStep() {
    const next = acceptBoardRecommendation(record);
    onRecordChange(next);
    setShowNextStepChoices(true);
    setStatusMessage(
      sourceLabel
        ? `This next step is ready to attach to ${sourceLabel}.`
        : "Choose where this next step should go.",
    );
  }

  function runAction(actionId: BoardOutcomeSecondaryActionId, label: string) {
    onSecondaryAction?.(actionId, record);
    setStatusMessage(`Noted — ${label}.`);
    if (actionId === "save-decision" || actionId === "record-as-decision") {
      const next = acceptBoardRecommendation(record, "Save Decision");
      onRecordChange(next);
    }
  }

  const visibleCount =
    1 + (!decisionSaved ? 1 : 0) + 1; /* primary + optional save + more */

  return (
    <div
      className="board-discussion-outcome"
      data-testid="board-discussion-outcome"
      data-accepted={accepted ? "true" : "false"}
      data-visible-actions={String(Math.min(visibleCount, 3))}
    >
      {!accepted ? (
        <div className="boardroom-actions">
          <button
            type="button"
            className="boardroom-btn boardroom-btn--primary"
            data-testid={BOARD_OUTCOME_PRIMARY.testId}
            onClick={useNextStep}
          >
            {BOARD_OUTCOME_PRIMARY.label}
          </button>
        </div>
      ) : (
        <>
          {statusMessage ? (
            <p className="boardroom-purpose" role="status">
              {statusMessage}
            </p>
          ) : null}
          {record.sourceContext?.projectName ||
          record.sourceContext?.workTitle ? (
            <p
              className="boardroom-purpose"
              data-testid="board-outcome-current-focus"
            >
              Current Focus:{" "}
              {record.sourceContext.workTitle ||
                record.sourceContext.projectName}
            </p>
          ) : null}

          {showNextStepChoices ? (
            <div
              className="boardroom-card-list"
              data-testid="board-outcome-next-step-choices"
            >
              <p className="boardroom-purpose">
                Recommended:{" "}
                {BOARD_OUTCOME_NEXT_STEP_CHOICES.find(
                  (c) => c.id === recommendedDestination,
                )?.label || "Add to Plan"}
              </p>
              <div className="boardroom-actions" style={{ flexWrap: "wrap" }}>
                {BOARD_OUTCOME_NEXT_STEP_CHOICES.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    className={
                      choice.id === recommendedDestination
                        ? "boardroom-btn boardroom-btn--primary"
                        : "boardroom-btn boardroom-btn--secondary"
                    }
                    data-testid={choice.testId}
                    title={choice.hint}
                    onClick={() => runAction(choice.id, choice.label)}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div
            className="boardroom-actions"
            style={{ flexWrap: "wrap" }}
            data-testid="board-outcome-secondary-actions"
          >
            {!decisionSaved ? (
              <button
                type="button"
                className="boardroom-btn boardroom-btn--secondary"
                data-testid="board-outcome-record-decision"
                onClick={() => runAction("save-decision", "Save Decision")}
              >
                Save Decision
              </button>
            ) : null}
            <button
              type="button"
              className="boardroom-btn boardroom-btn--ghost"
              data-testid="board-outcome-show-more"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((v) => !v)}
            >
              More
            </button>
            {onReturnToSource ? (
              <button
                type="button"
                className="boardroom-btn boardroom-btn--ghost"
                data-testid="board-outcome-return-source"
                onClick={onReturnToSource}
              >
                Return to{" "}
                {sourceLabel?.trim() || "where you were working"}
              </button>
            ) : null}
          </div>

          {moreOpen ? (
            <div
              className="boardroom-actions"
              style={{ flexWrap: "wrap" }}
              data-testid="board-outcome-more-menu"
              role="menu"
            >
              {BOARD_OUTCOME_MORE.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  role="menuitem"
                  className="boardroom-btn boardroom-btn--ghost"
                  data-testid={action.testId}
                  onClick={() => runAction(action.id, action.label)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
