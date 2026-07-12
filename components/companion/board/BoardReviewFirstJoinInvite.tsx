"use client";

import type { BoardDirectorDefinition, BoardDirectorId } from "@/lib/board";
import "@/app/companion/board-director-meet.css";

type Props = {
  joinedDirector: BoardDirectorDefinition;
  suggestions: BoardDirectorDefinition[];
  onInviteSuggestion: (directorId: BoardDirectorId) => void;
  onDismiss: () => void;
  onBrowseDirectors: () => void;
};

/**
 * First Director join prompt — suggestions only; never auto-invites.
 */
export function BoardReviewFirstJoinInvite({
  joinedDirector,
  suggestions,
  onInviteSuggestion,
  onDismiss,
  onBrowseDirectors,
}: Props) {
  const firstName =
    joinedDirector.name.trim().split(/\s+/)[0] ?? joinedDirector.name;

  return (
    <aside
      className="board-review-first-join"
      data-testid="board-review-first-join"
      aria-live="polite"
    >
      <p className="board-review-first-join__line">
        {firstName} has joined your Board.
      </p>
      <p className="board-review-first-join__line">
        Would you like to invite another Director?
      </p>

      {suggestions.length > 0 ? (
        <div className="board-review-first-join__suggestions">
          <p className="board-review-first-join__label">Suggested Directors</p>
          <ul className="board-review-first-join__list">
            {suggestions.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  className="board-review-first-join__chip"
                  data-testid={`board-review-suggest-${d.id}`}
                  onClick={() => onInviteSuggestion(d.id)}
                >
                  {d.name}
                  <span className="board-review-first-join__chip-role">
                    {d.shortRole}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="board-review-first-join__actions">
        <button
          type="button"
          className="board-review-first-join__browse"
          data-testid="board-review-browse-directors"
          onClick={onBrowseDirectors}
        >
          Browse Directors
        </button>
        <button
          type="button"
          className="board-review-first-join__dismiss"
          data-testid="board-review-first-join-dismiss"
          onClick={onDismiss}
        >
          Not now
        </button>
      </div>
    </aside>
  );
}
