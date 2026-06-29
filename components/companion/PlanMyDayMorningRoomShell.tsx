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
 * Full-screen Morning Room — background is the page; workspace floats on the desk.
 */
export function PlanMyDayMorningRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(PLAN_MY_DAY_MORNING_BG);
  }, []);

  return (
    <div
      className="plan-my-day-morning-room"
      data-testid="plan-my-day-morning-room"
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
          <div className="plan-my-day-morning-room__workspace">{children}</div>
        </div>
      </div>
    </div>
  );
}
