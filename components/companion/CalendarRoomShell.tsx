"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { HomesteadRoomSignatureMotion } from "@/components/companion/homesteadRoom/HomesteadRoomSignatureMotion";
import { PLAN_MY_DAY_MORNING_BG } from "@/lib/planMyDay/morningRoom";
import { handleMorningRoomOutsideClick } from "@/lib/planMyDay/morningRoomOutsideDismiss";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
  /** Click the photo / padding outside the frosted workspace to leave. */
  onOutsideDismiss?: () => void;
};

/**
 * Estate Calendar room — warm study backdrop, frosted workspace (shared Morning Room visual language).
 */
export function CalendarRoomShell({ children, onOutsideDismiss }: Props) {
  useEffect(() => {
    preloadRoomBackground(PLAN_MY_DAY_MORNING_BG);
  }, []);

  return (
    <div
      className="plan-my-day-morning-room h-full min-h-0"
      data-testid="calendar-room"
      data-homestead-room="study"
    >
      <CinematicBackground
        preset="plan-my-day"
        mode="image"
        imageStyle={roomBackgroundImageStyle(PLAN_MY_DAY_MORNING_BG)}
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
      >
        <div className="plan-my-day-morning-room__center">
          <div
            className="plan-my-day-morning-room__workspace plan-my-day-morning-room__workspace--room-list"
            data-morning-room-workspace
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
