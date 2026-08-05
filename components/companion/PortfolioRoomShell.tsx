"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { EstateRoomFullBleedBackground } from "@/components/companion/estate/EstateRoomFullBleedBackground";
import { useChatBackdropRevision } from "@/lib/chatBackdrop";
import { PORTFOLIO_ROOM_BG } from "@/lib/growth/growthRoom";
import { resolveRoomFullBleedBackground } from "@/lib/estate/resolveRoomFullBleedBackground";
import { preferredBackgroundPreloadUrl } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import "@/app/companion/grow-room.css";

type Props = {
  children: ReactNode;
};

/** Portfolio — portfolio room plate, full-bleed cover. */
export function PortfolioRoomShell({ children }: Props) {
  const backdropRevision = useChatBackdropRevision();
  const backgroundImageUrl = useMemo(() => {
    void backdropRevision;
    return resolveRoomFullBleedBackground("portfolio", {
      backgroundId: "portfolio",
      imageUrl: PORTFOLIO_ROOM_BG,
    }).imageUrl;
  }, [backdropRevision]);

  useEffect(() => {
    preloadRoomBackground(preferredBackgroundPreloadUrl(backgroundImageUrl));
  }, [backgroundImageUrl]);

  return (
    <div
      className="portfolio-room"
      data-testid="portfolio-room"
      data-homestead-room="growth-portfolio"
    >
      <EstateRoomFullBleedBackground
        roomId="portfolio"
        imageUrl={backgroundImageUrl}
        className="portfolio-room__plate"
      />
      <div className="portfolio-room__scroll">{children}</div>
    </div>
  );
}
