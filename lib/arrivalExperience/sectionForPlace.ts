import {
  HOUSE_MAP_NAV,
  type HouseMapNavItem,
} from "@/lib/companionUniverse/companionLayoutSystem";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { AppSection } from "@/lib/companionUi";

const PLACE_SECTION_FALLBACK: Partial<Record<CompanionPlaceId, AppSection>> = {
  "living-room": "home",
  "window-seat": "brain-dump",
  "planning-table": "plan-my-day",
  "kitchen-table": "plan-my-day",
  "creative-studio": "content-generator",
  "reading-nook": "how-do-i",
  "focus-studio": "focus",
  "library": "how-do-i",
};

export function sectionForPlace(placeId: CompanionPlaceId): AppSection {
  const nav: HouseMapNavItem | undefined = HOUSE_MAP_NAV.find(
    (item) => item.placeId === placeId && item.section,
  );
  if (nav?.section) return nav.section;
  return PLACE_SECTION_FALLBACK[placeId] ?? "home";
}
