"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { CREATIVE_STUDIO_ROOM_BG } from "@/lib/creativeStudio/creativeStudioRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
};

/** Full-screen Creative Studio — creative-studio-background fills the viewport. */
export function CreativeStudioRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(CREATIVE_STUDIO_ROOM_BG);
  }, []);

  return (
    <div
      className="creative-studio-room"
      data-testid="creative-studio-room"
      data-homestead-room="creative-studio"
    >
      <CinematicBackground
        preset="creative-studio"
        mode="image"
        scale={1}
        position="center center"
        imageUrl={CREATIVE_STUDIO_ROOM_BG}
        imageStyle={roomBackgroundImageStyle(CREATIVE_STUDIO_ROOM_BG)}
        placement="absolute"
        className="creative-studio-room__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="creative-studio-room__scroll">{children}</div>
    </div>
  );
}
