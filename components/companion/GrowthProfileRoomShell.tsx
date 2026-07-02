"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { GROWTH_ROOM_BG } from "@/lib/growth/growthRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
};

/** Growth Profile™ — greenhouse plate, full-bleed cover. */
export function GrowthProfileRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(GROWTH_ROOM_BG);
  }, []);

  return (
    <div
      className="growth-profile-room"
      data-testid="growth-profile-room"
      data-homestead-room="growth-profile"
    >
      <CinematicBackground
        preset="growth"
        mode="image"
        scale={1}
        position="center center"
        imageUrl={GROWTH_ROOM_BG}
        imageStyle={roomBackgroundImageStyle(GROWTH_ROOM_BG)}
        placement="absolute"
        className="growth-profile-room__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="growth-profile-room__scroll">{children}</div>
    </div>
  );
}
