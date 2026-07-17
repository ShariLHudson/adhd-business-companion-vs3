"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { HomesteadRoomSignatureMotion } from "@/components/companion/homesteadRoom/HomesteadRoomSignatureMotion";
import { STRATEGY_LIBRARY_ROOM_BG } from "@/lib/strategyLibrary/estateCopy";
import { handleMorningRoomOutsideClick } from "@/lib/planMyDay/morningRoomOutsideDismiss";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
  /** Click the photo / padding outside the frosted workspace to leave. */
  onOutsideDismiss?: () => void;
};

/**
 * Strategy Library estate room — study / conference backdrop, frosted workspace.
 * One scrollport: morning-room scroll pattern (same contract as Reminders / Plan My Day).
 */
export function StrategyLibraryRoomShell({
  children,
  onOutsideDismiss,
}: Props) {
  useEffect(() => {
    preloadRoomBackground(STRATEGY_LIBRARY_ROOM_BG);
  }, []);

  return (
    <div
      className="plan-my-day-morning-room h-full min-h-0"
      data-testid="strategy-library-room"
      data-homestead-room="strategy-library"
    >
      <CinematicBackground
        preset="plan-my-day"
        mode="image"
        imageStyle={roomBackgroundImageStyle(STRATEGY_LIBRARY_ROOM_BG)}
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
        data-testid="strategy-library-shared-scroll"
      >
        <div className="plan-my-day-morning-room__center">
          <div
            className="plan-my-day-morning-room__workspace plan-my-day-morning-room__workspace--room-list"
            data-morning-room-workspace
            data-testid="strategy-library-workspace"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
