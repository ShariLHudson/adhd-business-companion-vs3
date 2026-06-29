"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { GROWTH_ROOM_BG } from "@/lib/growth/growthRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
  /** Landing uses a narrower centered frosted card. */
  landing?: boolean;
  /** Capture room — compact upper workspace, pond visible below. */
  capture?: boolean;
  /** Writing focus — soften pond motion and scene. */
  reflecting?: boolean;
};

/** Full-screen Growth sanctuary — pond bench, quiet life, frosted workspace. */
export function GrowthRoomShell({ children, landing, capture, reflecting }: Props) {
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    preloadRoomBackground(GROWTH_ROOM_BG);
    const frame = requestAnimationFrame(() => setArrived(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`growth-room${arrived ? " growth-room--arrived" : ""}${landing ? " growth-room--landing" : ""}${capture ? " growth-room--capture" : ""}${reflecting ? " growth-room--reflecting" : ""}`}
      data-testid="growth-room"
      data-homestead-room="growth"
    >
      <div className="growth-room__life" aria-hidden="true">
        <span className="growth-room__bench-glow" />
        <span className="growth-room__life-shimmer" />
        <span className="growth-room__life-butterfly growth-room__life-butterfly--a" />
        <span className="growth-room__life-butterfly growth-room__life-butterfly--b" />
        <span className="growth-room__life-butterfly growth-room__life-butterfly--bench" />
        <span className="growth-room__life-dragonfly" />
        <span className="growth-room__life-leaf growth-room__life-leaf--a" />
        <span className="growth-room__life-leaf growth-room__life-leaf--b" />
        <span className="growth-room__life-ripple growth-room__life-ripple--a" />
        <span className="growth-room__life-ripple growth-room__life-ripple--b" />
      </div>
      <CinematicBackground
        preset="growth"
        mode="image"
        imageStyle={roomBackgroundImageStyle(GROWTH_ROOM_BG)}
        placement="fixed"
        className="growth-room__cinematic"
      />
      <div className="growth-room__scroll">
        <div className="growth-room__center">
          <div className="growth-room__workspace">{children}</div>
        </div>
      </div>
    </div>
  );
}
