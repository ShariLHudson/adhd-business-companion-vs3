"use client";

import { useMemo, type ReactNode } from "react";
import { EstateRoomFullBleedBackground } from "@/components/companion/estate/EstateRoomFullBleedBackground";
import { useChatBackdropRevision } from "@/lib/chatBackdrop";
import { resolveRoomFullBleedBackground } from "@/lib/estate/resolveRoomFullBleedBackground";
import { MOMENTUM_INSTITUTE_ROOM_BG } from "@/lib/momentumInstitute/room/instituteRoomRegistry";

type Props = {
  children: ReactNode;
};

/** Full-viewport Momentum Institute — drawer wall visible behind frosted conversation. */
export function MomentumInstituteRoomShell({ children }: Props) {
  const backdropRevision = useChatBackdropRevision();
  const backgroundImageUrl = useMemo(() => {
    void backdropRevision;
    return resolveRoomFullBleedBackground("momentum-institute", {
      backgroundId: "momentum-institute",
      imageUrl: MOMENTUM_INSTITUTE_ROOM_BG,
    }).imageUrl;
  }, [backdropRevision]);

  return (
    <div
      className="momentum-institute-room"
      data-testid="momentum-institute-room"
      data-homestead-room="momentum-institute"
    >
      <EstateRoomFullBleedBackground
        roomId="momentum-institute"
        imageUrl={backgroundImageUrl}
        className="momentum-institute-room__fullbleed"
      />
      <div className="momentum-institute-room__vignette" aria-hidden />
      <div className="momentum-institute-room__stage">{children}</div>
    </div>
  );
}
