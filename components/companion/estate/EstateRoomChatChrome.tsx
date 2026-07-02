"use client";

import type { ReactNode, RefObject } from "react";
import { WelcomeHomeFrostedChatPanel } from "@/components/companion/WelcomeHomeFrostedChatPanel";
import { EstateRoomAmbienceToggle } from "@/components/companion/estate/EstateRoomAmbienceToggle";

type Props = {
  roomId: string;
  thread: ReactNode;
  footer: ReactNode;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
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
  inputRef,
  panelClassName,
  welcomeMessage,
  showWelcomeLine = false,
  welcomeSlot,
  conversationScrollKey,
}: Props) {
  return (
    <>
      <EstateRoomAmbienceToggle roomId={roomId} />
      <WelcomeHomeFrostedChatPanel
        estateRoom
        welcomeMessage={welcomeMessage}
        welcomeSlot={welcomeSlot}
        showWelcomeLine={showWelcomeLine}
        showConversation
        alwaysShowInput
        thread={thread}
        footer={footer}
        inputRef={inputRef}
        panelClassName={panelClassName}
        conversationScrollKey={conversationScrollKey}
      />
    </>
  );
}
