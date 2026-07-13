"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MyBusinessEstatePanel } from "@/components/companion/MyBusinessEstatePanel";
import { PeopleIHelpPanel } from "@/components/companion/PeopleIHelpPanel";
import { GrowthProfileRoomPanel } from "@/components/companion/GrowthProfileRoomPanel";
import type { EstateMenuActionId } from "@/lib/estateMenu";
import {
  isProfileDestinationOverlay,
  type ProfileDestinationOverlayId,
} from "@/lib/profile/profileDestination";
import "@/app/companion/profile-destination-host.css";

export type ProfileDestinationHostProps = {
  /** Active profile destination overlay — null when none. */
  destination: ProfileDestinationOverlayId | null;
  growthProfileEmphasizeTimeline?: boolean;
  onClose: () => void;
  onOpenEstatePlace?: (actionId: EstateMenuActionId) => void;
};

/**
 * Dedicated profile destinations — body portal above Welcome Home.
 * Matches BreatheDestinationHost durability: never trapped under session stacking.
 */
export function ProfileDestinationHost({
  destination,
  growthProfileEmphasizeTimeline = false,
  onClose,
  onOpenEstatePlace,
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
  if (destination === "profile") {
    content = <MyBusinessEstatePanel onClose={onClose} />;
  } else if (destination === "people-i-help") {
    content = <PeopleIHelpPanel onClose={onClose} />;
  } else {
    content = (
      <GrowthProfileRoomPanel
        emphasizeTimeline={growthProfileEmphasizeTimeline}
        onOpenEstatePlace={onOpenEstatePlace}
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
      aria-label={
        destination === "profile"
          ? "My Business Estate"
          : destination === "people-i-help"
            ? "People I Help"
            : "Growth Profile"
      }
    >
      <main className="estate-room-main profile-destination-host__main">
        {content}
      </main>
    </div>,
    document.body,
  );
}
