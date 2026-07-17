"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { HomesteadRoomSignatureMotion } from "@/components/companion/homesteadRoom/HomesteadRoomSignatureMotion";
import { CREATIVE_STUDIO_ROOM_BG } from "@/lib/creativeStudio/creativeStudioRoom";
import { handleMorningRoomOutsideClick } from "@/lib/planMyDay/morningRoomOutsideDismiss";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
  onOutsideDismiss?: () => void;
};

/**
 * Create estate room — Creative Studio backdrop, frosted workspace.
 * Same scroll/dismiss contract as Plan My Day / Strategy Library.
 */
export function CreateEstateRoomShell({
  children,
  onOutsideDismiss,
}: Props) {
  useEffect(() => {
    preloadRoomBackground(CREATIVE_STUDIO_ROOM_BG);
  }, []);

  return (
    <div
      className="plan-my-day-morning-room h-full min-h-0"
      data-testid="create-estate-room"
      data-homestead-room="creative-studio"
    >
      <CinematicBackground
        preset="plan-my-day"
        mode="image"
        imageStyle={roomBackgroundImageStyle(CREATIVE_STUDIO_ROOM_BG)}
        placement="fixed"
        className="plan-my-day-morning-room__cinematic"
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
