"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { JOURNAL_ROOM_BG } from "@/lib/growth/growthRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
};

/** Full-screen Journal room — White Gazebo fills the content area. */
export function JournalRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(JOURNAL_ROOM_BG);
  }, []);

  return (
    <div className="journal-room" data-testid="journal-room" data-homestead-room="journal">
      <CinematicBackground
        preset="journal"
        mode="image"
        scale={1}
        position="center center"
        imageUrl={JOURNAL_ROOM_BG}
        imageStyle={roomBackgroundImageStyle(JOURNAL_ROOM_BG)}
        placement="absolute"
        className="journal-room__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="journal-room__scroll">{children}</div>
    </div>
  );
}
