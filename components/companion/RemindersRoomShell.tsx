"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { HomesteadRoomSignatureMotion } from "@/components/companion/homesteadRoom/HomesteadRoomSignatureMotion";
import { PLAN_MY_DAY_MORNING_BG } from "@/lib/planMyDay/morningRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
};

/**
 * Estate Reminders room — warm study backdrop, frosted workspace (shared Morning Room visual language).
 */
export function RemindersRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(PLAN_MY_DAY_MORNING_BG);
  }, []);

  return (
    <div
      className="plan-my-day-morning-room"
      data-testid="reminders-room"
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
      <div className="plan-my-day-morning-room__scroll">
        <div className="plan-my-day-morning-room__center">
          <div className="plan-my-day-morning-room__workspace plan-my-day-morning-room__workspace--room-list">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
