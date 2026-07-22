"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { HomesteadRoomSignatureMotion } from "@/components/companion/homesteadRoom/HomesteadRoomSignatureMotion";
import { CREATE_BACKGROUND_SRC } from "@/lib/estateExperienceBackgrounds";
import { handleMorningRoomOutsideClick } from "@/lib/planMyDay/morningRoomOutsideDismiss";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import "@/app/companion/create-projects-atmosphere.css";

type Props = {
  children: ReactNode;
  onOutsideDismiss?: () => void;
};

/**
 * Create estate room — Creative Studio backdrop, frosted workspace.
 * Scroll contract (global Create rule): one flex-bounded scrollport
 * (`create-estate-shared-scroll`) — never clip; no nested max-height trap.
 */
export function CreateEstateRoomShell({
  children,
  onOutsideDismiss,
}: Props) {
  useEffect(() => {
    preloadRoomBackground(CREATE_BACKGROUND_SRC);
  }, []);

  return (
    <div
      className="plan-my-day-morning-room h-full min-h-0 estate-atmosphere estate-atmosphere--create"
      data-testid="create-estate-room"
      data-homestead-room="creative-studio"
      data-estate-atmosphere="create"
    >
      <CinematicBackground
        preset="plan-my-day"
        mode="image"
        imageUrl={CREATE_BACKGROUND_SRC}
        imageStyle={roomBackgroundImageStyle(CREATE_BACKGROUND_SRC)}
        placement="fixed"
        className="plan-my-day-morning-room__cinematic estate-atmosphere__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <HomesteadRoomSignatureMotion roomId="study" />
      <div
        className="plan-my-day-morning-room__scroll"
        role="presentation"
        title={
          onOutsideDismiss
            ? "Click outside the panel to go back"
            : undefined
        }
        onClick={(e) => handleMorningRoomOutsideClick(e, onOutsideDismiss)}
        data-testid="create-estate-shared-scroll"
        data-create-estate-shared-scroll="true"
      >
        <div className="plan-my-day-morning-room__center">
          <div
            className="plan-my-day-morning-room__workspace plan-my-day-morning-room__workspace--room-list"
            data-morning-room-workspace
            data-testid="create-estate-workspace"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
