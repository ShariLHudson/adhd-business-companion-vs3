"use client";

import type { EstateBrowseGroup, EstateGroupId } from "@/lib/profile/businessEstateRedesign";
import type { BusinessEstateSectionId } from "@/lib/profile/businessEstateProfile";
import { BusinessEstateRoomEntry } from "./BusinessEstateRoomEntry";

type Props = {
  groups: readonly EstateBrowseGroup[];
  openGroupId: EstateGroupId | null;
  onToggleGroup: (id: EstateGroupId) => void;
  onEnterRoom: (sectionId: BusinessEstateSectionId) => void;
  onOpenPeopleIHelp?: () => void;
};

export function BusinessEstateGroupAccordion({
  groups,
  openGroupId,
  onToggleGroup,
  onEnterRoom,
  onOpenPeopleIHelp,
}: Props) {
  return (
    <section
      className="be-browse"
      aria-label="Browse My Business Estate"
      data-testid="be-browse-groups"
    >
      <h2 className="be-browse__title">Browse My Business Estate</h2>
      <div className="be-browse__list">
        {groups.map((group) => {
          const open = openGroupId === group.id;
          return (
            <div
              key={group.id}
              className={`be-group${open ? " be-group--open" : ""}`}
              data-testid={`be-group-${group.id}`}
              data-open={open ? "true" : "false"}
            >
              <button
                type="button"
                className="be-group__header"
                aria-expanded={open}
                onClick={() => onToggleGroup(group.id)}
                data-testid={`be-group-toggle-${group.id}`}
              >
                <span className="be-group__title">{group.title}</span>
                <span className="be-group__chevron" aria-hidden>
                  {open ? "▾" : "▸"}
                </span>
              </button>
              {open ? (
                <div className="be-group__body">
                  <p className="be-group__description">{group.description}</p>
                  <ul className="be-group__entries">
                    {group.entries.map((entry) => (
                      <BusinessEstateRoomEntry
                        key={entry.id}
                        entry={entry}
                        onEnterRoom={onEnterRoom}
                        onOpenPeopleIHelp={onOpenPeopleIHelp}
                      />
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
