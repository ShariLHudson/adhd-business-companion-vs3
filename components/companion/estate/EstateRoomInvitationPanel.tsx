"use client";

import type { EstateRoomInvitationSet } from "@/lib/estate/estateRoomInvitation";
import type { EstateRoomInvitationItem } from "@/lib/estate/estateRoomInvitationTypes";

type Props = {
  invitation: EstateRoomInvitationSet;
  onSelect: (item: EstateRoomInvitationItem) => void;
  className?: string;
  /** Inside frosted chat — not a separate fixed panel */
  embedded?: boolean;
};

/**
 * Phase 2 — concierge invitation after arrival. Not a dashboard or task list.
 */
export function EstateRoomInvitationPanel({
  invitation,
  onSelect,
  className,
  embedded = false,
}: Props) {
  const { lead, preamble, items, primaryEndIndex } = invitation;
  const primaryItems = items.slice(0, primaryEndIndex);
  const universalItems = items.slice(primaryEndIndex);

  return (
    <aside
      className={[
        "estate-room-invitation",
        embedded ? "estate-room-invitation--embedded" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="estate-room-invitation"
      aria-label="While you're here"
    >
      <p className="estate-room-invitation__lead">{lead}</p>
      {primaryItems.length > 0 ? (
        <p className="estate-room-invitation__preamble">{preamble}</p>
      ) : null}
      <ul className="estate-room-invitation__list">
        {primaryItems.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={[
                "estate-room-invitation__choice",
                item.tier === "dynamic"
                  ? "estate-room-invitation__choice--dynamic"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelect(item)}
            >
              <span className="estate-room-invitation__emoji" aria-hidden>
                {item.emoji}
              </span>
              <span className="estate-room-invitation__label-block">
                <span className="estate-room-invitation__label">{item.label}</span>
                {item.detail ? (
                  <span className="estate-room-invitation__detail">{item.detail}</span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {universalItems.length > 0 ? (
        <>
          <div className="estate-room-invitation__divider" aria-hidden />
          <ul className="estate-room-invitation__list estate-room-invitation__list--universal">
            {universalItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="estate-room-invitation__choice estate-room-invitation__choice--universal"
                  onClick={() => onSelect(item)}
                >
                  <span className="estate-room-invitation__emoji" aria-hidden>
                    {item.emoji}
                  </span>
                  <span className="estate-room-invitation__label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <p className="estate-room-invitation__hint">
        Nothing here is required — stay as long as you like.
      </p>
    </aside>
  );
}
