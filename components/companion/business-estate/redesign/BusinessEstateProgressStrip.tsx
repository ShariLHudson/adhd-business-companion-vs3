"use client";

import type { BusinessEstateSectionId } from "@/lib/profile/businessEstateProfile";
import {
  listEstateOverviewRooms,
  type EstateOverviewRoomRow,
} from "@/lib/profile/businessEstateRedesign";

type Props = {
  onEnterRoom: (sectionId: BusinessEstateSectionId) => void;
  onOpenPeopleIHelp?: () => void;
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
}: {
  row: EstateOverviewRoomRow;
  onEnterRoom: (sectionId: BusinessEstateSectionId) => void;
  onOpenPeopleIHelp?: () => void;
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
      >
        <span
          className="be-progress-row__indicator"
          aria-hidden
          style={{ ["--be-progress" as string]: `${row.progressPercent}%` }}
        />
        <span className="be-progress-row__copy">
          <span className="be-progress-row__name">{row.name}</span>
          <span className="be-progress-row__status">{row.statusLabel}</span>
          <span className="be-progress-row__meta">
            {row.timeEstimate} · Updated {row.lastUpdatedLabel}
          </span>
        </span>
      </button>
    </li>
  );
}

/**
 * Always-visible room progress — no accordion required to see status.
 */
export function BusinessEstateProgressStrip({
  onEnterRoom,
  onOpenPeopleIHelp,
}: Props) {
  const rooms = listEstateOverviewRooms();

  return (
    <section
      className="be-progress-strip"
      aria-label="Business Estate overview"
      data-testid="be-progress-strip"
    >
      <h2 className="be-progress-strip__title">Business Estate Overview</h2>
      <p className="be-progress-strip__lead">
        A quick look at where things stand — open any room when you are ready.
      </p>
      <ul className="be-progress-strip__list">
        {rooms.map((row) => (
          <RoomRow
            key={row.id}
            row={row}
            onEnterRoom={onEnterRoom}
            onOpenPeopleIHelp={onOpenPeopleIHelp}
          />
        ))}
      </ul>
    </section>
  );
}
