"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GlobalEstateMenu } from "@/components/companion/GlobalEstateMenu";
import { EstateRoomExperienceMenu } from "@/components/companion/estate/EstateRoomExperienceMenu";
import type { EstateMenuActionId } from "@/lib/estateMenu";

export type EstateTopRightChromeProps = {
  showProfile: boolean;
  showRoom: boolean;
  roomId: string | null;
  onEstateMenuAction: (actionId: EstateMenuActionId) => void;
  onJustBeHere: () => void;
};

/**
 * One fixed upper-right mount — Room choices beside the member profile trigger.
 * Prevents duplicate or overlapping fixed-position chrome.
 */
export function EstateTopRightChrome({
  showProfile,
  showRoom,
  roomId,
  onEstateMenuAction,
  onJustBeHere,
}: EstateTopRightChromeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const visible = showProfile || (showRoom && Boolean(roomId));
  if (!mounted || !visible) return null;

  return createPortal(
    <div className="estate-top-right-chrome" data-testid="estate-top-right-chrome">
      {showRoom && roomId ? (
        <EstateRoomExperienceMenu
          embedded
          roomId={roomId}
          onJustBeHere={onJustBeHere}
        />
      ) : null}
      {showProfile ? (
        <GlobalEstateMenu
          embedded
          variant="floating"
          onAction={onEstateMenuAction}
        />
      ) : null}
    </div>,
    document.body,
  );
}
