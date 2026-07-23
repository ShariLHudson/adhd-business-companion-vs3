"use client";

import type { BusinessEstateSectionId } from "@/lib/profile/businessEstateProfile";
import {
  listEstateOverviewRooms,
  type EstateOverviewRoomRow,
} from "@/lib/profile/businessEstateRedesign";

type Props = {
  onEnterRoom: (sectionId: BusinessEstateSectionId) => void;
  onOpenPeopleIHelp?: () => void;
  /** Glanceable dots/rings only — hide dense status text walls. */
  visualOnly?: boolean;
};

function progressTone(percent: number): string {
  if (percent >= 100) return "complete";
  if (percent >= 70) return "review";
  if (percent >= 25) return "progress";
  return "quiet";
}

function RoomRow({
  row,
  onEnterRoom,
  onOpenPeopleIHelp,
  visualOnly,
}: {
  row: EstateOverviewRoomRow;
  onEnterRoom: (sectionId: BusinessEstateSectionId) => void;
  onOpenPeopleIHelp?: () => void;
  visualOnly?: boolean;
}) {
  const tone = progressTone(row.progressPercent);

  function open() {
    if (row.kind === "people-i-help") {
      onOpenPeopleIHelp?.();
      return;
    }
    if (row.sectionId) onEnterRoom(row.sectionId);
  }

  return (
    <li
      className={`be-progress-row be-progress-row--${tone}`}
      data-testid={`be-progress-row-${row.id}`}
    >
      <button
        type="button"
        className="be-progress-row__button"
        onClick={open}
        data-testid={`be-progress-open-${row.id}`}
        aria-label={`${row.name}. ${row.benefit}. ${row.statusLabel}.`}
      >
        <span
          className="be-progress-row__ring"
          aria-hidden
          style={{ ["--be-progress" as string]: `${row.progressPercent}%` }}
        >
          <span className="be-progress-row__ring-fill" />
        </span>
        <span className="be-progress-row__copy">
          <span className="be-progress-row__name">{row.name}</span>
          {visualOnly ? (
            <span className="be-progress-row__benefit">{row.benefit}</span>
          ) : (
            <>
              <span className="be-progress-row__status">{row.statusLabel}</span>
              <span className="be-progress-row__meta">{row.benefit}</span>
            </>
          )}
        </span>
      </button>
    </li>
  );
}

/**
 * Optional browse strip — visual progress first, status text secondary.
 */
export function BusinessEstateProgressStrip({
  onEnterRoom,
  onOpenPeopleIHelp,
  visualOnly = false,
}: Props) {
  const rooms = listEstateOverviewRooms();

  return (
    <section
      className={`be-progress-strip${visualOnly ? " be-progress-strip--visual" : ""}`}
      aria-label="Business Estate rooms"
      data-testid="be-progress-strip"
    >
      <h2 className="be-progress-strip__title">
        {visualOnly ? "Rooms at a glance" : "Business Estate Overview"}
      </h2>
      <p className="be-progress-strip__lead">
        Filled rings show where Spark already has something useful — open any
        room when you are ready.
      </p>
      <ul className="be-progress-strip__list">
        {rooms.map((row) => (
          <RoomRow
            key={row.id}
            row={row}
            onEnterRoom={onEnterRoom}
            onOpenPeopleIHelp={onOpenPeopleIHelp}
            visualOnly={visualOnly}
          />
        ))}
      </ul>
    </section>
  );
}
