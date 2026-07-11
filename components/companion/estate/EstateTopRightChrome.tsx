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
  chatVisible: boolean;
  soundEnabled?: boolean;
  onEstateMenuAction: (actionId: EstateMenuActionId) => void;
  onToggleChat: () => void;
  onToggleSound?: () => void;
  onBackToEstate: () => void;
  onOpenChamber?: () => void;
  onOpenEvidenceVault?: () => void;
  onOpenHallOfAccomplishments?: () => void;
  onOpenJournal?: () => void;
  onOpenCartographersStudio?: () => void;
  onOpenBreathe?: () => void;
  onOpenSoundscapes?: () => void;
  onExploreSpark?: () => void;
  backdropSurface?: "chat" | "clear-my-mind";
};

/**
 * One fixed upper-right mount — Room choices beside the member profile trigger.
 * Prevents duplicate or overlapping fixed-position chrome.
 */
export function EstateTopRightChrome({
  showProfile,
  showRoom,
  roomId,
  chatVisible,
  soundEnabled,
  onEstateMenuAction,
  onToggleChat,
  onToggleSound,
  onBackToEstate,
  onOpenChamber,
  onOpenEvidenceVault,
  onOpenHallOfAccomplishments,
  onOpenJournal,
  onOpenCartographersStudio,
  onOpenBreathe,
  onOpenSoundscapes,
  onExploreSpark,
  backdropSurface,
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
          chatVisible={chatVisible}
          soundEnabled={soundEnabled}
          onToggleChat={onToggleChat}
          onToggleSound={onToggleSound}
          onBackToEstate={onBackToEstate}
          onOpenChamber={onOpenChamber}
          onOpenEvidenceVault={onOpenEvidenceVault}
          onOpenHallOfAccomplishments={onOpenHallOfAccomplishments}
          onOpenJournal={onOpenJournal}
          onOpenCartographersStudio={onOpenCartographersStudio}
          onOpenBreathe={onOpenBreathe}
          onOpenSoundscapes={onOpenSoundscapes}
          onExploreSpark={onExploreSpark}
          backdropSurface={backdropSurface}
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
