"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GlobalEstateMenu } from "@/components/companion/GlobalEstateMenu";
import { EstateRoomExperienceMenu } from "@/components/companion/estate/EstateRoomExperienceMenu";
import { GlobalSoundControl } from "@/components/companion/estate/GlobalSoundControl";
import { LayeredAudioMixerPanel } from "@/components/companion/layeredAudio/LayeredAudioMixerPanel";
import type { EstateMenuActionId } from "@/lib/estateMenu";
import type { WelcomeHomeNavDestinationId } from "@/lib/estate/welcomeHomeNavigationStructure";

export type EstateTopRightChromeProps = {
  showProfile: boolean;
  showRoom: boolean;
  roomId: string | null;
  chatVisible: boolean;
  /**
   * Home/arrival reachability: when true, the canonical GlobalSoundControl
   * renders even if the full chrome (room / profile menu) is not shown, so sound
   * is reachable from the authenticated home/arrival surface without first
   * opening a menu. Never set on sign-in. The rest of the chrome stays gated.
   */
  showHomeSoundControl?: boolean;
  /** Spec 129 — current Welcome Home destination for orientation highlight. */
  activeDestinationId?: WelcomeHomeNavDestinationId | null;
  soundEnabled?: boolean;
  soundPlayingHint?: boolean;
  onEstateMenuAction: (actionId: EstateMenuActionId) => void;
  onToggleChat: () => void;
  onToggleSound?: () => void;
  onOpenAudioSettings?: () => void;
  onBackToEstate: () => void;
  onExploreSpark?: () => void;
  onOpenSparkEstateGuide?: () => void;
  onReturnToExploreEstate?: () => void;
  onOpenAdaptPlanMyDay?: () => void;
  onOpenPlanMyDay?: () => void;
  onOpenAdaptMyDay?: () => void;
  onOpenRemindersRhythms?: () => void;
  onOpenRhythms?: () => void;
  onOpenReminders?: () => void;
  onOpenCalendar?: () => void;
  onOpenProjects?: () => void;
  onOpenCreateStudio?: () => void;
  onOpenClearMyMind?: () => void;
  onOpenParkingLot?: () => void;
  onOpenTalkItOut?: () => void;
  onOpenSpinTheWheel?: () => void;
  onOpenDestinationGallery?: () => void;
  onOpenCartographersStudio?: () => void;
  onOpenJournal?: () => void;
  onOpenEvidenceVault?: () => void;
  onOpenHallOfAccomplishments?: () => void;
  onOpenChamber?: () => void;
  onOpenBoardroom?: () => void;
  onOpenStrategyLibrary?: () => void;
  onOpenBreathe?: () => void;
  onOpenFocusLibrary?: () => void;
  onOpenFocusTimer?: () => void;
  onOpenTimeBlocking?: () => void;
  onOpenBodyDouble?: () => void;
  onOpenTemplates?: () => void;
  onOpenContinueWorking?: () => void;
  onOpenFocusAudio?: () => void;
  onOpenPeacefulPlaces?: () => void;
  onOpenSoundscapes?: () => void;
  backdropSurface?: "chat" | "clear-my-mind";
};

/**
 * One fixed upper-right mount — Welcome Home beside the member profile trigger.
 * Experience Controls open from the member profile menu, not the room menu.
 */
