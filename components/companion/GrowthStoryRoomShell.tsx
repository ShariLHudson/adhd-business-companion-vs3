"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { GROWTH_ROOM_BG } from "@/lib/growth/growthRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
};

/** Your Story — same full-bleed background placement as Journal. */
export function GrowthStoryRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(GROWTH_ROOM_BG);
  }, []);

  return (
    <div className="journal-room" data-testid="your-story-room" data-homestead-room="growth">
      <CinematicBackground
        preset="growth"
        mode="image"
        scale={1}
        position="center center"
        imageUrl={GROWTH_ROOM_BG}
        imageStyle={roomBackgroundImageStyle(GROWTH_ROOM_BG)}
        placement="absolute"
        className="journal-room__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="journal-room__scroll">{children}</div>
    </div>
  );
}
