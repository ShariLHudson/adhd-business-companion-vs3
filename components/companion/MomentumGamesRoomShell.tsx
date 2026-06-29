"use client";

import type { ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { HomesteadRoomSignatureMotion } from "@/components/companion/homesteadRoom/HomesteadRoomSignatureMotion";
import { MOMENTUM_GAMES_ROOM_BG } from "@/lib/momentumGames/momentumGamesRoom";

type Props = {
  children: ReactNode;
};

/** Full-screen Momentum Builders room — curated resets float on the recreation scene. */
export function MomentumGamesRoomShell({ children }: Props) {
  return (
    <div
      className="momentum-games-room"
      data-testid="momentum-games-room"
      data-momentum-games-room="1"
      data-homestead-room="game-room"
    >
      <CinematicBackground
        preset="momentum-games"
        mode="image"
        imageUrl={MOMENTUM_GAMES_ROOM_BG}
        placement="fixed"
        className="momentum-games-room__cinematic"
      />
      <HomesteadRoomSignatureMotion roomId="game-room" />
      <div className="momentum-games-room__scroll">
        <div className="momentum-games-room__center">
          <div className="momentum-games-room__workspace companion-glass-panel">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
