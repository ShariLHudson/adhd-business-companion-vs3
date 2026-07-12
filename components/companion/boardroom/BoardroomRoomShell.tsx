"use client";

import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { useChatBackdropRevision } from "@/lib/chatBackdrop";
import { BOARDROOM_ROOM_BG } from "@/lib/boardroom";
import { resolveEstateRoomBackgroundImage } from "@/lib/estate/estateRoomBackground";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
};

/** Round Table Boardroom — permanent boardroom scene behind the experience. */
export function BoardroomRoomShell({ children }: Props) {
  const backdropRevision = useChatBackdropRevision();
  const imageUrl = useMemo(() => {
    void backdropRevision;
    return (
      resolveEstateRoomBackgroundImage("round-table") ?? BOARDROOM_ROOM_BG
    );
  }, [backdropRevision]);

  useEffect(() => {
    preloadRoomBackground(imageUrl);
  }, [imageUrl]);

  return (
    <div
      className="boardroom-room"
      data-testid="round-table-boardroom"
      data-homestead-room="round-table"
    >
      <CinematicBackground
        preset="round-table"
        mode="image"
        imageUrl={imageUrl}
        imageStyle={roomBackgroundImageStyle(imageUrl)}
        placement="fixed"
        className="boardroom-room__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="boardroom-room__scroll">{children}</div>
    </div>
  );
}
