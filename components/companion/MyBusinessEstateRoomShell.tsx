"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { ESTATE_PROFILE_ROOM_BG } from "@/lib/growth/growthRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
  /** Optional room plate — defaults to Estate Profile portrait. */
  backgroundUrl?: string;
};

/** My Business Estate — full-bleed Executive Office room. */
export function MyBusinessEstateRoomShell({
  children,
  backgroundUrl = ESTATE_PROFILE_ROOM_BG,
}: Props) {
  useEffect(() => {
    preloadRoomBackground(backgroundUrl);
  }, [backgroundUrl]);

  return (
    <div
      className="my-business-estate-room"
      data-testid="my-business-estate-room"
      data-homestead-room="my-estate"
    >
      <CinematicBackground
        preset="default"
        mode="image"
        scale={1}
        position="center center"
        imageUrl={backgroundUrl}
        imageStyle={roomBackgroundImageStyle(backgroundUrl)}
        placement="absolute"
        className="my-business-estate-room__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="my-business-estate-room__scroll">{children}</div>
    </div>
  );
}
