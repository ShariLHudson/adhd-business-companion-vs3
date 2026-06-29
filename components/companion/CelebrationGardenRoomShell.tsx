"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { CELEBRATION_GARDEN_ROOM_BG } from "@/lib/celebrationGarden/celebrationGardenRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
};

/** Full-screen celebration garden — celebration-garden-background fills the viewport. */
export function CelebrationGardenRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(CELEBRATION_GARDEN_ROOM_BG);
  }, []);

  return (
    <div
      className="celebration-garden-room"
      data-testid="celebration-garden-room"
      data-homestead-room="celebration-garden"
    >
      <CinematicBackground
        preset="celebration-garden"
        mode="image"
        scale={1}
        position="center center"
        imageUrl={CELEBRATION_GARDEN_ROOM_BG}
        imageStyle={roomBackgroundImageStyle(CELEBRATION_GARDEN_ROOM_BG)}
        placement="absolute"
        className="celebration-garden-room__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="celebration-garden-room__scroll">{children}</div>
    </div>
  );
}
