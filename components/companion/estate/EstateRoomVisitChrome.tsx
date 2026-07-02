"use client";

import type { ReactNode } from "react";
import { EstateRoomAmbienceToggle } from "@/components/companion/estate/EstateRoomAmbienceToggle";
import { EstateRoomInvitationPanel } from "@/components/companion/estate/EstateRoomInvitationPanel";
import { EstateRoomTemplateArrival } from "@/components/companion/estate/EstateRoomTemplateArrival";
import { useEstateRoomVisitPhase } from "@/components/companion/estate/useEstateRoomVisitPhase";
import { WelcomeHomeFrostedChatPanel } from "@/components/companion/WelcomeHomeFrostedChatPanel";
import {
  resolveEstateRoomInvitationSet,
  resolveEstateRoomInvitations,
  type EstateRoomInvitationItem,
} from "@/lib/estate/estateRoomInvitation";
import { shouldSuppressEstateInvitationGrid } from "@/lib/estate/estateChromePolicy";

type Props = {
  roomId: string;
  thread: ReactNode;
  footer: ReactNode;
  panelClassName?: string;
  conversationScrollKey?: string | number;
  onInvitationSelect: (item: EstateRoomInvitationItem) => void;
  onConversationStart?: (roomId: string) => void;
  activityEngaged?: boolean;
  /** Member typed or chose talk — show conversation instead of invitation */
  conversationStarted?: boolean;
  /** Phase E — Living Places: no invitation grid or arrival plaque */
  livingPlaceMode?: boolean;
};

/**
 * Arrival Before Activity™ — one frosted chat surface; invitation then conversation.
 * Member chooses when ready — never auto-skip invitation on input focus.
 */
export function EstateRoomVisitChrome({
  roomId,
  thread,
  footer,
  panelClassName,
  conversationScrollKey,
  onInvitationSelect,
  onConversationStart,
  activityEngaged = false,
  conversationStarted = false,
  livingPlaceMode: livingPlaceModeProp,
}: Props) {
  const livingPlaceMode =
    livingPlaceModeProp ?? shouldSuppressEstateInvitationGrid(roomId);
  const visit = useEstateRoomVisitPhase(roomId, {
    skipInvitation: livingPlaceMode,
  });
  const invitation = resolveEstateRoomInvitationSet(roomId);

  const handleInvitation = (item: EstateRoomInvitationItem) => {
    if (item.action.kind === "conversation" || item.action.kind === "presence") {
      visit.openConversation();
      onConversationStart?.(roomId);
      return;
    }
    visit.openActivity();
    onInvitationSelect(item);
  };

  const showInvitation =
    !livingPlaceMode &&
    visit.showInvitation &&
    !activityEngaged &&
    !visit.showConversation &&
    !conversationStarted;

  return (
    <>
      <EstateRoomAmbienceToggle roomId={roomId} />
      <WelcomeHomeFrostedChatPanel
        estateRoom
        alwaysShowInput
        showWelcomeLine={showInvitation}
        showConversation={
          livingPlaceMode ||
          (!showInvitation &&
            (visit.showConversation || activityEngaged || conversationStarted))
        }
        welcomeSlot={
          showInvitation ? (
            <>
              <EstateRoomTemplateArrival roomId={roomId} />
              <EstateRoomInvitationPanel
                embedded
                invitation={invitation}
                onSelect={handleInvitation}
              />
            </>
          ) : undefined
        }
        thread={thread}
        footer={footer}
        panelClassName={panelClassName}
        conversationScrollKey={conversationScrollKey}
      />
    </>
  );
}
