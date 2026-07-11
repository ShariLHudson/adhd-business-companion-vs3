"use client";

import { useEffect, type ReactNode } from "react";
import { EstateRoomFullBleedBackground } from "@/components/companion/estate/EstateRoomFullBleedBackground";
import { PORTFOLIO_ROOM_BG } from "@/lib/growth/growthRoom";
import { preferredBackgroundPreloadUrl } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import "@/app/companion/grow-room.css";

type Props = {
  children: ReactNode;
};

/** Portfolio — portfolio room plate, full-bleed cover. */
export function PortfolioRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(preferredBackgroundPreloadUrl(PORTFOLIO_ROOM_BG));
  }, []);

  return (
    <div
      className="portfolio-room"
      data-testid="portfolio-room"
      data-homestead-room="growth-portfolio"
    >
      <EstateRoomFullBleedBackground
        roomId="portfolio"
        imageUrl={PORTFOLIO_ROOM_BG}
        className="portfolio-room__plate"
      />
      <div className="portfolio-room__scroll">{children}</div>
    </div>
  );
}
