"use client";

import { useEffect, useRef } from "react";

import type { SettingsSection } from "@/components/companion/SettingsPanel";
import type { CoachingMode } from "@/lib/companionPrompt";
import {
  HOMESTEAD_SIGNPOST_ALL,
  HOMESTEAD_SIGNPOST_DESTINATIONS,
  HOMESTEAD_OTHER_DROPDOWN_ITEMS,
} from "@/lib/homesteadSignpost";
import type { AppSection } from "@/lib/companionUi";
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
  [
    ...SIDEBAR_NAV,
    ...MORE_NAV,
    ...HOMESTEAD_SIGNPOST_DESTINATIONS,
    ...HOMESTEAD_OTHER_DROPDOWN_ITEMS,
  ].map((item) => item.id),
);

const GROW_SECTION_IDS = new Set<AppSection>([
  "grow",
  "momentum-builder",
  "grow-momentum-builders",
  "grow-spark-cards",
  "grow-guilds",
  "grow-daily-discoveries",
  "grow-business-history",
  "grow-observatory",
  "quick-recharge",
  "growth",
  "growth-capture",
  "growth-library",
  "growth-reports",
  "user-memory",
  "growth-journal",
  "growth-portfolio",
  "wins-this-week",
  "evidence-bank",
  "confidence-vault",
  "my-journey",
]);

function isSidebarNavId(value: string | null): value is SidebarNavId {
  return Boolean(value && NAV_IDS.has(value as SidebarNavId));
}

/** Applies /companion?nav=…&overlay=… when JS handlers fail and the browser follows href. */
export function CompanionUrlNavigation({
  onNav,
  onOpenSection,
  onOverlay,
  onSettingsSection,
}: {
  onNav: (nav: SidebarNavId, mode?: CoachingMode) => void;
  onOpenSection?: (section: AppSection) => void;
  onOverlay: (overlay: CompanionOverlayParam) => void;
  onSettingsSection: (section: SettingsSection) => void;
}) {
  const onNavRef = useRef(onNav);
  const onOpenSectionRef = useRef(onOpenSection);
  const onOverlayRef = useRef(onOverlay);
  const onSettingsRef = useRef(onSettingsSection);
  onNavRef.current = onNav;
  onOpenSectionRef.current = onOpenSection;
  onOverlayRef.current = onOverlay;
  onSettingsRef.current = onSettingsSection;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nav = params.get("nav");
    const section = params.get("section") as AppSection | null;
    const mode = params.get("mode") as CoachingMode | null;
    const overlay = params.get("overlay");
    const settings = params.get("settings");

    if (section && GROW_SECTION_IDS.has(section)) {
      onOpenSectionRef.current?.(section);
    } else if (isSidebarNavId(nav)) {
      onNavRef.current(nav, mode ?? undefined);
    }

    if (
      overlay === "my-business-estate" ||
      overlay === "profile-personal" ||
      overlay === "people-i-help" ||
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

    if (nav || overlay || settings || section) {
      const next = stripCompanionNavParams(params);
      next.delete("section");
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
