"use client";

import { useCallback, useEffect, useState } from "react";
import { EstateHowToGuide } from "@/components/companion/EstateHowToGuide";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowPanelBackButton } from "@/components/companion/GrowPanelBackButton";
import { ChamberActiveMemberCard } from "@/components/companion/chamber/ChamberActiveMemberCard";
import { ChamberMemberGallery } from "@/components/companion/chamber/ChamberMemberGallery";
import { ChamberPerspectiveGuide } from "@/components/companion/chamber/ChamberPerspectiveGuide";
import { ChamberOfMomentumRoomShell } from "@/components/companion/chamber/ChamberOfMomentumRoomShell";
import {
  getChamberMemberById,
  type ChamberMember,
  type ChamberMemberId,
} from "@/lib/chamber/chamberMemberRegistry";
import {
  CHAMBER_HOW_TO_GUIDE,
  consumePendingEstateHowToGuide,
  subscribeEstateHowToGuideOpen,
} from "@/lib/estateRoomGuides";
import "@/app/companion/chamber-of-momentum.css";
import "@/app/companion/chamber-member-gallery.css";
import "@/app/companion/estate-how-to-guide.css";

export type ChamberInviteMemberOptions = {
  addToConversation?: boolean;
};

type Props = {
  onBack: () => void;
  activeMemberId: ChamberMemberId | null;
  onInviteMember: (
    memberId: ChamberMemberId,
    opts?: ChamberInviteMemberOptions,
  ) => void;
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
  const [howToOpen, setHowToOpen] = useState(false);
  const [browseAllMembers, setBrowseAllMembers] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  const openHowTo = useCallback(() => setHowToOpen(true), []);
  const closeHowTo = useCallback(() => setHowToOpen(false), []);

  useEffect(() => {
    if (!activeMemberId) {
      setAddingMember(false);
    }
  }, [activeMemberId]);

  useEffect(() => {
    if (consumePendingEstateHowToGuide("chamber-of-momentum")) {
      setHowToOpen(true);
    }
    return subscribeEstateHowToGuideOpen("chamber-of-momentum", openHowTo);
  }, [openHowTo]);

  function handleTalkWithMember(memberId: ChamberMemberId) {
    const addToConversation = addingMember && Boolean(activeMemberId);
    setAddingMember(false);
    onInviteMember(memberId, addToConversation ? { addToConversation: true } : undefined);
  }

  return (
    <ChamberOfMomentumRoomShell>
      <EstateWorkspace
        stageClassName="chamber-entry--members"
        className={[
          "chamber-entry chamber-entry--members grow-room-panel chamber-entry--how-to-host",
          activeMember ? "chamber-entry--conversation" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {!activeMember ? (
          <GrowPanelBackButton onBack={onBack} label="Estate" />
        ) : null}
        {activeMember ? (
          <>
            <ChamberActiveMemberCard
              member={activeMember}
              onEndConversation={() => {
                setAddingMember(false);
                onEndMemberConversation();
              }}
              onInviteAnother={() => setAddingMember((prev) => !prev)}
              invitingAnother={addingMember}
            />
            {addingMember ? (
              <div
                className="chamber-entry__add-member"
                data-testid="chamber-add-member-gallery"
              >
                <p className="chamber-entry__add-member-note">
                  Choose who to bring into this conversation. Your current
                  thread stays.
                </p>
                <ChamberMemberGallery
                  activeMemberId={activeMemberId}
                  onTalkWithMember={handleTalkWithMember}
                  howToOpen={howToOpen}
                  onOpenHowTo={openHowTo}
                />
              </div>
            ) : null}
          </>
        ) : browseAllMembers ? (
          <ChamberMemberGallery
            activeMemberId={activeMemberId}
            onTalkWithMember={handleTalkWithMember}
            howToOpen={howToOpen}
            onOpenHowTo={openHowTo}
          />
        ) : (
          <ChamberPerspectiveGuide
            onTalkWithMember={handleTalkWithMember}
            onBrowseAll={() => setBrowseAllMembers(true)}
          />
        )}
        <EstateHowToGuide
          content={CHAMBER_HOW_TO_GUIDE}
          open={howToOpen}
          onClose={closeHowTo}
          onPrimaryAction={() => {
            closeHowTo();
            if (activeMember) {
              setAddingMember(false);
              onEndMemberConversation();
            }
            window.setTimeout(() => {
              const grid = document.querySelector(
                '[data-testid="chamber-member-gallery-grid"]',
              );
              if (grid instanceof HTMLElement) {
                grid.scrollIntoView({ behavior: "smooth", block: "start" });
                grid.focus();
              }
            }, 0);
          }}
        />
      </EstateWorkspace>
    </ChamberOfMomentumRoomShell>
  );
}
