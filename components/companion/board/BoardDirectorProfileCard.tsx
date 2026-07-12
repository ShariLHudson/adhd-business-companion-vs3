"use client";

import Image from "next/image";
import type { BoardDirectorDefinition } from "@/lib/board/types";
import type { BoardDirectorAccordionSectionId } from "@/lib/board/directorAccordion";
import {
  meetDirectorCtaLabel,
  resolveBoardDirectorPortraitPath,
} from "@/lib/board";
import { BoardReviewIncludeButton } from "@/components/companion/board/BoardReviewIncludeButton";
import { BoardDirectorProfileAccordion } from "@/components/companion/board/BoardDirectorProfileAccordion";
import "@/app/companion/board-director-meet.css";

type Props = {
  director: BoardDirectorDefinition;
  /** When Meet conversation is open — fade profile underneath. */
  faded?: boolean;
  onMeet: () => void;
  onBackToGallery: () => void;
  onOpenPlaceAtTable?: () => void;
  portraitEnlarged?: boolean;
  onTogglePortraitEnlarge?: () => void;
  includedInBoardReview?: boolean;
  onIncludeInBoardReview?: () => void;
  onRemoveFromBoardReview?: () => void;
  openAccordionId?: BoardDirectorAccordionSectionId | null;
  onToggleAccordion?: (id: BoardDirectorAccordionSectionId) => void;
};

/**
 * Expanded Director profile — registry-driven text and real controls.
 * Stays mounted under the conversation overlay.
 */
export function BoardDirectorProfileCard({
  director,
  faded = false,
  onMeet,
  onBackToGallery,
  onOpenPlaceAtTable,
  portraitEnlarged = false,
  onTogglePortraitEnlarge,
  includedInBoardReview = false,
  onIncludeInBoardReview,
  onRemoveFromBoardReview,
  openAccordionId = null,
  onToggleAccordion,
}: Props) {
  const portraitSrc = resolveBoardDirectorPortraitPath(director);
  const meetLabel = meetDirectorCtaLabel(director);

  return (
    <article
      className={`board-director-profile${faded ? " board-director-profile--faded" : ""}${
        portraitEnlarged ? " board-director-profile--portrait-enlarged" : ""
      }`}
      data-testid={`board-director-profile-${director.id}`}
      data-faded={faded ? "true" : "false"}
      aria-hidden={faded ? true : undefined}
    >
      <button
        type="button"
        className="board-director-profile__back"
        onClick={onBackToGallery}
        data-testid="board-director-profile-back"
      >
        ← Directors
      </button>

      <div
        className="board-director-profile__identity-strip"
        data-noninteractive
        data-testid="board-director-identity-strip"
      >
        <span>Board of Directors</span>
        <span aria-hidden>·</span>
        <span>{director.boardRole}</span>
        {director.isCoreDirector ? (
          <>
            <span aria-hidden>·</span>
            <span
              title="Core Directors sit at the Round Table for major decisions."
            >
              Core Director
            </span>
          </>
        ) : null}
      </div>

      <div className="board-director-profile__layout">
        <button
          type="button"
          className="board-director-profile__portrait-btn"
          aria-label={
            portraitEnlarged
              ? `Shrink portrait of ${director.name}`
              : `Enlarge portrait of ${director.name}`
          }
          data-testid="board-director-portrait"
          onClick={() => onTogglePortraitEnlarge?.()}
        >
          <span className="board-director-profile__portrait-frame">
            <Image
              src={portraitSrc}
              alt={director.name}
              width={360}
              height={480}
              className="board-director-profile__portrait"
              priority
            />
          </span>
        </button>

        <div className="board-director-profile__body">
          <p className="board-director-profile__role" data-noninteractive>
            {director.boardRole}
          </p>
          <h2 className="board-director-profile__name">{director.name}</h2>
          {director.isCoreDirector ? (
            <p
              className="board-director-profile__badge"
              data-noninteractive
              title="Core Directors sit at the Round Table for major decisions. They are Board members — not Chamber specialists."
            >
              Core Director
            </p>
          ) : null}
          <p className="board-director-profile__philosophy" data-noninteractive>
            {director.philosophy}
          </p>
          <div
            className="board-director-profile__welcome"
            data-noninteractive
            data-testid="board-director-welcome"
          >
            <p>{director.openingMessage}</p>
          </div>
          <p className="board-director-profile__signature" data-noninteractive>
            {director.signature}
          </p>
          <p className="board-director-profile__purpose" data-noninteractive>
            {director.purpose}
          </p>

          {onOpenPlaceAtTable ? (
            <button
              type="button"
              className="board-director-profile__place"
              data-testid="board-director-my-place-indicator"
              onClick={onOpenPlaceAtTable}
              disabled={faded}
            >
              My Place at the Table
            </button>
          ) : null}

          <div className="board-director-profile__actions">
            <button
              type="button"
              className="board-director-profile__meet"
              data-testid={`board-director-meet-${director.id}`}
              onClick={onMeet}
              disabled={faded}
            >
              {meetLabel}
            </button>
            {onIncludeInBoardReview && onRemoveFromBoardReview ? (
              <BoardReviewIncludeButton
                director={director}
                included={includedInBoardReview}
                disabled={faded}
                onInclude={onIncludeInBoardReview}
                onRemove={onRemoveFromBoardReview}
              />
            ) : null}
          </div>

          {onToggleAccordion ? (
            <BoardDirectorProfileAccordion
              director={director}
              openSectionId={openAccordionId}
              onToggleSection={onToggleAccordion}
              disabled={faded}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
