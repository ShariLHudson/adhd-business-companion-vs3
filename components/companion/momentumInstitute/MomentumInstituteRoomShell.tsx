"use client";

import type { ReactNode } from "react";
import { EstateRoomFullBleedBackground } from "@/components/companion/estate/EstateRoomFullBleedBackground";
import { MOMENTUM_INSTITUTE_ROOM_BG } from "@/lib/momentumInstitute/room/instituteRoomRegistry";

type Props = {
  children: ReactNode;
};

/** Full-viewport Momentum Institute™ — drawer wall visible behind frosted conversation. */
export function MomentumInstituteRoomShell({ children }: Props) {
  return (
    <div
      className="momentum-institute-room"
      data-testid="momentum-institute-room"
      data-homestead-room="momentum-institute"
    >
      <EstateRoomFullBleedBackground
        roomId="momentum-institute"
        imageUrl={MOMENTUM_INSTITUTE_ROOM_BG}
        className="momentum-institute-room__fullbleed"
      />
      <div className="momentum-institute-room__vignette" aria-hidden />
      <div className="momentum-institute-room__stage">{children}</div>
    </div>
  );
}
