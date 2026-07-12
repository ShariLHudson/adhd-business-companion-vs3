"use client";

import { useEffect, useState } from "react";
import type { BoardDirectorDefinition } from "@/lib/board/types";
import "@/app/companion/board-director-meet.css";

type Props = {
  director: BoardDirectorDefinition;
  included: boolean;
  disabled?: boolean;
  /** Gallery cards use compact styling; profile uses full include controls. */
  variant?: "profile" | "gallery";
  onInclude: () => void;
  onRemove: () => void;
};

/**
 * Include in Board Review / Included / Remove from Review.
 * Animates on include; never starts a discussion by itself.
 * Same component for every Director — no hardcoding.
 */
export function BoardReviewIncludeButton({
  director,
  included,
  disabled = false,
  variant = "profile",
  onInclude,
  onRemove,
}: Props) {
  const [justIncluded, setJustIncluded] = useState(false);

  useEffect(() => {
    if (!justIncluded) return;
    const t = window.setTimeout(() => setJustIncluded(false), 520);
    return () => window.clearTimeout(t);
  }, [justIncluded]);

  if (variant === "gallery") {
    if (included) {
      return (
        <button
          type="button"
          className={`board-director-gallery-card__review board-director-gallery-card__review--included${
            justIncluded ? " board-review-include__status--pulse" : ""
          }`}
          data-testid={`board-director-gallery-included-${director.id}`}
          onClick={onRemove}
          disabled={disabled}
        >
          Included in Board Review · Remove
        </button>
      );
    }
    return (
      <button
        type="button"
        className="board-director-gallery-card__review"
        data-testid={`board-director-gallery-include-${director.id}`}
        onClick={() => {
          setJustIncluded(true);
          onInclude();
        }}
        disabled={disabled}
      >
        Add to Review
      </button>
    );
  }

  if (included) {
    return (
      <div className="board-review-include board-review-include--included">
        <button
          type="button"
          className={`board-review-include__status${
            justIncluded ? " board-review-include__status--pulse" : ""
          }`}
          data-testid={`board-review-included-${director.id}`}
          aria-pressed="true"
          disabled
        >
          Included in Board Review
        </button>
        <button
          type="button"
          className="board-review-include__remove"
          data-testid={`board-review-remove-${director.id}`}
          onClick={onRemove}
          disabled={disabled}
        >
          Remove from Review
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="board-review-include__add"
      data-testid={`board-review-include-${director.id}`}
      onClick={() => {
        setJustIncluded(true);
        onInclude();
      }}
      disabled={disabled}
    >
      Include in Board Review
    </button>
  );
}
