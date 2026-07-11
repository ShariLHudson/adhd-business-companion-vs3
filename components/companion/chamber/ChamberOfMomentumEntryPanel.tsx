"use client";

import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowPanelBackButton } from "@/components/companion/GrowPanelBackButton";
import { ChamberActiveMemberCard } from "@/components/companion/chamber/ChamberActiveMemberCard";
import { ChamberMemberGallery } from "@/components/companion/chamber/ChamberMemberGallery";
import { ChamberOfMomentumRoomShell } from "@/components/companion/chamber/ChamberOfMomentumRoomShell";
import {
  getChamberMemberById,
  type ChamberMember,
  type ChamberMemberId,
} from "@/lib/chamber/chamberMemberRegistry";
import "@/app/companion/chamber-of-momentum.css";
import "@/app/companion/chamber-member-gallery.css";

type Props = {
  onBack: () => void;
  activeMemberId: ChamberMemberId | null;
  onInviteMember: (memberId: ChamberMemberId) => void;
  onEndMemberConversation: () => void;
};

/** Chamber of Momentum — gallery browse with compact active-member identity during chat. */
export function ChamberOfMomentumEntryPanel({
  onBack,
  activeMemberId,
  onInviteMember,
  onEndMemberConversation,
}: Props) {
  const activeMember: ChamberMember | null = activeMemberId
    ? getChamberMemberById(activeMemberId) ?? null
    : null;

  return (
    <ChamberOfMomentumRoomShell>
      <EstateWorkspace
        className={[
          "chamber-entry chamber-entry--members grow-room-panel",
          activeMember ? "chamber-entry--conversation" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {!activeMember ? (
          <GrowPanelBackButton onBack={onBack} label="Estate" />
        ) : null}
        {activeMember ? (
          <ChamberActiveMemberCard
            member={activeMember}
            onEndConversation={onEndMemberConversation}
          />
        ) : (
          <ChamberMemberGallery
            activeMemberId={activeMemberId}
            onTalkWithMember={onInviteMember}
          />
        )}
      </EstateWorkspace>
    </ChamberOfMomentumRoomShell>
  );
}
