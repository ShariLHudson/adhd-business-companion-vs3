"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { GROWTH_ROOM_BG } from "@/lib/growth/growthRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
};

/** Grow — entrepreneurial capability landing and sub-rooms. */
export function GrowRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(GROWTH_ROOM_BG);
  }, []);

  return (
    <div className="grow-room" data-testid="grow-room" data-homestead-room="grow">
      <CinematicBackground
        preset="growth"
        mode="image"
        scale={1}
        position="center center"
        imageUrl={GROWTH_ROOM_BG}
        imageStyle={roomBackgroundImageStyle(GROWTH_ROOM_BG)}
        placement="absolute"
        className="grow-room__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="grow-room__scroll">{children}</div>
    </div>
  );
}
