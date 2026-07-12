"use client";

import Image from "next/image";
import type { BoardDirectorDefinition } from "@/lib/board/types";
import {
  meetDirectorCtaLabel,
  resolveBoardDirectorPortraitPath,
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
 * Compact Director card — real UI text/controls (not a flattened card image).
 */
export function BoardDirectorGalleryCard({
  director,
  included,
  onOpenProfile,
  onMeet,
  onInclude,
  onRemove,
}: Props) {
  const portraitSrc = resolveBoardDirectorPortraitPath(director);
  const meetLabel = meetDirectorCtaLabel(director);
  const lensPreview = director.decisionLens.slice(0, 2).join(" · ");

  return (
    <article
      className={`board-director-gallery-card${
        included ? " board-director-gallery-card--included" : ""
      }`}
      role="listitem"
      data-testid={`board-director-gallery-card-${director.id}`}
      data-included={included ? "true" : "false"}
    >
      <button
        type="button"
        className="board-director-gallery-card__portrait-btn"
        aria-label={`Open profile for ${director.name}`}
        data-testid={`board-director-gallery-portrait-${director.id}`}
        onClick={onOpenProfile}
      >
        <Image
          src={portraitSrc}
          alt=""
          width={200}
          height={260}
          className="board-director-gallery-card__portrait"
        />
      </button>
      <button
        type="button"
        className="board-director-gallery-card__name"
        data-testid={`board-director-gallery-name-${director.id}`}
        onClick={onOpenProfile}
      >
        {director.name}
      </button>
      {/* Board role — non-clickable */}
      <p className="board-director-gallery-card__role" data-noninteractive>
        {director.boardRole}
      </p>
      {/* Philosophy — non-clickable quote */}
      <p className="board-director-gallery-card__philosophy" data-noninteractive>
        {director.philosophy}
      </p>
      <p className="board-director-gallery-card__lens" data-noninteractive>
        <span className="board-director-gallery-card__lens-label">
          Decision Lens
        </span>
        {lensPreview}
      </p>
      {director.isCoreDirector ? (
        <span
          className="board-director-gallery-card__core"
          data-noninteractive
          title="Core Directors sit at the Round Table for major decisions. They are Board members — not Chamber specialists."
          data-testid={`board-director-gallery-core-${director.id}`}
        >
          Core Director
        </span>
      ) : null}
      <button
        type="button"
        className="board-director-gallery-card__meet"
        data-testid={`board-director-gallery-meet-${director.id}`}
        onClick={onMeet}
      >
        {meetLabel}
      </button>
      <BoardReviewIncludeButton
        director={director}
        included={included}
        onInclude={onInclude}
        onRemove={onRemove}
        variant="gallery"
      />
    </article>
  );
}
