"use client";

import { useEffect } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { CHAMBER_OF_MOMENTUM_ROOM_BG } from "@/lib/estate/chamber/chamberOfMomentumRoomRegistry";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/** Chamber of Momentum™ — guided doorway (not a dashboard). */
export function ChamberOfMomentumRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(CHAMBER_OF_MOMENTUM_ROOM_BG);
  }, []);

  return (
    <div
      className="chamber-room"
      data-testid="chamber-of-momentum-room"
      data-homestead-room="chamber-of-momentum"
    >
      <CinematicBackground
        preset="growth"
        mode="image"
        scale={1}
        position="center center"
        imageUrl={CHAMBER_OF_MOMENTUM_ROOM_BG}
        imageStyle={roomBackgroundImageStyle(CHAMBER_OF_MOMENTUM_ROOM_BG)}
        placement="absolute"
        className="chamber-room__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="chamber-room__scroll">{children}</div>
    </div>
  );
}
