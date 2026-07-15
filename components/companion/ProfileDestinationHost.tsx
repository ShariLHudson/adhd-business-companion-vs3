"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MyBusinessEstatePanel } from "@/components/companion/MyBusinessEstatePanel";
import { MyProfilePanel } from "@/components/companion/MyProfilePanel";
import { PeopleIHelpPanel } from "@/components/companion/PeopleIHelpPanel";
import { GrowthProfileRoomPanel } from "@/components/companion/GrowthProfileRoomPanel";
import type { EstateMenuActionId } from "@/lib/estateMenu";
import {
  isProfileDestinationOverlay,
  profileDestinationTitle,
  type ProfileDestinationOverlayId,
} from "@/lib/profile/profileDestination";
import "@/app/companion/profile-destination-host.css";

export type ProfileDestinationHostProps = {
  /** Active profile destination overlay — null when none. */
  destination: ProfileDestinationOverlayId | null;
  growthProfileEmphasizeTimeline?: boolean;
  onClose: () => void;
  onOpenEstatePlace?: (actionId: EstateMenuActionId) => void;
  /** Switch from My Business Estate to People I Help without clearing estate data. */
  onOpenPeopleIHelp?: () => void;
  onOpenSettings?: (section?: "tone" | "plan" | "notifications") => void;
  onOpenExperienceControls?: () => void;
};

/**
 * Dedicated profile destinations — body portal above Welcome Home.
 * My Profile, My Business Estate, and People I Help are distinct siblings.
 */
export function ProfileDestinationHost({
  destination,
  growthProfileEmphasizeTimeline = false,
  onClose,
  onOpenEstatePlace,
  onOpenPeopleIHelp,
  onOpenSettings,
  onOpenExperienceControls,
}: ProfileDestinationHostProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const root = document.documentElement;
    if (destination && isProfileDestinationOverlay(destination)) {
      root.setAttribute("data-profile-destination", destination);
    } else {
      root.removeAttribute("data-profile-destination");
    }
    return () => {
      root.removeAttribute("data-profile-destination");
    };
  }, [destination]);

  if (!mounted || !destination || !isProfileDestinationOverlay(destination)) {
    return null;
  }

  let content: ReactNode = null;
  if (destination === "profile-personal") {
    content = (
      <MyProfilePanel
        onClose={onClose}
        onOpenSettings={onOpenSettings}
        onOpenExperienceControls={onOpenExperienceControls}
      />
    );
  } else if (destination === "profile") {
    content = (
      <MyBusinessEstatePanel
        onClose={onClose}
        onOpenPeopleIHelp={onOpenPeopleIHelp}
      />
    );
  } else if (destination === "people-i-help") {
    content = <PeopleIHelpPanel onClose={onClose} />;
  } else {
    content = (
      <GrowthProfileRoomPanel
        emphasizeTimeline={growthProfileEmphasizeTimeline}
        onOpenEstatePlace={onOpenEstatePlace}
        onClose={onClose}
      />
    );
  }

  return createPortal(
    <div
      className="profile-destination-host"
      data-testid="profile-destination-host"
      data-profile-destination={destination}
      role="dialog"
      aria-modal="true"
      aria-label={profileDestinationTitle(destination)}
    >
      <main className="estate-room-main profile-destination-host__main">
        {content}
      </main>
    </div>,
    document.body,
  );
}
