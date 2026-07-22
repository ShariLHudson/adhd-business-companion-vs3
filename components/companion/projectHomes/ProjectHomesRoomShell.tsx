"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { PROJECTS_BACKGROUND_SRC } from "@/lib/estateExperienceBackgrounds";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import "@/app/companion/create-projects-atmosphere.css";

type Props = {
  backgroundUrl: string;
  children: ReactNode;
};

/** Scene shell for Project Homes prototype — existing Estate artwork only. */
export function ProjectHomesRoomShell({ backgroundUrl, children }: Props) {
  useEffect(() => {
    preloadRoomBackground(backgroundUrl);
  }, [backgroundUrl]);

  const isProjectsPlate = backgroundUrl === PROJECTS_BACKGROUND_SRC;

  return (
    <div
      className={[
        "project-homes-prototype",
        "estate-atmosphere",
        isProjectsPlate
          ? "estate-atmosphere--projects"
          : "estate-atmosphere--project-home",
      ].join(" ")}
      data-testid="project-homes-prototype"
      data-exclusive-destination="project-homes"
      data-estate-atmosphere={isProjectsPlate ? "projects" : "project-home"}
    >
      <CinematicBackground
        preset="default"
        mode="image"
        imageUrl={backgroundUrl}
        imageStyle={roomBackgroundImageStyle(backgroundUrl)}
        placement="fixed"
        className="project-homes-prototype__cinematic estate-atmosphere__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="project-homes-prototype__scroll">{children}</div>
    </div>
  );
}
