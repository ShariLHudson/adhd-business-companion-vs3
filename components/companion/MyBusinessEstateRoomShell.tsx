"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { ESTATE_PROFILE_ROOM_BG } from "@/lib/growth/growthRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
};

/** My Business Estate™ — estate profile plate, full-bleed cover. */
export function MyBusinessEstateRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(ESTATE_PROFILE_ROOM_BG);
  }, []);

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
        imageUrl={ESTATE_PROFILE_ROOM_BG}
        imageStyle={roomBackgroundImageStyle(ESTATE_PROFILE_ROOM_BG)}
        placement="absolute"
        className="my-business-estate-room__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="my-business-estate-room__scroll">{children}</div>
    </div>
  );
}
