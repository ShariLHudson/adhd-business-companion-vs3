"use client";

import type { ReactNode } from "react";
import { EstateRoomChatChrome } from "@/components/companion/estate/EstateRoomChatChrome";
import { ChamberOfMomentumEntryPanel } from "@/components/companion/chamber/ChamberOfMomentumEntryPanel";
import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import type { ChamberInviteMemberOptions } from "@/components/companion/chamber/ChamberOfMomentumEntryPanel";

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

/** Chamber of Momentum — member gallery + compact identity + frosted estate chat. */
export function ChamberOfMomentumRoomPanel({
  onBack,
  activeMemberId,
  onInviteMember,
  onEndMemberConversation,
  thread,
  footer,
  conversationScrollKey,
}: Props) {
  return (
    <>
      <ChamberOfMomentumEntryPanel
        onBack={onBack}
        activeMemberId={activeMemberId}
        onInviteMember={onInviteMember}
        onEndMemberConversation={onEndMemberConversation}
      />
      {activeMemberId ? (
        <EstateRoomChatChrome
          roomId="chamber-of-momentum"
          thread={thread}
          footer={footer}
          conversationScrollKey={conversationScrollKey}
          panelClassName="chamber-room__chat-panel"
        />
      ) : null}
    </>
  );
}
