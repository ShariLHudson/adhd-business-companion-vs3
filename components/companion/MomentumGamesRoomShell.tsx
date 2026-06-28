"use client";

import type { ReactNode } from "react";
import { MOMENTUM_GAMES_ROOM_BG } from "@/lib/momentumGames/momentumGamesRoom";

type Props = {
  children: ReactNode;
};

/** Full-screen Momentum Games room — games workspace floats on the recreation scene. */
export function MomentumGamesRoomShell({ children }: Props) {
  return (
    <div
      className="momentum-games-room"
      data-testid="momentum-games-room"
      data-momentum-games-room="1"
    >
      <div
        className="momentum-games-room__bg"
        style={{ backgroundImage: `url(${MOMENTUM_GAMES_ROOM_BG})` }}
        aria-hidden
      />
      <div className="momentum-games-room__scroll">
        <div className="momentum-games-room__center">
          <div className="momentum-games-room__workspace">{children}</div>
        </div>
      </div>
    </div>
  );
}
