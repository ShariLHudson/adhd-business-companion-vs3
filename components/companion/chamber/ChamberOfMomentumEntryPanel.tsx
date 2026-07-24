"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EstateHowToGuide } from "@/components/companion/EstateHowToGuide";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowPanelBackButton } from "@/components/companion/GrowPanelBackButton";
import { ChamberActiveMemberCard } from "@/components/companion/chamber/ChamberActiveMemberCard";
import { ChamberMemberGallery } from "@/components/companion/chamber/ChamberMemberGallery";
import { ChamberMemberProfileView } from "@/components/companion/chamber/ChamberMemberProfileView";
import { ChamberPerspectiveGuide } from "@/components/companion/chamber/ChamberPerspectiveGuide";
import { ChamberOfMomentumRoomShell } from "@/components/companion/chamber/ChamberOfMomentumRoomShell";
import {
  getChamberMemberById,
  type ChamberMember,
  type ChamberMemberId,
} from "@/lib/chamber/chamberMemberRegistry";
import type { ChamberViewMode } from "@/lib/chamber/chamberViewMode";
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
  viewMode: ChamberViewMode;
  onViewModeChange: (mode: ChamberViewMode) => void;
  onInviteMember: (
    memberId: ChamberMemberId,
    opts?: ChamberInviteMemberOptions,
  ) => void;
  onEndMemberConversation: () => void;
};

/** Chamber of Momentum — gallery / focused profile / chat identity (one layer). */
export function ChamberOfMomentumEntryPanel({
  onBack,
  activeMemberId,
  viewMode,
  onViewModeChange,
  onInviteMember,
  onEndMemberConversation,
}: Props) {
  const activeMember: ChamberMember | null = activeMemberId
    ? getChamberMemberById(activeMemberId) ?? null
    : null;
  const [howToOpen, setHowToOpen] = useState(false);
  const [browseAllMembers, setBrowseAllMembers] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [profileMemberId, setProfileMemberId] =
    useState<ChamberMemberId | null>(null);
  const [lastSelectedMemberId, setLastSelectedMemberId] =
    useState<ChamberMemberId | null>(null);
  const savedGalleryScrollTop = useRef(0);

  const profileMember =
    (profileMemberId ? getChamberMemberById(profileMemberId) : null) ??
    (viewMode === "member_profile" ? activeMember : null);

  const openHowTo = useCallback(() => setHowToOpen(true), []);
  const closeHowTo = useCallback(() => setHowToOpen(false), []);

  useEffect(() => {
    if (!activeMemberId) {
      setAddingMember(false);
    } else {
      setLastSelectedMemberId(activeMemberId);
    }
  }, [activeMemberId]);

  useEffect(() => {
    if (consumePendingEstateHowToGuide("chamber-of-momentum")) {
      setHowToOpen(true);
    }
    return subscribeEstateHowToGuideOpen("chamber-of-momentum", openHowTo);
  }, [openHowTo]);

  const captureGalleryScroll = useCallback(() => {
    const scroller = document.querySelector(
      '[data-testid="chamber-member-gallery-scroll"]',
    );
    if (scroller instanceof HTMLElement) {
      savedGalleryScrollTop.current = scroller.scrollTop;
    }
  }, []);

  const restoreGalleryScroll = useCallback(() => {
    window.setTimeout(() => {
      const scroller = document.querySelector(
        '[data-testid="chamber-member-gallery-scroll"]',
      );
      if (scroller instanceof HTMLElement) {
        scroller.scrollTop = savedGalleryScrollTop.current;
      }
    }, 0);
  }, []);

  function openMemberProfile(memberId: ChamberMemberId) {
    captureGalleryScroll();
    setProfileMemberId(memberId);
    setLastSelectedMemberId(memberId);
    setAddingMember(false);
    onViewModeChange("member_profile");
  }

  function returnToGallery() {
    setProfileMemberId(null);
    setAddingMember(false);
    onViewModeChange("gallery");
    if (activeMemberId) {
      onEndMemberConversation();
    }
    restoreGalleryScroll();
  }

  function handleTalkWithMember(memberId: ChamberMemberId) {
    const addToConversation = addingMember && Boolean(activeMemberId);
    setAddingMember(false);
    setProfileMemberId(null);
    setLastSelectedMemberId(memberId);
    onViewModeChange("member_chat");
    onInviteMember(
      memberId,
      addToConversation ? { addToConversation: true } : undefined,
    );
  }

  const showProfile =
    viewMode === "member_profile" && Boolean(profileMember);
  const showChatIdentity =
    viewMode === "member_chat" && Boolean(activeMember);
  const showAddMemberGallery = showChatIdentity && addingMember;
  const showMainGallery = viewMode === "gallery" && !showProfile;

  return (
    <ChamberOfMomentumRoomShell>
      <EstateWorkspace
        stageClassName="chamber-entry--members"
        className={[
          "chamber-entry chamber-entry--members grow-room-panel chamber-entry--how-to-host",
          showChatIdentity ? "chamber-entry--conversation" : "",
          showProfile ? "chamber-entry--member-profile" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          data-testid="chamber-entry-view-root"
          data-chamber-view={viewMode}
          data-last-selected-member={lastSelectedMemberId ?? undefined}
        >
        {showMainGallery ? (
          <GrowPanelBackButton onBack={onBack} label="Estate" />
        ) : null}

        {showProfile && profileMember ? (
          <ChamberMemberProfileView
            member={profileMember}
            onReturnToGallery={returnToGallery}
            onTalkWithMember={(member) => handleTalkWithMember(member.id)}
          />
        ) : null}

        {showChatIdentity && activeMember ? (
          <ChamberActiveMemberCard
            member={activeMember}
            onAboutMember={() => openMemberProfile(activeMember.id)}
            onEndConversation={returnToGallery}
            onInviteAnother={() => setAddingMember((prev) => !prev)}
            invitingAnother={addingMember}
          />
        ) : null}

        {showAddMemberGallery ? (
          <div
            className="chamber-entry__add-member"
            data-testid="chamber-add-member-gallery"
          >
            <p className="chamber-entry__add-member-note">
              Choose who to bring into this conversation. Your current thread
              stays.
            </p>
            <ChamberMemberGallery
              activeMemberId={activeMemberId}
              selectedMemberId={lastSelectedMemberId}
              onTalkWithMember={handleTalkWithMember}
              onAboutMember={openMemberProfile}
              howToOpen={howToOpen}
              onOpenHowTo={openHowTo}
            />
          </div>
        ) : null}

        {showMainGallery ? (
          browseAllMembers ? (
            <ChamberMemberGallery
              activeMemberId={activeMemberId}
              selectedMemberId={lastSelectedMemberId}
              onTalkWithMember={handleTalkWithMember}
              onAboutMember={openMemberProfile}
              howToOpen={howToOpen}
              onOpenHowTo={openHowTo}
            />
          ) : (
            <ChamberPerspectiveGuide
              onTalkWithMember={handleTalkWithMember}
              onBrowseAll={() => setBrowseAllMembers(true)}
              onAboutMember={openMemberProfile}
            />
          )
        ) : null}

        <EstateHowToGuide
          content={CHAMBER_HOW_TO_GUIDE}
          open={howToOpen}
          onClose={closeHowTo}
          onPrimaryAction={() => {
            closeHowTo();
            if (activeMember) {
              setAddingMember(false);
              returnToGallery();
              return;
            }
            setBrowseAllMembers(true);
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
        </div>
      </EstateWorkspace>
    </ChamberOfMomentumRoomShell>
  );
}
