"use client";

import { useState } from "react";
import {
  acceptBoardRecommendation,
  type BoardDirectorDiscussionRecord,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import {
  BOARD_OUTCOME_PRIMARY,
  BOARD_OUTCOME_SECONDARY,
  nextRevealCount,
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
 * One primary action, then progressive secondary integration options (Prompt 145).
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
  const [revealCount, setRevealCount] = useState(accepted ? 3 : 0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  function useRecommendation() {
    const next = acceptBoardRecommendation(record);
    onRecordChange(next);
    setRevealCount(3);
    setStatusMessage(
      sourceLabel
        ? `This recommendation is ready to attach to ${sourceLabel}.`
        : "This recommendation is ready. Choose what should happen next.",
    );
  }

  const visible = BOARD_OUTCOME_SECONDARY.slice(0, revealCount);
  const canShowMore = revealCount < BOARD_OUTCOME_SECONDARY.length;

  return (
    <div
      className="board-discussion-outcome"
      data-testid="board-discussion-outcome"
      data-accepted={accepted ? "true" : "false"}
    >
      {!accepted ? (
        <div className="boardroom-actions">
          <button
            type="button"
            className="boardroom-btn boardroom-btn--primary"
            data-testid={BOARD_OUTCOME_PRIMARY.testId}
            onClick={useRecommendation}
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
          <div
            className="boardroom-actions"
            style={{ flexWrap: "wrap" }}
            data-testid="board-outcome-secondary-actions"
          >
            {visible.map((action) => (
              <button
                key={action.id}
                type="button"
                className="boardroom-btn boardroom-btn--secondary"
                data-testid={action.testId}
                onClick={() => {
                  onSecondaryAction?.(action.id, record);
                  setStatusMessage(`Noted — ${action.label}.`);
                }}
              >
                {action.label}
              </button>
            ))}
            {canShowMore ? (
              <button
                type="button"
                className="boardroom-btn boardroom-btn--ghost"
                data-testid="board-outcome-show-more"
                onClick={() => setRevealCount((n) => nextRevealCount(n))}
              >
                Show more options
              </button>
            ) : null}
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
        </>
      )}
    </div>
  );
}
