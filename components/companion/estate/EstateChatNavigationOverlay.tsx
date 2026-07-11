"use client";

import type { ReactNode, RefObject } from "react";
import { SparkEstateShell } from "@/components/companion/estate/SparkEstateShell";
import type { EstateRoomInvitationItem } from "@/lib/estate/estateRoomInvitation";
import type { AppSection } from "@/lib/companionUi";

type Props = {
  section: AppSection;
  roomId: string;
  thread: ReactNode;
  footer: ReactNode;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  conversationScrollKey?: string | number;
  activityEngaged?: boolean;
  conversationStarted?: boolean;
  onInvitationSelect: (item: EstateRoomInvitationItem) => void;
  onConversationStart?: (roomId: string) => void;
};

/**
 * @deprecated Phase D.1 — delegates to SparkEstateShell
 */
export function EstateChatNavigationOverlay(props: Props) {
  const { roomId, section, ...rest } = props;
  return <SparkEstateShell placeId={roomId} section={section} {...rest} />;
}
