"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { GROWTH_ROOM_BG } from "@/lib/growth/growthRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
};

/** Full-screen Growth sanctuary — background is the room; hub content floats on glass. */
export function GrowthRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(GROWTH_ROOM_BG);
  }, []);

  return (
    <div className="growth-room" data-testid="growth-room" data-homestead-room="growth">
      <CinematicBackground
        preset="growth"
        mode="image"
        imageStyle={roomBackgroundImageStyle(GROWTH_ROOM_BG)}
        placement="fixed"
        className="growth-room__cinematic"
      />
      <div className="growth-room__scroll">
        <div className="growth-room__center">
          <div className="growth-room__workspace">{children}</div>
        </div>
      </div>
    </div>
  );
}
