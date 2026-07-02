"use client";

import { useEffect, type ReactNode } from "react";
import { EstateRoomFullBleedBackground } from "@/components/companion/estate/EstateRoomFullBleedBackground";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import type { EstateCollectionRoomConfig } from "@/lib/estate/collectionFramework";

type Props = {
  room: Pick<
    EstateCollectionRoomConfig,
    "placeId" | "backgroundImage" | "imagePlaceId" | "id"
  >;
  children: ReactNode;
};

/** Shared full-bleed shell for every collection room. */
export function EstateCollectionRoomShell({ room, children }: Props) {
  const placeId = room.imagePlaceId ?? room.placeId;

  useEffect(() => {
    preloadRoomBackground(room.backgroundImage);
  }, [room.backgroundImage]);

  return (
    <div
      className="estate-collection-room"
      data-testid={`estate-collection-room-${room.id}`}
      data-homestead-room={placeId}
    >
      <EstateRoomFullBleedBackground
        roomId={placeId}
        imageUrl={room.backgroundImage}
        className="estate-collection-room__plate"
      />
      <div className="estate-collection-room__scroll">{children}</div>
    </div>
  );
}
