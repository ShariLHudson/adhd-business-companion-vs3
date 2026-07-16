"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MyBusinessEstatePanel } from "@/components/companion/MyBusinessEstatePanel";
import { MyProfilePanel } from "@/components/companion/MyProfilePanel";
import { PeopleIHelpPanel } from "@/components/companion/PeopleIHelpPanel";
import { GrowthProfileRoomPanel } from "@/components/companion/GrowthProfileRoomPanel";
import type { EstateMenuActionId } from "@/lib/estateMenu";
import {
  canonicalizeProfileDestinationOverlay,
  isProfileDestinationOverlay,
  profileDestinationTitle,
  type ProfileDestinationOverlayId,
} from "@/lib/profile/profileDestination";
import "@/app/companion/profile-destination-host.css";

export type ProfileDestinationHostProps = {
  destination: ProfileDestinationOverlayId | null;
  growthProfileEmphasizeTimeline?: boolean;
  onClose: () => void;
  onOpenEstatePlace?: (actionId: EstateMenuActionId) => void;
  onOpenPeopleIHelp?: () => void;
  onOpenSettings?: (
    section?: "tone" | "plan" | "notifications" | "pattern",
  ) => void;
  onOpenExperienceControls?: () => void;
};

/**
 * Dedicated My Spark Estate destinations — body portal.
 * SH menu: My Business Estate + My Profile.
 * People I Help opens as its own overlay (inside MBE hierarchy) for direct links.
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

  const canonical =
    destination && isProfileDestinationOverlay(destination)
      ? canonicalizeProfileDestinationOverlay(destination)
      : null;

  useEffect(() => {
    const root = document.documentElement;
    if (canonical) {
      root.setAttribute("data-profile-destination", canonical);
    } else {
      root.removeAttribute("data-profile-destination");
    }
    return () => {
      root.removeAttribute("data-profile-destination");
    };
  }, [canonical]);

  if (!mounted || !canonical) {
    return null;
  }

  let content: ReactNode = null;
  if (canonical === "profile-personal") {
    content = (
      <MyProfilePanel
        onClose={onClose}
        onOpenSettings={onOpenSettings}
        onOpenExperienceControls={onOpenExperienceControls}
      />
    );
  } else if (canonical === "my-business-estate") {
    content = (
      <MyBusinessEstatePanel
        onClose={onClose}
        onOpenPeopleIHelp={onOpenPeopleIHelp}
      />
    );
  } else if (canonical === "people-i-help") {
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
      data-profile-destination={canonical}
      role="dialog"
      aria-modal="true"
      aria-label={profileDestinationTitle(canonical)}
    >
      <main className="estate-room-main profile-destination-host__main">
        {content}
      </main>
    </div>,
    document.body,
  );
}
