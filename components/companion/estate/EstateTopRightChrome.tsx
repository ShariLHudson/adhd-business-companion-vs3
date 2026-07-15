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
  onExploreSpark?: () => void;
  onReturnToExploreEstate?: () => void;
  onOpenPlanMyDay?: () => void;
  onOpenRhythms?: () => void;
  onOpenReminders?: () => void;
  onOpenCalendar?: () => void;
  onOpenProjects?: () => void;
  onOpenCreateStudio?: () => void;
  onOpenClearMyMind?: () => void;
  onOpenParkingLot?: () => void;
  onOpenSpinTheWheel?: () => void;
  onOpenDestinationGallery?: () => void;
  onOpenCartographersStudio?: () => void;
  onOpenJournal?: () => void;
  onOpenEvidenceVault?: () => void;
  onOpenHallOfAccomplishments?: () => void;
  onOpenChamber?: () => void;
  onOpenBoardroom?: () => void;
  onOpenBreathe?: () => void;
  onOpenPeacefulPlaces?: () => void;
  onOpenSoundscapes?: () => void;
  backdropSurface?: "chat" | "clear-my-mind";
};

/**
 * One fixed upper-right mount — Welcome Home beside the member profile trigger.
 * Experience Controls open from the SH profile menu, not the room menu.
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
  onExploreSpark,
  onReturnToExploreEstate,
  onOpenPlanMyDay,
  onOpenRhythms,
  onOpenReminders,
  onOpenCalendar,
  onOpenProjects,
  onOpenCreateStudio,
  onOpenClearMyMind,
  onOpenParkingLot,
  onOpenSpinTheWheel,
  onOpenDestinationGallery,
  onOpenCartographersStudio,
  onOpenJournal,
  onOpenEvidenceVault,
  onOpenHallOfAccomplishments,
  onOpenChamber,
  onOpenBoardroom,
  onOpenBreathe,
  onOpenPeacefulPlaces,
  onOpenSoundscapes,
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
          onExploreSpark={onExploreSpark}
          onReturnToExploreEstate={onReturnToExploreEstate}
          onOpenPlanMyDay={onOpenPlanMyDay}
          onOpenRhythms={onOpenRhythms}
          onOpenReminders={onOpenReminders}
          onOpenCalendar={onOpenCalendar}
          onOpenProjects={onOpenProjects}
          onOpenCreateStudio={onOpenCreateStudio}
          onOpenClearMyMind={onOpenClearMyMind}
          onOpenParkingLot={onOpenParkingLot}
          onOpenSpinTheWheel={onOpenSpinTheWheel}
          onOpenDestinationGallery={onOpenDestinationGallery}
          onOpenCartographersStudio={onOpenCartographersStudio}
          onOpenJournal={onOpenJournal}
          onOpenEvidenceVault={onOpenEvidenceVault}
          onOpenHallOfAccomplishments={onOpenHallOfAccomplishments}
          onOpenChamber={onOpenChamber}
          onOpenBoardroom={onOpenBoardroom}
          onOpenBreathe={onOpenBreathe}
          onOpenPeacefulPlaces={onOpenPeacefulPlaces}
          onOpenSoundscapes={onOpenSoundscapes}
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
