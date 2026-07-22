"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { CREATE_BACKGROUND_SRC } from "@/lib/estateExperienceBackgrounds";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import "@/app/companion/creative-studio-room.css";
import "@/app/companion/create-projects-atmosphere.css";

type Props = {
  children: ReactNode;
};

/** Full-screen Create — art-studio-background fills the viewport. */
export function CreativeStudioRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(CREATE_BACKGROUND_SRC);
  }, []);

  return (
    <div
      className="creative-studio-room estate-atmosphere estate-atmosphere--create"
      data-testid="creative-studio-room"
      data-homestead-room="creative-studio"
      data-estate-atmosphere="create"
    >
      <CinematicBackground
        preset="creative-studio"
        mode="image"
        scale={1}
        position="center center"
        imageUrl={CREATE_BACKGROUND_SRC}
        imageStyle={roomBackgroundImageStyle(CREATE_BACKGROUND_SRC)}
        placement="absolute"
        className="creative-studio-room__cinematic estate-atmosphere__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="creative-studio-room__scroll">{children}</div>
    </div>
  );
}
