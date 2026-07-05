"use client";

import type { ReactNode } from "react";
import { WelcomeHomeFrostedChatPanel } from "@/components/companion/WelcomeHomeFrostedChatPanel";
type Props = {
  roomId: string;
  thread: ReactNode;
  footer: ReactNode;
  panelClassName?: string;
  /** Orientation line — e.g. after chat navigation */
  welcomeMessage?: string;
  showWelcomeLine?: boolean;
  welcomeSlot?: ReactNode;
  conversationScrollKey?: string | number;
};

/**
 * Standard estate room conversation surface — frosted chat + room sound toggle.
 */
export function EstateRoomChatChrome({
  roomId,
  thread,
  footer,
  panelClassName,
  welcomeMessage,
  showWelcomeLine = false,
  welcomeSlot,
  conversationScrollKey,
}: Props) {
  return (
    <>
      <WelcomeHomeFrostedChatPanel        estateRoom
        welcomeMessage={welcomeMessage}
        welcomeSlot={welcomeSlot}
        showWelcomeLine={showWelcomeLine}
        showConversation
        alwaysShowInput
        thread={thread}
        footer={footer}
        panelClassName={panelClassName}
        conversationScrollKey={conversationScrollKey}
      />
    </>
  );
}
