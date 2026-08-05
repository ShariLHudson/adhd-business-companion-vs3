"use client";

import { useMemo, type ReactNode } from "react";
import { EstateRoomFullBleedBackground } from "@/components/companion/estate/EstateRoomFullBleedBackground";
import { useChatBackdropRevision } from "@/lib/chatBackdrop";
import { resolveRoomFullBleedBackground } from "@/lib/estate/resolveRoomFullBleedBackground";
import { STABLES_ROOM_BG } from "@/lib/stables/stablesRoomRegistry";

type Props = {
  children: ReactNode;
  /** @deprecated Home is global on all estate rooms */
  onBackHome?: () => void;
};

/** Full-viewport Stables — spark-estate-stables plate edge to edge. */
export function StablesRoomShell({ children }: Props) {
  const backdropRevision = useChatBackdropRevision();
  const backgroundImageUrl = useMemo(() => {
    void backdropRevision;
    return resolveRoomFullBleedBackground("stables", {
      backgroundId: "stables",
      imageUrl: STABLES_ROOM_BG,
    }).imageUrl;
  }, [backdropRevision]);

  return (
    <div
      className="stables-room"
      data-testid="stables-room"
      data-homestead-room="stables"
    >
      <EstateRoomFullBleedBackground
        roomId="stables"
        imageUrl={backgroundImageUrl}
        className="stables-room__fullbleed"
      />
      <div className="stables-room__vignette" aria-hidden />
      <div className="stables-room__stage">{children}</div>
    </div>
  );
}
