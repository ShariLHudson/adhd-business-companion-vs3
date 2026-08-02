/**
 * Personal Library — canonical full-screen workspace rules (shared, one source).
 *
 * Personal Library is entered from four paths (Wander the Estate, chat
 * navigation, a Spark Card, and My Spark Collection). All of them land on the
 * SAME dedicated, full-bleed room (`PersonalLibraryRoom`). While it is active it
 * owns the whole viewport: no frosted chat composer, and no shared bottom Estate
 * control strip (the Wander / full-screen chrome — "Talk here with Spark",
 * "Exit full screen", previous/next arrows) may cover the approved Find/Search
 * and Recent controls drawn near the bottom of the artwork.
 *
 * These helpers are the single place that decides "is Personal Library the
 * active workspace, and therefore must the global estate chrome step aside" — so
 * Wander, chat, and Spark Card entry never need separate fixes.
 */

import type { AppSection } from "@/lib/companionUi";
import { isDedicatedEstateRoomPanelSection } from "./directEstateVisit";
import { isEstateFullBleedPanelSection } from "./estateFullBleedPanelSections";

export const PERSONAL_LIBRARY_SECTION = "personal-library" as const satisfies AppSection;

/** True when Personal Library is the active workspace. */
export function isPersonalLibraryActive(
  section: AppSection | null | undefined,
): boolean {
  return section === PERSONAL_LIBRARY_SECTION;
}

/**
 * The shared Wander / full-screen bottom control strip (and any global estate
 * bottom chrome) must be hidden while Personal Library owns the viewport. Fix it
 * once here rather than per entry path.
 */
export function suppressesEstateBottomChrome(
  section: AppSection | null | undefined,
): boolean {
  return isPersonalLibraryActive(section);
}

/**
 * Whether the full-screen Explore/Wander map (which mounts the immersive bar:
 * "Talk here with Spark", "Exit full screen", previous/next) may render. It must
 * never render over Personal Library, whichever path the member arrived by. When
 * they leave Personal Library the map returns to whatever it was.
 */
export function estateMapFullScreenVisible(
  exploreSparkMapOpen: boolean,
  section: AppSection | null | undefined,
): boolean {
  return exploreSparkMapOpen && !isPersonalLibraryActive(section);
}

/**
 * Invariant every Personal Library entry path relies on: it is the one canonical
 * full-screen workspace — a dedicated panel (never the frosted chat overlay or a
 * beside-chat workspace) that owns the full viewport (never the max-width
 * companion-panel-surface).
 */
export function isCanonicalFullScreenWorkspace(section: AppSection): boolean {
  return (
    isDedicatedEstateRoomPanelSection(section) &&
    isEstateFullBleedPanelSection(section)
  );
}