export function EstateTopRightChrome({
  showProfile,
  showRoom,
  roomId,
  chatVisible,
  showHomeSoundControl = false,
  activeDestinationId = null,
  soundEnabled,
  soundPlayingHint,
  onEstateMenuAction,
  onToggleChat,
  onToggleSound,
  onOpenAudioSettings,
  onBackToEstate,
  onExploreSpark,
  onOpenSparkEstateGuide,
  onReturnToExploreEstate,
  onOpenAdaptPlanMyDay,
  onOpenPlanMyDay,
  onOpenAdaptMyDay,
  onOpenRemindersRhythms,
  onOpenRhythms,
  onOpenReminders,
  onOpenCalendar,
  onOpenProjects,
  onOpenCreateStudio,
  onOpenClearMyMind,
  onOpenParkingLot,
  onOpenTalkItOut,
  onOpenSpinTheWheel,
  onOpenDestinationGallery,
  onOpenCartographersStudio,
  onOpenJournal,
  onOpenEvidenceVault,
  onOpenHallOfAccomplishments,
  onOpenChamber,
  onOpenBoardroom,
  onOpenStrategyLibrary,
  onOpenBreathe,
  onOpenFocusLibrary,
  onOpenFocusTimer,
  onOpenTimeBlocking,
  onOpenBodyDouble,
  onOpenTemplates,
  onOpenContinueWorking,
  onOpenFocusAudio,
  onOpenPeacefulPlaces,
  onOpenSoundscapes,
  backdropSurface,
}: EstateTopRightChromeProps) {
  const [mounted, setMounted] = useState(false);
  const [layeredMixerOpen, setLayeredMixerOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // Full chrome (room / profile menus) keeps its original gate. The canonical
  // GlobalSoundControl additionally renders standalone on the authenticated
  // home/arrival surface so sound is reachable without opening a menu. It is a
  // single instance either way — never duplicated when full chrome is visible.
  const renderFullChrome = showProfile || (showRoom && Boolean(roomId));
  const renderStandaloneSound = !renderFullChrome && showHomeSoundControl;
  if (!mounted || (!renderFullChrome && !renderStandaloneSound)) return null;

  return createPortal(
    <div
      className="estate-top-right-chrome"
      data-testid="estate-top-right-chrome"
      data-standalone-sound={renderStandaloneSound ? "true" : "false"}
    >
      <GlobalSoundControl
        soundPlayingHint={soundPlayingHint}
        onOpenAudioSettings={
          onOpenAudioSettings ??
          (() => onEstateMenuAction("experience-controls"))
        }
        onOpenPeacefulMoments={onOpenPeacefulPlaces ?? onOpenFocusAudio}
        onOpenSoundscapes={onOpenSoundscapes}
        onOpenLayeredAudioMixer={() => setLayeredMixerOpen(true)}
      />
      <LayeredAudioMixerPanel
        open={layeredMixerOpen}
        onClose={() => setLayeredMixerOpen(false)}
      />
      {showRoom && roomId ? (
        <EstateRoomExperienceMenu
          embedded
          roomId={roomId}
          chatVisible={chatVisible}
          activeDestinationId={activeDestinationId}
          soundEnabled={soundEnabled}
          onToggleChat={onToggleChat}
          onToggleSound={onToggleSound}
          onBackToEstate={onBackToEstate}
          onExploreSpark={onExploreSpark}
          onOpenSparkEstateGuide={onOpenSparkEstateGuide}
          onReturnToExploreEstate={onReturnToExploreEstate}
          onOpenAdaptPlanMyDay={onOpenAdaptPlanMyDay}
          onOpenPlanMyDay={onOpenPlanMyDay}
          onOpenAdaptMyDay={onOpenAdaptMyDay}
          onOpenRemindersRhythms={onOpenRemindersRhythms}
          onOpenRhythms={onOpenRhythms}
          onOpenReminders={onOpenReminders}
          onOpenCalendar={onOpenCalendar}
          onOpenProjects={onOpenProjects}
          onOpenCreateStudio={onOpenCreateStudio}
          onOpenClearMyMind={onOpenClearMyMind}
          onOpenParkingLot={onOpenParkingLot}
          onOpenTalkItOut={onOpenTalkItOut}
          onOpenSpinTheWheel={onOpenSpinTheWheel}
          onOpenDestinationGallery={onOpenDestinationGallery}
          onOpenCartographersStudio={onOpenCartographersStudio}
          onOpenJournal={onOpenJournal}
          onOpenEvidenceVault={onOpenEvidenceVault}
          onOpenHallOfAccomplishments={onOpenHallOfAccomplishments}
          onOpenChamber={onOpenChamber}
          onOpenBoardroom={onOpenBoardroom}
          onOpenStrategyLibrary={onOpenStrategyLibrary}
          onOpenBreathe={onOpenBreathe}
          onOpenFocusLibrary={onOpenFocusLibrary}
          onOpenFocusTimer={onOpenFocusTimer}
          onOpenTimeBlocking={onOpenTimeBlocking}
          onOpenBodyDouble={onOpenBodyDouble}
          onOpenTemplates={onOpenTemplates}
          onOpenContinueWorking={onOpenContinueWorking}
          onOpenFocusAudio={onOpenFocusAudio}
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
