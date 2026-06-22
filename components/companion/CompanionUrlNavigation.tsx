"use client";

import { useEffect, useRef } from "react";

import type { SettingsSection } from "@/components/companion/SettingsPanel";
import type { CoachingMode } from "@/lib/companionPrompt";
import {
  MORE_NAV,
  SIDEBAR_NAV,
  type SidebarNavId,
} from "@/lib/companionUi";
import {
  stripCompanionNavParams,
  type CompanionOverlayParam,
} from "@/lib/companionNavUrl";

const NAV_IDS = new Set(
  [...SIDEBAR_NAV, ...MORE_NAV].map((item) => item.id),
);

function isSidebarNavId(value: string | null): value is SidebarNavId {
  return Boolean(value && NAV_IDS.has(value as SidebarNavId));
}

/** Applies /companion?nav=…&overlay=… when JS handlers fail and the browser follows href. */
export function CompanionUrlNavigation({
  onNav,
  onOverlay,
  onSettingsSection,
}: {
  onNav: (nav: SidebarNavId, mode?: CoachingMode) => void;
  onOverlay: (overlay: CompanionOverlayParam) => void;
  onSettingsSection: (section: SettingsSection) => void;
}) {
  const onNavRef = useRef(onNav);
  const onOverlayRef = useRef(onOverlay);
  const onSettingsRef = useRef(onSettingsSection);
  onNavRef.current = onNav;
  onOverlayRef.current = onOverlay;
  onSettingsRef.current = onSettingsSection;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nav = params.get("nav");
    const mode = params.get("mode") as CoachingMode | null;
    const overlay = params.get("overlay");
    const settings = params.get("settings");

    if (isSidebarNavId(nav)) {
      onNavRef.current(nav, mode ?? undefined);
    }

    if (
      overlay === "profile" ||
      overlay === "settings" ||
      overlay === "signin"
    ) {
      onOverlayRef.current(overlay);
    }

    if (settings) {
      onSettingsRef.current(settings as SettingsSection);
      if (!overlay) onOverlayRef.current("settings");
    }

    if (nav || overlay || settings) {
      const next = stripCompanionNavParams(params);
      const qs = next.toString();
      window.history.replaceState(
        {},
        "",
        qs ? `/companion?${qs}` : "/companion",
      );
    }
  }, []);

  return null;
}
