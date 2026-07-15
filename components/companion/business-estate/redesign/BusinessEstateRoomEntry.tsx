"use client";

import type { EstateBrowseEntry } from "@/lib/profile/businessEstateRedesign";
import {
  getRoomFacingStatus,
  roomFacingStatusLabel,
  roomPrimaryActionLabel,
} from "@/lib/profile/businessEstateRedesign";

type Props = {
  entry: EstateBrowseEntry;
  onEnterRoom: (sectionId: NonNullable<EstateBrowseEntry["sectionId"]>) => void;
  onOpenPeopleIHelp?: () => void;
};

export function BusinessEstateRoomEntry({
  entry,
  onEnterRoom,
  onOpenPeopleIHelp,
}: Props) {
  if (!entry.available) {
    return (
      <li className="be-room-entry be-room-entry--later" data-testid={`be-entry-${entry.id}`}>
        <div>
          <p className="be-room-entry__name">{entry.name}</p>
          <p className="be-room-entry__purpose">{entry.purpose}</p>
          <p className="be-room-entry__status">
            {entry.comingLaterLabel ?? "Coming Later"}
          </p>
        </div>
      </li>
    );
  }

  if (entry.id === "people-i-help") {
    return (
      <li className="be-room-entry" data-testid={`be-entry-${entry.id}`}>
        <div>
          <p className="be-room-entry__name">{entry.name}</p>
          <p className="be-room-entry__purpose">{entry.purpose}</p>
          <p className="be-room-entry__status">Not Personalized</p>
        </div>
        <button
          type="button"
          className="be-btn be-btn--primary be-btn--compact"
          onClick={() => onOpenPeopleIHelp?.()}
          data-testid={`be-entry-action-${entry.id}`}
        >
          Open People I Help
        </button>
      </li>
    );
  }

  if (!entry.sectionId) return null;

  const facing = getRoomFacingStatus(entry.sectionId);
  const action = roomPrimaryActionLabel(entry.sectionId, facing);

  return (
    <li className="be-room-entry" data-testid={`be-entry-${entry.id}`}>
      <div>
        <p className="be-room-entry__name">{entry.name}</p>
        <p className="be-room-entry__purpose">{entry.purpose}</p>
        <p
          className="be-room-entry__status"
          data-testid={`be-entry-status-${entry.id}`}
        >
          {roomFacingStatusLabel(facing)}
        </p>
      </div>
      <button
        type="button"
        className="be-btn be-btn--primary be-btn--compact"
        onClick={() => onEnterRoom(entry.sectionId!)}
        data-testid={`be-entry-action-${entry.id}`}
      >
        {action}
      </button>
    </li>
  );
}
