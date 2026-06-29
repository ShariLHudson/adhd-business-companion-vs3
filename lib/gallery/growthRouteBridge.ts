import type { AppSection, SidebarNavId } from "@/lib/companionUi";
import type { GrowthSectionId } from "@/lib/growthNavigation";

/** Asset Library — central media store (section id unchanged for routing). */
export const ASSET_LIBRARY_HOME_SECTION: AppSection = "the-gallery";

/** @deprecated Use ASSET_LIBRARY_HOME_SECTION */
export const GALLERY_HOME_SECTION = ASSET_LIBRARY_HOME_SECTION;

/** Growth hub — section id `growth`; Asset Library is `the-gallery`. */
export function resolveGrowthHubSection(section: AppSection): AppSection {
  return section;
}

/** @deprecated Growth hub is restored — no redirect to Asset Library. */
export function isLegacyGrowthHubSection(_section: AppSection): boolean {
  return false;
}

/** Sidebar nav id for a Grow-area workspace destination. */
export function sidebarNavForGrowthDestination(
  section: AppSection | GrowthSectionId,
): SidebarNavId {
  switch (section) {
    case "evidence-bank":
      return "evidence-bank";
    case "confidence-vault":
      return "confidence-vault";
    case "the-gallery":
    case "growth":
      return "growth";
    case "wins-this-week":
    case "my-journey":
      return "growth";
    case "growth-journal":
      return "journal";
    case "growth-portfolio":
      return "portfolio";
    default:
      return "growth";
  }
}
