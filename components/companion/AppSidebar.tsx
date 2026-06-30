"use client";

import { ASSETS, BRAND, SECTION_NAV, normalizeSidebarNav, type AppSection, type SidebarNavId } from "@/lib/companionUi";
import { ASSET_LIBRARY_HOME_SECTION } from "@/lib/gallery";
import { isGrowthPanelSection } from "@/lib/growthNavigation";
import { isGrowPanelSection } from "@/lib/growNavigation";
import {
  HOMESTEAD_OTHER_DROPDOWN_ITEMS,
  HOMESTEAD_SIGNPOST_DESTINATIONS,
  isHomesteadOtherNavActive,
  type HomesteadSignpostItem,
} from "@/lib/homesteadSignpost";
import { HomesteadSignpost } from "@/components/companion/homesteadSignpost/HomesteadSignpost";
import type { CoachingMode } from "@/lib/companionPrompt";

const GOOGLE_UTILITIES = [
  { label: "Google Calendar", url: "https://calendar.google.com" },
  { label: "Gmail", url: "https://mail.google.com" },
  { label: "Google Drive", url: "https://drive.google.com" },
] as const;

type AppSidebarProps = {
  activeNav: SidebarNavId;
  activeSection: AppSection;
  onNavSelect: (nav: SidebarNavId, mode?: CoachingMode) => void;
};

export function AppSidebar({
  activeNav,
  activeSection,
  onNavSelect,
}: AppSidebarProps) {
  const normalizedActiveNav = normalizeSidebarNav(activeNav);

  function isItemActive(item: HomesteadSignpostItem): boolean {
    if (item.id === "other") {
      return isHomesteadOtherNavActive(normalizedActiveNav, activeSection);
    }

    if (item.id === "grow") {
      return (
        isGrowPanelSection(activeSection) ||
        activeSection === ASSET_LIBRARY_HOME_SECTION
      );
    }

    if (item.id === "growth") {
      return (
        isGrowthPanelSection(activeSection) ||
        activeSection === "life-experience"
      );
    }

    const sectionFor = SECTION_NAV[item.id];
    if (sectionFor) {
      return (
        activeSection === sectionFor ||
        (activeSection === "home" && normalizedActiveNav === item.id)
      );
    }
    return normalizedActiveNav === item.id && activeSection === "home";
  }

  return (
    <aside
      className="companion-app-sidebar homestead-signpost-sidebar relative flex h-dvh w-16 shrink-0 flex-col overflow-y-auto overflow-x-visible border-r border-[#1a1512] md:w-56"
      aria-label="Homestead navigation"
      data-homestead-signpost=""
    >
      <div className="homestead-signpost-sidebar__brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ASSETS.logo} alt="" className="homestead-signpost-sidebar__logo" />
        <span className="homestead-signpost-sidebar__brand-name">{BRAND.name}</span>
      </div>

      <div className="homestead-signpost-sidebar__nav">
        <HomesteadSignpost
          destinations={HOMESTEAD_SIGNPOST_DESTINATIONS}
          otherMenuItems={HOMESTEAD_OTHER_DROPDOWN_ITEMS}
          isItemActive={isItemActive}
          onSelect={onNavSelect}
        />
      </div>

      <div className="homestead-signpost-sidebar__utilities border-t border-white/8 p-2">
        <div className="homestead-signpost-sidebar__utilities-inner">
          <p className="homestead-signpost-sidebar__utilities-heading">Connected Apps</p>
          {GOOGLE_UTILITIES.map((g) => (
            <a
              key={g.label}
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
              title={g.label}
              className="homestead-signpost-sidebar__utility-link"
            >
              {g.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
