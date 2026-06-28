import type { AppSection, SidebarNavId } from "@/lib/companionUi";
import type { GrowthSectionId } from "@/lib/growthNavigation";

/** The Gallery replaced the old Growth hub 4-box layout. */
export const GALLERY_HOME_SECTION: AppSection = "the-gallery";

export function resolveGrowthHubSection(section: AppSection): AppSection {
  return section === "growth" ? GALLERY_HOME_SECTION : section;
}

export function isLegacyGrowthHubSection(section: AppSection): boolean {
  return section === "growth";
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
    default:
      return "growth";
  }
}
