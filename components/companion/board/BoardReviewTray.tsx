"use client";

import { getBoardDirectorById, type BoardDirectorId } from "@/lib/board";
import type { BoardReviewState } from "@/lib/board/boardReview";
import { canStartBoardReview } from "@/lib/board/boardReview";
import "@/app/companion/board-director-meet.css";

type Props = {
  review: BoardReviewState;
  onRemove: (directorId: BoardDirectorId) => void;
  onStartBoardReview: () => void;
  onContinueChoosing?: () => void;
  onOpenDirector?: (directorId: BoardDirectorId) => void;
};

/**
 * Selected Directors tray — Start Board Review is member-initiated only.
 */
export function BoardReviewTray({
  review,
  onRemove,
  onStartBoardReview,
  onContinueChoosing,
  onOpenDirector,
}: Props) {
  if (review.selectedDirectorIds.length === 0) return null;

  const canStart = canStartBoardReview(review);

  return (
    <div
      className="board-review-tray"
      data-testid="board-review-tray"
      data-review-started={review.reviewStarted ? "true" : "false"}
    >
      <p className="board-review-tray__label">Your Board Review</p>
      <ul className="board-review-tray__list">
        {review.selectedDirectorIds.map((id) => {
          const d = getBoardDirectorById(id);
          if (!d) return null;
          return (
            <li key={id} className="board-review-tray__item">
              <button
                type="button"
                className="board-review-tray__name"
                onClick={() => onOpenDirector?.(id)}
              >
                {d.name}
              </button>
              {!review.reviewStarted ? (
                <button
                  type="button"
                  className="board-review-tray__remove"
                  aria-label={`Remove ${d.name} from Board Review`}
                  data-testid={`board-review-tray-remove-${id}`}
                  onClick={() => onRemove(id)}
                >
                  Remove
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="board-review-tray__actions">
        {onContinueChoosing ? (
          <button
            type="button"
            className="board-review-tray__continue"
            data-testid="board-review-continue-choosing"
            onClick={onContinueChoosing}
          >
            Continue Choosing Directors
          </button>
        ) : null}
        {canStart ? (
          <button
            type="button"
            className="board-review-tray__start"
            data-testid="board-review-start"
            onClick={onStartBoardReview}
          >
            Start Board Discussion
          </button>
        ) : null}
      </div>

      <p className="board-review-tray__hint">
        Discussion does not begin until you choose Start Board Discussion.
      </p>
    </div>
  );
}
