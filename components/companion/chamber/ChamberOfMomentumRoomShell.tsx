"use client";

import { useEffect, useMemo } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { useChatBackdropRevision } from "@/lib/chatBackdrop";
import { CHAMBER_OF_MOMENTUM_ROOM_BG } from "@/lib/estate/chamber/chamberOfMomentumRoomRegistry";
import { resolveEstateRoomBackgroundImage } from "@/lib/estate/estateRoomBackground";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/** Chamber of Momentum — guided doorway (not a dashboard). */
export function ChamberOfMomentumRoomShell({ children }: Props) {
  const backdropRevision = useChatBackdropRevision();
  const imageUrl = useMemo(() => {
    void backdropRevision;
    return (
      resolveEstateRoomBackgroundImage("chamber-of-momentum") ??
      resolveEstateRoomBackgroundImage("momentum-institute") ??
      CHAMBER_OF_MOMENTUM_ROOM_BG
    );
  }, [backdropRevision]);

  useEffect(() => {
    preloadRoomBackground(imageUrl);
  }, [imageUrl]);

  return (
    <div
      className="chamber-room"
      data-testid="chamber-of-momentum-room"
      data-homestead-room="chamber-of-momentum"
    >
      <CinematicBackground
        preset="chamber-of-momentum"
        mode="image"
        imageUrl={imageUrl}
        imageStyle={roomBackgroundImageStyle(imageUrl)}
        placement="fixed"
        className="chamber-room__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="chamber-room__scroll">{children}</div>
    </div>
  );
}
