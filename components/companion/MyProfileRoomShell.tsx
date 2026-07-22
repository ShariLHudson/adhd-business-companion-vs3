"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { PROFILE_BACKGROUND_SRC } from "@/lib/estateExperienceBackgrounds";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
  /** Optional room plate override — defaults to the Writing Room. */
  backgroundUrl?: string;
};

/**
 * My Profile — full-bleed Writing Room plate behind the frosted panel.
 * Mirrors MyBusinessEstateRoomShell's contained cinematic pattern so the
 * plate stays inside ProfileDestinationHost (not viewport-fixed).
 */
export function MyProfileRoomShell({
  children,
  backgroundUrl = PROFILE_BACKGROUND_SRC,
}: Props) {
  useEffect(() => {
    preloadRoomBackground(backgroundUrl);
  }, [backgroundUrl]);

  return (
    <div
      className="my-profile-room"
      data-testid="my-profile-room"
      data-homestead-room="my-profile"
    >
      <CinematicBackground
        preset="default"
        mode="image"
        scale={1}
        position="center center"
        imageUrl={backgroundUrl}
        imageStyle={roomBackgroundImageStyle(backgroundUrl)}
        placement="absolute"
        className="my-profile-room__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="my-profile-room__scroll">{children}</div>
    </div>
  );
}
