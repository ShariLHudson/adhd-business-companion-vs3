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
  /** When set, overrides `room.backgroundImage` (Evidence Vault entrance vs interior). */
  backgroundImage?: string;
  children: ReactNode;
  dataVaultEntrancePhase?: string;
};

/** Shared full-bleed shell for every collection room. */
export function EstateCollectionRoomShell({
  room,
  backgroundImage: backgroundImageOverride,
  children,
  dataVaultEntrancePhase,
}: Props) {
  const placeId = room.imagePlaceId ?? room.placeId;
  const plateUrl = backgroundImageOverride ?? room.backgroundImage;

  useEffect(() => {
    preloadRoomBackground(plateUrl);
  }, [plateUrl]);

  return (
    <div
      className="estate-collection-room"
      data-testid={`estate-collection-room-${room.id}`}
      data-homestead-room={placeId}
      data-vault-entrance-phase={dataVaultEntrancePhase}
    >
      <EstateRoomFullBleedBackground
        roomId={placeId}
        imageUrl={plateUrl}
        className="estate-collection-room__plate"
      />
      <div className="estate-collection-room__scroll">{children}</div>
    </div>
  );
}
