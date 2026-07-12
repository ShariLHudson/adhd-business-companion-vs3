"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  backgroundUrl: string;
  children: ReactNode;
};

/** Scene shell for Project Homes prototype — existing Estate artwork only. */
export function ProjectHomesRoomShell({ backgroundUrl, children }: Props) {
  useEffect(() => {
    preloadRoomBackground(backgroundUrl);
  }, [backgroundUrl]);

  return (
    <div
      className="project-homes-prototype"
      data-testid="project-homes-prototype"
    >
      <CinematicBackground
        preset="default"
        mode="image"
        imageUrl={backgroundUrl}
        imageStyle={roomBackgroundImageStyle(backgroundUrl)}
        placement="fixed"
        className="project-homes-prototype__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="project-homes-prototype__scroll">{children}</div>
    </div>
  );
}
