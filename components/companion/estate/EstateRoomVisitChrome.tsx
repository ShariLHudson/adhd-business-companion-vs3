"use client";

import type { ReactNode } from "react";
import { EstateRoomInvitationPanel } from "@/components/companion/estate/EstateRoomInvitationPanel";import { EstateRoomTemplateArrival } from "@/components/companion/estate/EstateRoomTemplateArrival";
import { useEstateRoomVisitPhase } from "@/components/companion/estate/useEstateRoomVisitPhase";
import { WelcomeHomeFrostedChatPanel } from "@/components/companion/WelcomeHomeFrostedChatPanel";
import {
  estateInvitationKeepsInConversation,
  resolveEstateRoomInvitationSet,
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
    if (item.action.kind === "presence") {
      onInvitationSelect(item);
      return;
    }
    if (estateInvitationKeepsInConversation(item.action)) {
      visit.openConversation();
      if (item.action.kind === "conversation") {
        onConversationStart?.(roomId);
        return;
      }
      onInvitationSelect(item);
      return;
    }    visit.openActivity();
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
      <WelcomeHomeFrostedChatPanel        estateRoom
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
