"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { CAPTURE_MOMENT_ROOM_BG } from "@/lib/captureMoment/captureMomentRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import "@/app/companion/capture-moment-room.css";

type Props = {
  children: ReactNode;
  /** Writing focus — soften scene behind the notebook. */
  reflecting?: boolean;
};

/** Full-screen Capture a Moment — capture-a-moment-background fills the viewport. */
export function CaptureMomentRoomShell({ children, reflecting }: Props) {
  useEffect(() => {
    preloadRoomBackground(CAPTURE_MOMENT_ROOM_BG);
  }, []);

  return (
    <div
      className={`capture-moment-room${reflecting ? " capture-moment-room--reflecting" : ""}`}
      data-testid="capture-moment-room"
      data-homestead-room="capture-moment"
    >
      <CinematicBackground
        preset="capture-moment"
        mode="image"
        scale={1}
        position="center center"
        imageUrl={CAPTURE_MOMENT_ROOM_BG}
        imageStyle={roomBackgroundImageStyle(CAPTURE_MOMENT_ROOM_BG)}
        placement="absolute"
        className="capture-moment-room__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="capture-moment-room__scroll">{children}</div>
    </div>
  );
}
