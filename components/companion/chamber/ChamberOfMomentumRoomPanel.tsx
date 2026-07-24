"use client";

import { useEffect, useState, type ReactNode } from "react";
import { EstateRoomChatChrome } from "@/components/companion/estate/EstateRoomChatChrome";
import { ChamberOfMomentumEntryPanel } from "@/components/companion/chamber/ChamberOfMomentumEntryPanel";
import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import type { ChamberInviteMemberOptions } from "@/components/companion/chamber/ChamberOfMomentumEntryPanel";
import {
  shouldShowChamberChat,
  type ChamberViewMode,
} from "@/lib/chamber/chamberViewMode";

type Props = {
  onBack: () => void;
  activeMemberId: ChamberMemberId | null;
  onInviteMember: (
    memberId: ChamberMemberId,
    opts?: ChamberInviteMemberOptions,
  ) => void;
  onEndMemberConversation: () => void;
  thread: ReactNode;
  footer: ReactNode;
  conversationScrollKey?: string | number;
};

/** Chamber of Momentum — one primary layer: gallery, member profile, or member chat. */
export function ChamberOfMomentumRoomPanel({
  onBack,
  activeMemberId,
  onInviteMember,
  onEndMemberConversation,
  thread,
  footer,
  conversationScrollKey,
}: Props) {
  const [viewMode, setViewMode] = useState<ChamberViewMode>(() =>
    activeMemberId ? "member_chat" : "gallery",
  );

  useEffect(() => {
    if (!activeMemberId) {
      setViewMode((prev) => (prev === "member_chat" ? "gallery" : prev));
      return;
    }
    setViewMode((prev) => (prev === "gallery" ? "member_chat" : prev));
  }, [activeMemberId]);

  const showChat = shouldShowChamberChat(viewMode, activeMemberId);

  return (
    <div
      className="chamber-room"
      data-testid="chamber-of-momentum-room"
      data-chamber-view={viewMode}
    >
      <ChamberOfMomentumEntryPanel
        onBack={onBack}
        activeMemberId={activeMemberId}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onInviteMember={onInviteMember}
        onEndMemberConversation={onEndMemberConversation}
      />
      {showChat ? (
        <EstateRoomChatChrome
          roomId="chamber-of-momentum"
          thread={thread}
          footer={footer}
          conversationScrollKey={conversationScrollKey}
          panelClassName="chamber-room__chat-panel"
        />
      ) : null}
    </div>
  );
}
