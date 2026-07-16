"use client";

import { useState } from "react";
import type { EstateBrowseEntry } from "@/lib/profile/businessEstateRedesign";
import {
  estateRoomTimeEstimate,
  getPeopleIHelpFacingStatus,
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
  const [showComingList, setShowComingList] = useState(false);

  if (entry.kind === "coming-soon" || (!entry.available && entry.comingSoonItems)) {
    return (
      <li
        className="be-room-entry be-room-entry--coming-soon"
        data-testid={`be-entry-${entry.id}`}
      >
        <div>
          <p className="be-room-entry__name">{entry.name}</p>
          <p className="be-room-entry__purpose">{entry.purpose}</p>
          <p className="be-room-entry__status">
            {entry.comingLaterLabel ?? "Coming Later"}
          </p>
          {entry.comingSoonItems && entry.comingSoonItems.length > 0 ? (
            <div className="be-coming-soon">
              <button
                type="button"
                className="be-btn be-btn--ghost be-btn--compact"
                onClick={() => setShowComingList((v) => !v)}
                data-testid="be-see-whats-coming"
                aria-expanded={showComingList}
              >
                {showComingList ? "Hide What's Coming" : "See What's Coming"}
              </button>
              {showComingList ? (
                <ul
                  className="be-coming-soon__list"
                  data-testid="be-coming-soon-list"
                >
                  {entry.comingSoonItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      </li>
    );
  }

  if (!entry.available) {
    return (
      <li
        className="be-room-entry be-room-entry--later"
        data-testid={`be-entry-${entry.id}`}
      >
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
    const peopleFacing = getPeopleIHelpFacingStatus();
    return (
      <li className="be-room-entry" data-testid={`be-entry-${entry.id}`}>
        <div>
          <p className="be-room-entry__name">{entry.name}</p>
          <p className="be-room-entry__purpose">{entry.purpose}</p>
          <p className="be-room-entry__meta">
            {estateRoomTimeEstimate("people-i-help")}
          </p>
          <p
            className="be-room-entry__status"
            data-testid="be-entry-status-people-i-help"
          >
            {roomFacingStatusLabel(peopleFacing)}
          </p>
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
        <p className="be-room-entry__meta">
          {estateRoomTimeEstimate(entry.sectionId)}
        </p>
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
