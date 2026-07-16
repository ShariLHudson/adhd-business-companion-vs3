"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import {
  SPIN_WHEEL_DECISION_ROOM_BG,
  SPIN_WHEEL_DECISION_ROOM_FALLBACK_BG,
} from "@/lib/spinWheel/decisionRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import "@/app/companion/spin-wheel-decision-room.css";

type Props = {
  children: ReactNode;
};

/**
 * Estate Decision Room — library atmosphere for Spin the Wheel.
 */
export function SpinWheelDecisionRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(SPIN_WHEEL_DECISION_ROOM_BG);
    preloadRoomBackground(SPIN_WHEEL_DECISION_ROOM_FALLBACK_BG);
  }, []);

  return (
    <div
      className="spin-wheel-decision-room"
      data-testid="spin-wheel-decision-room"
      data-homestead-room="study"
    >
      <CinematicBackground
        preset="plan-my-day"
        mode="image"
        imageStyle={roomBackgroundImageStyle(SPIN_WHEEL_DECISION_ROOM_BG)}
        placement="fixed"
        className="spin-wheel-decision-room__cinematic"
      />
      <div
        className="estate-light-glow estate-light-glow--fireplace spin-wheel-decision-room__hearth"
        data-estate-light="fireplace"
        aria-hidden="true"
      />
      <div className="spin-wheel-decision-room__scroll">
        <div className="spin-wheel-decision-room__center">
          <div className="spin-wheel-decision-room__workspace">{children}</div>
        </div>
      </div>
    </div>
  );
}
