"use client";

import { useCallback, useEffect, useState } from "react";
import { EstateHowToGuide } from "@/components/companion/EstateHowToGuide";
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
import {
  CHAMBER_HOW_TO_GUIDE,
  consumePendingEstateHowToGuide,
  subscribeEstateHowToGuideOpen,
} from "@/lib/estateRoomGuides";
import "@/app/companion/chamber-of-momentum.css";
import "@/app/companion/chamber-member-gallery.css";
import "@/app/companion/estate-how-to-guide.css";

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
  const [howToOpen, setHowToOpen] = useState(false);

  const openHowTo = useCallback(() => setHowToOpen(true), []);
  const closeHowTo = useCallback(() => setHowToOpen(false), []);

  useEffect(() => {
    if (consumePendingEstateHowToGuide("chamber-of-momentum")) {
      setHowToOpen(true);
    }
    return subscribeEstateHowToGuideOpen("chamber-of-momentum", openHowTo);
  }, [openHowTo]);

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
          <ChamberActiveMemberCard
            member={activeMember}
            onEndConversation={onEndMemberConversation}
          />
        ) : (
          <ChamberMemberGallery
            activeMemberId={activeMemberId}
            onTalkWithMember={onInviteMember}
            howToOpen={howToOpen}
            onOpenHowTo={openHowTo}
          />
        )}
        <EstateHowToGuide
          content={CHAMBER_HOW_TO_GUIDE}
          open={howToOpen}
          onClose={closeHowTo}
          onPrimaryAction={() => {
            closeHowTo();
            if (activeMember) {
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
