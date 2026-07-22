"use client";

import Image from "next/image";
import type { BoardDirectorDefinition } from "@/lib/board/types";
import {
  meetDirectorCtaLabel,
  resolveBoardDirectorGalleryCardPath,
} from "@/lib/board";
import { BoardReviewIncludeButton } from "@/components/companion/board/BoardReviewIncludeButton";
import "@/app/companion/board-director-meet.css";

type Props = {
  director: BoardDirectorDefinition;
  included: boolean;
  onOpenProfile: () => void;
  onMeet: () => void;
  onInclude: () => void;
  onRemove: () => void;
};

/**
 * Compact Director gallery card — full designed Compact Gallery Card art.
 * Name, role, and lens live in the artwork; real Meet / Include controls sit below.
 */
export function BoardDirectorGalleryCard({
  director,
  included,
  onOpenProfile,
  onMeet,
  onInclude,
  onRemove,
}: Props) {
  const gallerySrc = resolveBoardDirectorGalleryCardPath(director);
  const meetLabel = meetDirectorCtaLabel(director);

  return (
    <article
      className={`board-director-gallery-card board-director-card${
        included ? " board-director-gallery-card--included" : ""
      }`}
      role="listitem"
      data-testid={`board-director-gallery-card-${director.id}`}
      data-included={included ? "true" : "false"}
      data-selected={included ? "true" : "false"}
    >
      {included ? (
        <span
          aria-hidden="true"
          className="board-director-gallery-card__selected-check selection-check"
        >
          ✓
        </span>
      ) : null}
      <button
        type="button"
        className="board-director-gallery-card__art-btn"
        aria-label={`Open profile for ${director.name}, ${director.boardRole}`}
        data-testid={`board-director-gallery-portrait-${director.id}`}
        onClick={onOpenProfile}
      >
        <Image
          key={gallerySrc}
          src={gallerySrc}
          alt={`${director.name}, ${director.boardRole}`}
          width={467}
          height={485}
          className="board-director-gallery-card__art"
          sizes="(max-width: 720px) 92vw, 24rem"
          unoptimized
        />
      </button>

      <div className="board-director-gallery-card__actions">
        <div className="board-director-gallery-card__footer">
          {director.isCoreDirector ? (
            <span
              className="board-director-gallery-card__core"
              data-noninteractive
              title="Core Directors sit at the Round Table for major decisions. They are Board members — not Chamber specialists."
              data-testid={`board-director-gallery-core-${director.id}`}
            >
              Core Director
            </span>
          ) : (
            <span
              className="board-director-gallery-card__optional"
              data-noninteractive
            >
              Optional Director
            </span>
          )}
          <button
            type="button"
            className="board-director-gallery-card__meet"
            data-testid={`board-director-gallery-meet-${director.id}`}
            onClick={onMeet}
          >
            {meetLabel}
            <span aria-hidden> →</span>
          </button>
        </div>

        <BoardReviewIncludeButton
          director={director}
          included={included}
          onInclude={onInclude}
          onRemove={onRemove}
          variant="gallery"
        />
      </div>
    </article>
  );
}
